import { getTemplateDetails, getVersions } from '@/app/actions/versions';
import { getKnowledgeBases } from '@/app/actions/knowledge';
import { PromptEditorClient } from '@/components/dashboard/PromptEditorClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';

export default async function PromptEditorPage({ params }: { params: { id: string } }) {
  const template = await getTemplateDetails(params.id);
  
  if (!template) {
    notFound();
  }

  const versions = await getVersions(params.id);
  const kbs = await getKnowledgeBases(template.project_id);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <Link href={`/dashboard/projects/${template.project_id}`} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to {template.projects?.name || 'Project'}
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-white">{template.name}</h1>
              <p className="text-slate-400 text-sm mt-1">Prompt Editor & Versioning</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[500px]">
        <PromptEditorClient templateId={template.id} initialVersions={versions} projectKbs={kbs} />
      </div>
    </div>
  );
}
