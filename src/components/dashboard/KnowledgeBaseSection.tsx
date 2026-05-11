'use client';

import { useState } from 'react';
import { Database, Upload, Trash2, Plus, X, FileText } from 'lucide-react';
import { createKnowledgeBase, processDocumentAndUpload, deleteKnowledgeBase } from '@/app/actions/knowledge';

export function KnowledgeBaseSection({ projectId, initialKBs }: { projectId: string, initialKBs: any[] }) {
  const [kbs, setKbs] = useState(initialKBs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // File upload state
  const [uploadingKbId, setUploadingKbId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const newKb = await createKnowledgeBase(projectId, name, description);
      setKbs([{...newKb, document_chunks: [{count: 0}]}, ...kbs]);
      setIsOpen(false);
      setName('');
      setDescription('');
    } catch(err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (kbId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingKbId(kbId);
    
    try {
      const text = await file.text(); // Read file as text (assuming txt or md for now)
      await processDocumentAndUpload(kbId, file.name, text);
      
      // Optimistically update chunk count
      setKbs(kbs.map(kb => {
        if (kb.id === kbId) {
            const currentCount = kb.document_chunks?.[0]?.count || 0;
            return {...kb, document_chunks: [{count: currentCount + 10}]}; // Just a placeholder bump
        }
        return kb;
      }));
      alert('Document processed and added to Knowledge Base!');
    } catch(err) {
      console.error(err);
      alert('Failed to process document. Make sure it is a valid text file.');
    } finally {
      setUploadingKbId(null);
      e.target.value = ''; // Reset input
    }
  };

  const setIsOpen = setIsModalOpen;

  return (
    <div className="bg-[#111] border border-slate-800 rounded-2xl overflow-hidden mt-8">
      <div className="p-4 border-b border-slate-800 bg-[#161616] flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-brand-purple" />
          Knowledge Bases (RAG Context)
        </h2>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-purple hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New KB
        </button>
      </div>
      
      {kbs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center px-4">
          <Database className="w-10 h-10 text-slate-600 mb-3" />
          <p className="text-slate-400">No knowledge bases yet. Create one to upload context for your prompts.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {kbs.map((kb) => (
            <div key={kb.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center border border-brand-purple/20">
                  <Database className="w-5 h-5 text-brand-purple" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{kb.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {kb.description || 'No description'} • {kb.document_chunks?.[0]?.count || 0} chunks
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    uploadingKbId === kb.id 
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}>
                  {uploadingKbId === kb.id ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                      <Upload className="w-3.5 h-3.5" />
                  )}
                  Upload Document
                  <input 
                    type="file" 
                    accept=".txt,.md,.csv" 
                    className="hidden" 
                    disabled={uploadingKbId === kb.id}
                    onChange={(e) => handleFileUpload(kb.id, e)}
                  />
                </label>
                
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this Knowledge Base?')) {
                        await deleteKnowledgeBase(kb.id, projectId);
                        setKbs(kbs.filter(k => k.id !== kb.id));
                    }
                  }}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-purple to-cyan-500"></div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Create Knowledge Base</h2>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Product Documentation"
                    className="w-full bg-[#050505] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What kind of documents go here?"
                    className="w-full bg-[#050505] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                  />
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="bg-brand-purple hover:bg-purple-600 text-white px-5 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
