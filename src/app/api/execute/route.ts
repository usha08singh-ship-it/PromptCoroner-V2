import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@/lib/supabase/server';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId, prompt, variables, models, kbId } = await req.json();

    if (!prompt || !models || !Array.isArray(models)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Inject variables into prompt
    let finalPrompt = prompt;
    if (variables) {
      Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        finalPrompt = finalPrompt.replace(regex, variables[key]);
      });
    }

    // RAG: Fetch context if kbId is provided
    if (kbId) {
      try {
        // 1. Embed the user's prompt (or the injected prompt)
        const embedRes = await fetch('https://api.groq.com/openai/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            input: finalPrompt,
            model: 'nomic-embed-text-v1_5'
          })
        });
        
        if (embedRes.ok) {
          const embedData = await embedRes.json();
          const queryEmbedding = embedData.data[0].embedding;
          
          // 2. Search Supabase
          const { data: chunks, error } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_count: 5, // Top 5 chunks
            kb_id_filter: kbId
          });

          if (!error && chunks && chunks.length > 0) {
            const contextText = chunks.map((c: any) => c.content).join('\n\n');
            finalPrompt = `You have been provided with the following Knowledge Base context to help you answer or complete the prompt:\n\n<context>\n${contextText}\n</context>\n\nUser Prompt:\n${finalPrompt}`;
          } else if (error) {
            console.error('RPC Error:', error);
          }
        }
      } catch (err) {
        console.error('RAG Error:', err);
      }
    }

    // Execute against all models in parallel
    const promises = models.map(async (modelName) => {
      const startTime = Date.now();
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: finalPrompt }],
          model: modelName,
          temperature: 0.7,
          max_tokens: 1024,
        });

        const latency = Date.now() - startTime;
        const tokens = chatCompletion.usage?.total_tokens || 0;

        // Log to database
        if (templateId) {
          await supabase.from('execution_logs').insert([{
            user_id: user.id,
            template_id: templateId,
            model: modelName,
            tokens: tokens,
            latency_ms: latency
          }]);
        }

        return {
          model: modelName,
          output: chatCompletion.choices[0]?.message?.content || '',
          latency,
          tokens,
        };
      } catch (err: any) {
        return {
          model: modelName,
          output: `Error: ${err.message}`,
          latency: Date.now() - startTime,
          tokens: 0,
        };
      }
    });

    const results = await Promise.all(promises);

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Execution API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
