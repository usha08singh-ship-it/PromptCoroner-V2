'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getProject(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  return project;
}

export async function getTemplates(projectId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: templates, error } = await supabase
    .from('prompt_templates')
    .select('*, prompt_versions(count)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }

  return templates || [];
}

export async function createTemplate(projectId: string, name: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // 1. Create the template
  const { data: template, error: templateError } = await supabase
    .from('prompt_templates')
    .insert([{ project_id: projectId, name }])
    .select()
    .single();

  if (templateError) {
    console.error('Error creating template:', templateError);
    throw new Error(templateError.message);
  }

  // 2. Create the initial version
  const { error: versionError } = await supabase
    .from('prompt_versions')
    .insert([{ 
      template_id: template.id, 
      prompt_text: '', 
      commit_message: 'Initial commit' 
    }]);

  if (versionError) {
      console.error('Error creating initial version:', versionError);
      // We don't necessarily throw here, template was created.
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  return template;
}
