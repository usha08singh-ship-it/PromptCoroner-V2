'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getTemplateDetails(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: template, error } = await supabase
    .from('prompt_templates')
    .select('*, projects(name)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching template:', error);
    return null;
  }

  return template;
}

export async function getVersions(templateId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: versions, error } = await supabase
    .from('prompt_versions')
    .select('*')
    .eq('template_id', templateId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching versions:', error);
    return [];
  }

  return versions;
}

export async function saveVersion(templateId: string, promptText: string, commitMessage: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('prompt_versions')
    .insert([{ 
      template_id: templateId, 
      prompt_text: promptText, 
      commit_message: commitMessage || 'Updated prompt' 
    }])
    .select()
    .single();

  if (error) {
    console.error('Error saving version:', error);
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/prompts/${templateId}`);
  return data;
}
