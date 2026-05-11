'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getKnowledgeBases(projectId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: kbs, error } = await supabase
    .from('knowledge_bases')
    .select('*, document_chunks(count)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching knowledge bases:', error);
    return [];
  }

  return kbs || [];
}

export async function createKnowledgeBase(projectId: string, name: string, description: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: kb, error } = await supabase
    .from('knowledge_bases')
    .insert([{ project_id: projectId, name, description }])
    .select()
    .single();

  if (error) {
    console.error('Error creating KB:', error);
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  return kb;
}

// Simple chunking function (split by double newline or fixed length)
function chunkText(text: string, maxChunkLength: number = 1000): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const p of paragraphs) {
    if ((currentChunk.length + p.length) > maxChunkLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += p + '\n\n';
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export async function processDocumentAndUpload(kbId: string, filename: string, textContent: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const chunks = chunkText(textContent);
  
  for (const chunk of chunks) {
    try {
      // For RAG, we use a nomic embed text model.
      // Note: Groq SDK structure for embeddings might vary, assuming standard OpenAI compatible format
      const response = await fetch('https://api.groq.com/openai/v1/embeddings', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              input: chunk,
              model: 'nomic-embed-text-v1_5'
          })
      });
      
      if (!response.ok) {
          throw new Error(`Embedding failed: ${response.statusText}`);
      }
      
      const embeddingData = await response.json();
      const embedding = embeddingData.data[0].embedding;

      const { error } = await supabase.from('document_chunks').insert([{
        kb_id: kbId,
        content: chunk,
        embedding: embedding,
        metadata: { filename }
      }]);

      if (error) {
        console.error('Error inserting chunk:', error);
      }
    } catch(err) {
      console.error('Error processing chunk:', err);
    }
  }

  return { success: true, chunksProcessed: chunks.length };
}

export async function deleteKnowledgeBase(kbId: string, projectId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) throw new Error('Not authenticated');
  
    await supabase.from('knowledge_bases').delete().eq('id', kbId);
    revalidatePath(`/dashboard/projects/${projectId}`);
}
