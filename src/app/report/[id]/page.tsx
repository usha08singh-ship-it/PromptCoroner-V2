import { createAdminClient } from '@/lib/supabase/server';
import { DiagnosisCard } from '@/components/DiagnosisCard';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const adminSupabase = createAdminClient();
  const { data: report } = await adminSupabase
      .from('reports')
      .select('verdict, original_prompt')
      .eq('id', params.id)
      .single();

  if (!report) return { title: 'Report Not Found' };

  return {
    title: `PromptCoroner: ${report.verdict} prompt detected`,
    description: report.original_prompt.slice(0, 120) + (report.original_prompt.length > 120 ? '...' : ''),
  };
}

export default async function ReportPage({ params }: { params: { id: string } }) {
  const adminSupabase = createAdminClient();
  
  const { data: report } = await adminSupabase
      .from('reports')
      .select('*')
      .eq('id', params.id)
      .single();

  if (!report) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-4">404 - Report Not Found</h1>
        <p className="text-neutral-400 mb-8">The forensic report you are looking for does not exist or has been deleted.</p>
        <Link href="/" className="text-[#7F77DD] hover:underline">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center pt-20 pb-32 px-4 relative">
      <div className="max-w-3xl w-full mb-8">
        <h1 className="text-2xl text-neutral-400 font-medium">Prompt Forensic Report</h1>
      </div>
      
      <DiagnosisCard 
        score={report.score}
        verdict={report.verdict}
        failures={report.failures}
        rewrittenPrompt={report.rewritten_prompt}
        reportId={report.id}
      />

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 w-full bg-neutral-900 border-t border-neutral-800 p-4 flex justify-center z-40">
        <Link href="/">
          <button className="bg-[#7F77DD] hover:bg-[#6c64c7] text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:-translate-y-1">
            Diagnose your own prompt →
          </button>
        </Link>
      </div>
    </div>
  );
}
