'use server';

import { createClient } from '@/lib/supabase/server';

export async function getAnalyticsData() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: logs, error } = await supabase
    .from('execution_logs')
    .select('*, prompt_templates(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true }); // Ascending for chronological charts

  if (error) {
    console.error('Error fetching analytics:', error);
    return { logs: [], stats: { totalCalls: 0, totalTokens: 0, avgLatency: 0 } };
  }

  const validLogs = logs || [];

  // Calculate high-level stats
  const totalCalls = validLogs.length;
  const totalTokens = validLogs.reduce((acc, log) => acc + (log.tokens || 0), 0);
  const avgLatency = totalCalls > 0 
    ? Math.round(validLogs.reduce((acc, log) => acc + (log.latency_ms || 0), 0) / totalCalls) 
    : 0;

  return { logs: validLogs, stats: { totalCalls, totalTokens, avgLatency } };
}
