import { getProjects } from '@/app/actions/projects';
import { CreateProjectModal } from '@/components/dashboard/CreateProjectModal';
import Link from 'next/link';
import { FolderKanban, Plus, Clock } from 'lucide-react';

export default async function DashboardPage() {
  const projects = await getProjects();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">Manage your prompt workspaces and versions.</p>
        </div>
        <CreateProjectModal />
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-slate-700/50 rounded-2xl bg-slate-900/20">
          <FolderKanban className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="text-xl font-medium text-slate-300">No projects yet</h3>
          <p className="text-slate-500 mb-6 mt-1 text-center max-w-sm">Create your first project to start saving and versioning your prompts.</p>
          {/* Note: In a real implementation we'd trigger the modal from here too, but for simplicity we'll just point to the top right button */}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <Link 
              href={`/dashboard/projects/${project.id}`} 
              key={project.id}
              className="group block p-6 rounded-2xl bg-[#111] border border-slate-800/60 hover:border-cyan-500/50 hover:bg-[#161616] transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-brand-purple/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors">{project.name}</h3>
              <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                {project.description || 'No description provided.'}
              </p>
              
              <div className="mt-6 flex items-center text-xs text-slate-500 gap-2">
                <Clock className="w-4 h-4" />
                {new Date(project.created_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
