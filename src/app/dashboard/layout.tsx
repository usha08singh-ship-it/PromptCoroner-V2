import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a] text-slate-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar userEmail={user.email} />
        <main className="flex-1 overflow-y-auto p-6 relative">
           {/* Ambient background for dashboard */}
           <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
           <div className="relative z-10 h-full">
             {children}
           </div>
        </main>
      </div>
    </div>
  );
}
