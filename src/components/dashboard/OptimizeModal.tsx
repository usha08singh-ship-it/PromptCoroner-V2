'use client';

import { useState } from 'react';
import { Sparkles, X, ArrowRight, Save } from 'lucide-react';

export function OptimizeModal({ 
  currentPrompt, 
  onApply 
}: { 
  currentPrompt: string, 
  onApply: (optimizedText: string, commitMsg: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [error, setError] = useState('');

  const handleOptimize = async () => {
    if (!currentPrompt.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt, goal })
      });
      
      const data = await res.json();
      if (res.ok) {
        setOptimizedPrompt(data.optimizedPrompt);
      } else {
        setError(data.error || 'Failed to optimize prompt');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during optimization');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    onApply(optimizedPrompt, `Optimized prompt: ${goal || 'Auto-improvement'}`);
    setIsOpen(false);
    setOptimizedPrompt('');
    setGoal('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-brand-purple/20 text-brand-purple hover:bg-brand-purple hover:text-white rounded-lg transition-colors border border-brand-purple/30"
      >
        <Sparkles className="w-3.5 h-3.5" /> Auto-Optimize
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-purple to-brand-pink"></div>
            
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#161616]">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-purple" />
                AI Prompt Optimization
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Optimization Goal (Optional)</label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Make it more concise, Optimize for code generation, Use chain of thought..."
                    className="w-full bg-[#050505] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                  />
                </div>
                <button
                  onClick={handleOptimize}
                  disabled={loading || !currentPrompt.trim()}
                  className="bg-brand-purple hover:bg-purple-600 disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Optimize
                </button>
              </div>

              {optimizedPrompt && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-400">Original Prompt</span>
                    <div className="bg-[#050505] border border-slate-800 rounded-xl p-4 text-sm text-slate-500 font-mono whitespace-pre-wrap h-64 overflow-y-auto">
                      {currentPrompt}
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center items-center md:hidden">
                    <ArrowRight className="w-6 h-6 text-slate-600 rotate-90" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-brand-purple">Optimized Result</span>
                    <div className="bg-[#161616] border border-brand-purple/50 rounded-xl p-4 text-sm text-white font-mono whitespace-pre-wrap h-64 overflow-y-auto shadow-[0_0_20px_rgba(168,85,247,0.1)] inset-0">
                      {optimizedPrompt}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {optimizedPrompt && (
              <div className="p-4 border-t border-slate-800 bg-[#161616] flex justify-end gap-3">
                  <button
                      onClick={() => {
                        setOptimizedPrompt('');
                        setGoal('');
                      }}
                      className="px-5 py-2 text-slate-400 hover:text-white rounded-xl text-sm font-medium transition-colors"
                  >
                      Discard
                  </button>
                  <button
                      onClick={handleApply}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                  >
                      <Save className="w-4 h-4" />
                      Apply & Save Version
                  </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
