import { getProject, getTemplates } from '@/app/actions/templates';
import { getKnowledgeBases } from '@/app/actions/knowledge';
import { getProjectMembers } from '@/app/actions/members';
import { CreateTemplateModal } from '@/components/dashboard/CreateTemplateModal';
import { KnowledgeBaseSection } from '@/components/dashboard/KnowledgeBaseSection';
import { ProjectMembersModal } from '@/components/dashboard/ProjectMembersModal';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText, GitBranch, Terminal } from 'lucide-react';

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id);
  
  if (!project) {
    notFound();
  }

  const templates = await getTemplates(params.id);
  const kbs = await getKnowledgeBases(params.id);
  const members = await getProjectMembers(params.id);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-white">{project.name}</h1>
            <p className="text-slate-400 mt-1">{project.description || 'No description'}</p>
          </div>
          <div className="flex items-center gap-3">
            <ProjectMembersModal projectId={project.id} members={members} />
            <CreateTemplateModal projectId={project.id} />
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-[#161616]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-500" />
            Prompt Templates
          </h2>
        </div>
        
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <FileText className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-slate-400">No prompt templates yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {templates.map((template: any) => (
              <Link
                key={template.id}
                href={`/dashboard/prompts/${template.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:border-cyan-500/50 transition-colors">
                    <FileText className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium group-hover:text-cyan-400 transition-colors">{template.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Created {new Date(template.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <GitBranch className="w-4 h-4" />
                    {template.prompt_versions?.[0]?.count || 0} versions
                  </div>
                  <div className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                    Edit Prompt
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <KnowledgeBaseSection projectId={project.id} initialKBs={kbs} />
    </div>
  );
}
