import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { request_id, action } = await req.json(); // action = 'approve' | 'reject'

    const supabase = createClient();
    const adminSupabase = createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { data: PR, error: prErr } = await adminSupabase
        .from('payment_requests')
        .update({ status: newStatus })
        .eq('id', request_id)
        .select()
        .single();
    
    if (prErr || !PR) {
        return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    if (newStatus === 'approved' && PR.user_id) {
        // Calculate expiration date (30 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        await adminSupabase
            .from('profiles')
            .update({ 
                is_pro: true,
                pro_expires_at: expiryDate.toISOString()
            })
            .eq('id', PR.user_id);
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch(err) {
      return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
