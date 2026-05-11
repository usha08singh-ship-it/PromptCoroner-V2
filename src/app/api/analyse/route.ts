export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'invalid_prompt' }, { status: 400 });
    }

    const supabase = createClient();
    const adminSupabase = createAdminClient();

    // Get the current authenticated user (either real or anonymous)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Fetch profile for is_pro and expiration status
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('is_pro, pro_expires_at')
      .eq('id', userId)
      .single();

    // Check if user is truly Pro (is_pro = true AND expires_at is in the future)
    let isPro = false;
    if (profile?.is_pro && profile.pro_expires_at) {
        const expiresAt = new Date(profile.pro_expires_at);
        if (expiresAt > new Date()) {
            isPro = true;
        }
    }

    // Use YYYY-MM to strictly enforce a monthly limit, rather than daily
    const currentMonth = new Date().toISOString().slice(0, 7); 

    // Check usage
    let currentUsageCount = 0;
    const { data: usageData } = await adminSupabase
      .from('usage')
      .select('count')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .single();

    if (usageData) {
      currentUsageCount = usageData.count;
    }

    if (!isPro && currentUsageCount >= 5) {
      return NextResponse.json({ error: 'limit_reached' }, { status: 403 });
    }

    // Call Groq
    const msg = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // Fast, reasoning-capable model
        messages: [
            {
                role: 'system',
                content: `You are PromptCoroner — a forensic analyst specialising in diagnosing broken, weak, and poorly written AI prompts.

When given a prompt, you must:

1. Score it from 0 to 100 on an Ambiguity Scale where:
   - 0–30 = Critically broken
   - 31–60 = Weak
   - 61–85 = Acceptable
   - 86–100 = Strong

2. Identify exactly 3 to 5 failure categories from this list only:
   - Vague Intent
   - Missing Context
   - Conflicting Instructions
   - No Output Format Specified
   - Hallucination Risk
   - Weak Persona
   - Scope Creep

   Only include a category if it genuinely applies.

3. Write a rewritten version of the prompt that fixes all identified issues.

RULES:
- Respond ONLY with valid JSON. No preamble, no markdown, no code fences.

RESPONSE FORMAT:
{
  "score": <integer 0-100>,
  "verdict": "<Critically Broken | Weak | Acceptable | Strong>",
  "failures": [
    { "category": "<name>", "explanation": "<1-2 sentences specific to this prompt>" }
  ],
  "rewritten_prompt": "<the improved prompt>"
}`
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        response_format: { type: 'json_object' }
    });

    let rawOutput = msg.choices[0]?.message?.content || '';

    if (!rawOutput) {
        throw new Error('Unexpected empty response format from Groq');
    }

    // Parse JSON
    const cleanOutput = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    let result;
    try {
        result = JSON.parse(cleanOutput);
    } catch (e) {
        console.error("Failed to parse JSON from Groq:", cleanOutput);
        return NextResponse.json({ error: 'analysis_failed' }, { status: 500 });
    }

    // Insert Report
    const { data: reportInsert, error: reportErr } = await adminSupabase
        .from('reports')
        .insert({
            user_id: userId,
            original_prompt: prompt,
            score: result.score,
            verdict: result.verdict,
            failures: result.failures,
            rewritten_prompt: result.rewritten_prompt
        })
        .select('id')
        .single();
    
    if (reportErr) {
        console.error("Report Insert Error:", reportErr);
        return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }

    // Increment Usage
    const newCount = currentUsageCount + 1;
    const { error: usageErr } = await adminSupabase
        .from('usage')
        .upsert({ user_id: userId, month: currentMonth, count: newCount }, { onConflict: 'user_id,month' });

    if (usageErr) {
        console.error("Usage Update Error:", usageErr);
        return NextResponse.json({ error: 'usage_update_failed', details: usageErr }, { status: 500 });
    }

    return NextResponse.json({
        ...result,
        report_id: reportInsert.id,
        current_usage: newCount
    });

  } catch (err: any) {
    console.error("Analyse API Error:", err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
