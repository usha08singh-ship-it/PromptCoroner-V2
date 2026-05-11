import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminPaymentsClient } from './client';

export default async function AdminPaymentsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== process.env.ADMIN_EMAIL) {
        redirect('/');
    }

    // Since we are the admin, we can fetch all payment_requests safely.
    // In strict RLS mode, we might need the adminSupabase client to fetch rows if RLS prevents admin reading others' rows.
    // However, it's safer to use a server component and pass data to a client component, or fetch via admin client.
    
    // Instead of passing complex data and fetching here, we'll let the client component fetch via an admin helper or we'll fetch here using Admin Client:
    const { createAdminClient } = await import('@/lib/supabase/server');
    const adminSupabase = createAdminClient();

    const { data: requests } = await adminSupabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
            <h1 className="text-3xl font-bold mb-8">Pending Payments</h1>
            <AdminPaymentsClient initialRequests={requests || []} />
        </div>
    );
}
