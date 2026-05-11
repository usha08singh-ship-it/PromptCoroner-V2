import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { utr_number, email } = await req.json();

    if (!utr_number || typeof utr_number !== 'string' || !/^\d{12}$/.test(utr_number)) {
      return NextResponse.json({ error: 'invalid_utr' }, { status: 400 });
    }

    const supabase = createClient();
    const adminSupabase = createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();

    // If no user yet (completely anonymous), we shouldn't really record standard payments without context, but we will allow it via email for simplicity
    const userId = user?.id || null;

    const { error } = await adminSupabase
        .from('payment_requests')
        .insert({
            user_id: userId,
            email: email || user?.email || 'anonymous',
            utr_number,
            status: 'pending'
        });

    if (error) {
        console.error("Payment insert err:", error);
        return NextResponse.json({ error: 'db_error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
