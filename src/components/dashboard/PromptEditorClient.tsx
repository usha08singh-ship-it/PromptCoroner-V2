'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, History, Play, Check, Beaker, Terminal, Users } from 'lucide-react';
import { saveVersion } from '@/app/actions/versions';
import { ExportCodeModal } from '@/components/dashboard/ExportCodeModal';
import { OptimizeModal } from '@/components/dashboard/OptimizeModal';

import * as Y from 'yjs';
import { TextAreaBinding } from 'y-textarea';
import { createBrowserClient } from '@supabase/ssr';

const highlightVariables = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return parts.map((part, i) => {
    if (part.startsWith('{{') && part.endsWith('}}')) {
      return (
        <span key={i} className="text-brand-pink bg-brand-pink/10 rounded px-1 py-0.5 font-medium">
          {part}
        </span>
      );
    }
    return part;
  });
};

const extractVariables = (text: string) => {
  const matches = text.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map(m => m.slice(2, -2).trim())));
};

export function PromptEditorClient({ 
  templateId, 
  initialVersions,
  projectKbs = []
}: { 
  templateId: string, 
  initialVersions: any[],
  projectKbs?: any[]
}) {
  const latestVersion = initialVersions[0];
  const [promptText, setPromptText] = useState(latestVersion?.prompt_text || '');
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [versions, setVersions] = useState(initialVersions);
  const [activeTab, setActiveTab] = useState<'editor' | 'playground'>('editor');
  
  // Playground state
  const [variables, setVariables] = useState<string[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [selectedKbId, setSelectedKbId] = useState<string>('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);

  const hasChanges = promptText !== versions[0]?.prompt_text;

  // Yjs Collaboration State
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ydocRef = useRef<Y.Doc | null>(null);

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  useEffect(() => {
    if (!textareaRef.current) return;

    const doc = new Y.Doc();
    ydocRef.current = doc;
    const ytext = doc.getText('prompt');
    
    const binding = new TextAreaBinding(ytext, textareaRef.current);
    
    // Setup Supabase Realtime
    const channel = supabase.channel(`prompt-${templateId}`, {
      config: { broadcast: { self: false }, presence: { key: 'user' } }
    });

    // Yjs sync
    doc.on('update', (update) => {
      channel.send({
        type: 'broadcast',
        event: 'yjs-update',
        payload: { update: Array.from(update) }
      });
    });

    channel.on('broadcast', { event: 'yjs-update' }, ({ payload }) => {
      Y.applyUpdate(doc, new Uint8Array(payload.update));
    });

    // Presence (Multiplayer Cursor / User Count)
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const count = Object.keys(state).length;
      setOnlineCount(count === 0 ? 1 : count); // At least self
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.track({ online_at: new Date().toISOString() });
        
        // Initial load
        if (ytext.toString() === '') {
          ytext.insert(0, latestVersion?.prompt_text || '');
        }
      }
    });

    // React state sync for UI overlay
    const observer = () => {
      setPromptText(ytext.toString());
      setSaved(false);
    };
    ytext.observe(observer);

    return () => {
      binding.destroy();
      doc.destroy();
      supabase.removeChannel(channel);
    };
  }, [templateId, supabase, latestVersion?.prompt_text]);

  // Handle external updates (like Auto-Optimize)
  const replacePromptText = (newText: string) => {
    if (ydocRef.current) {
      const ytext = ydocRef.current.getText('prompt');
      ytext.delete(0, ytext.length);
      ytext.insert(0, newText);
    } else {
      setPromptText(newText);
    }
  };

  // Update variables when prompt text changes
  useEffect(() => {
    const extracted = extractVariables(promptText);
    setVariables(extracted);
    
    setVariableValues(prev => {
      const newVals = { ...prev };
      Object.keys(newVals).forEach(key => {
        if (!extracted.includes(key)) delete newVals[key];
      });
      extracted.forEach(key => {
        if (newVals[key] === undefined) newVals[key] = '';
      });
      return newVals;
    });
  }, [promptText]);

  const handleTest = async () => {
    setTesting(true);
    setTestResults([]);
    
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          prompt: promptText,
          variables: variableValues,
          kbId: selectedKbId || null,
          models: ['llama3-8b-8192', 'llama3-70b-8192']
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setTestResults(data.results || []);
      } else {
        alert(data.error || 'Failed to execute prompt');
      }
    } catch(err) {
      console.error(err);
      alert('An error occurred during testing.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex h-full gap-6">
      <div className="flex-1 flex flex-col h-full bg-[#111] border border-slate-800 rounded-2xl overflow-hidden">
        
        {/* Tabs and Export */}
        <div className="flex items-center justify-between p-2 border-b border-slate-800 bg-[#161616]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                activeTab === 'editor' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-4 h-4" /> Editor
            </button>
            <button
              onClick={() => setActiveTab('playground')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                activeTab === 'playground' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Beaker className="w-4 h-4" /> Playground
              {variables.length > 0 && (
                <span className="bg-brand-pink/20 text-brand-pink text-[10px] px-1.5 py-0.5 rounded-full">
                  {variables.length}
                </span>
              )}
            </button>
            
            {/* Multiplayer indicator */}
            {onlineCount > 1 && (
              <div className="ml-4 flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                {onlineCount} Online
              </div>
            )}
          </div>
          <div className="pr-2 flex items-center gap-2">
            <OptimizeModal 
              currentPrompt={promptText} 
              onApply={async (optimizedText, commitMsg) => {
                setLoading(true);
                try {
                  replacePromptText(optimizedText);
                  const newVersion = await saveVersion(templateId, optimizedText, commitMsg);
                  setVersions([newVersion, ...versions]);
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2000);
                } catch(e) {
                  console.error(e);
                } finally {
                  setLoading(false);
                }
              }} 
            />
            <ExportCodeModal prompt={promptText} variables={variables} />
          </div>
        </div>
        
        {activeTab === 'editor' ? (
          <>
            <div className="relative flex-1 p-6 overflow-hidden">
              {/* Highlight layer */}
              <div 
                className="absolute inset-6 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words pointer-events-none text-transparent z-0"
                aria-hidden="true"
              >
                {highlightVariables(promptText)}
              </div>
              
              {/* Input layer - Uncontrolled component managed by Yjs */}
              <textarea
                ref={textareaRef}
                placeholder="Enter your prompt here. Use {{variable}} to define dynamic inputs."
                className="absolute inset-6 w-[calc(100%-3rem)] h-[calc(100%-3rem)] p-4 bg-transparent text-slate-300 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-brand-purple/50 rounded-xl z-10"
                spellCheck={false}
              />
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-[#161616] flex items-center justify-between">
              <div className="flex-1 max-w-sm">
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Commit message (e.g., added {{user_name}} context)"
                  className="w-full bg-[#050505] border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-purple"
                />
              </div>
              <button
                onClick={async () => {
                  if (!hasChanges) return;
                  setLoading(true);
                  try {
                    const newVersion = await saveVersion(templateId, promptText, commitMessage);
                    setVersions([newVersion, ...versions]);
                    setCommitMessage('');
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                  } catch(e) {
                    console.error(e);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={!hasChanges || loading}
                className="ml-4 flex items-center gap-2 bg-brand-purple hover:bg-purple-600 disabled:bg-slate-800 disabled:text-slate-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : saved ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saved ? 'Saved' : 'Commit Changes'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">
            {/* Playground View */}
            <div className="p-6 border-b border-slate-800/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Test Setup</h3>
              </div>
              
              <div className="space-y-6">
                {/* RAG Selection */}
                {projectKbs.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Knowledge Base (RAG Context)</label>
                    <select
                      value={selectedKbId}
                      onChange={(e) => setSelectedKbId(e.target.value)}
                      className="w-full bg-[#111] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-purple"
                    >
                      <option value="">None (Base Prompt Only)</option>
                      {projectKbs.map((kb) => (
                        <option key={kb.id} value={kb.id}>{kb.name} ({kb.document_chunks?.[0]?.count || 0} chunks)</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Variables */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Variables</label>
                  {variables.length === 0 ? (
                    <p className="text-sm text-slate-500">No variables defined. Add {'{{variable_name}}'} in your prompt.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {variables.map(v => (
                        <div key={v}>
                          <label className="block text-xs font-medium text-brand-pink mb-1">{v}</label>
                          <input
                            type="text"
                            value={variableValues[v] || ''}
                            onChange={(e) => setVariableValues({...variableValues, [v]: e.target.value})}
                            className="w-full bg-[#111] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                            placeholder={`Value for ${v}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleTest}
                  disabled={testing || promptText.trim() === ''}
                  className="flex items-center gap-2 bg-brand-purple hover:bg-purple-600 disabled:bg-slate-800 disabled:text-slate-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  {testing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Run Side-by-Side Test
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <h3 className="text-lg font-medium text-white mb-4">Results</h3>
              {testResults.length === 0 && !testing && (
                <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                  Run a test to see model outputs here.
                </div>
              )}
              
              {testing && (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {testResults.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {testResults.map((res: any, i: number) => (
                    <div key={i} className="bg-[#111] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                      <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                        <span className="text-sm font-semibold text-cyan-400">{res.model}</span>
                        <span className="text-xs text-slate-500">{res.latency}ms • {res.tokens} tokens</span>
                      </div>
                      <div className="p-4 text-sm text-slate-300 font-mono whitespace-pre-wrap flex-1 overflow-y-auto max-h-96">
                        {res.output}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Version History Sidebar */}
      <div className="w-80 flex flex-col h-full bg-[#111] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-slate-800 bg-[#161616]">
          <History className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-medium text-slate-300">Version History</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {versions.map((v, i) => (
            <div key={v.id} className="relative pl-4 pb-4 border-l border-slate-800 last:border-0 last:pb-0">
              <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${i === 0 ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-700'}`}></div>
              <div className="text-sm font-medium text-white mb-1">{v.commit_message || 'Updated prompt'}</div>
              <div className="text-xs text-slate-500">{new Date(v.created_at).toLocaleString()}</div>
              {i === 0 && <div className="mt-2 text-xs text-cyan-500 font-medium bg-cyan-500/10 inline-block px-2 py-0.5 rounded-full">Current</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
