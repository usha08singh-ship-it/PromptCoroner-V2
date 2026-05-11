'use client';

import { useState } from 'react';
import { Users, UserPlus, X, ShieldAlert } from 'lucide-react';
import { addProjectMember } from '@/app/actions/members';

export function ProjectMembersModal({ projectId, members }: { projectId: string, members: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await addProjectMember(projectId, email);
      setEmail('');
      // In a real app we'd update local state, but server action revalidates path
      // so we can just let it refresh or close modal
      alert('User invited successfully!');
    } catch(err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700"
      >
        <Users className="w-3.5 h-3.5" /> Team ({members.length + 1})
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-500"></div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  Project Team
                </h2>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl mb-4 flex gap-2 items-start">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleInvite} className="flex gap-2 mb-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Invite by email..."
                  className="flex-1 bg-[#050505] border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  Invite
                </button>
              </form>

              <div className="space-y-3">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Current Members</h3>
                {members.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No external members invited yet.</p>
                ) : (
                  members.map((m, i) => (
                    <div key={i} className="flex justify-between items-center bg-[#161616] border border-slate-800 p-3 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-white">{m.profiles?.email}</p>
                        <p className="text-xs text-slate-500 capitalize">{m.role}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-[#161616] flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
