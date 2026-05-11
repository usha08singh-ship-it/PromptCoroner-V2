'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addProjectMember(projectId: string, email: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Find user by email
  const { data: targetUser, error: userError } = await supabase
    .from('profiles') // Assuming profiles has an email or we match by some identifier. Wait, supabase doesn't expose auth.users by email publicly.
    .select('id')
    .eq('email', email)
    .single();

  if (userError || !targetUser) {
    // Actually, profiles table might not have email by default. 
    // Usually we create an RPC for this, or just search the `profiles` table.
    throw new Error('User not found. They must sign up first.');
  }

  const { error } = await supabase
    .from('project_members')
    .insert([{ project_id: projectId, user_id: targetUser.id, role: 'editor' }]);

  if (error) {
    if (error.code === '23505') throw new Error('User is already a member.');
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function getProjectMembers(projectId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('project_members')
    .select('role, user_id, profiles(email, full_name)')
    .eq('project_id', projectId);

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }
  return data;
}
