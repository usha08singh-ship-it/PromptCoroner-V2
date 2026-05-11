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

    const { prompt, goal } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert Prompt Engineer. Your task is to optimize the user's prompt to make it more effective for an LLM to understand and execute.
If the user provides a specific goal (like "make it shorter" or "optimize for code generation"), follow that goal. Otherwise, just improve clarity, structure, and add necessary constraints.
CRITICAL: You must preserve any variables in the original prompt that look like {{variable_name}}. Do not change their syntax.
Output ONLY the optimized prompt text. Do not include any introductory or concluding remarks.`;

    const userMessage = `Original Prompt:
${prompt}

Optimization Goal (if any): ${goal || 'General improvement'}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      model: 'llama3-70b-8192', // Use a high-capability model for reasoning/optimization
      temperature: 0.3, // Lower temperature for more focused outputs
      max_tokens: 2048,
    });

    const optimizedPrompt = chatCompletion.choices[0]?.message?.content?.trim() || '';

    return NextResponse.json({ optimizedPrompt });
  } catch (error: any) {
    console.error('Optimization API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
