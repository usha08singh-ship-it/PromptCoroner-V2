'use client';

import { useState, useEffect } from 'react';
import { DiagnosisCard } from '@/components/DiagnosisCard';
import { PaymentModal } from '@/components/PaymentModal';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const router = useRouter();

  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    const initAuth = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      
      if (data.user) {
        setUserEmail(data.user.email);
      }
    };
    initAuth();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const runAutopsy = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResult(null);
    setErrorMsg('');

    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        if (data.current_usage) setUsageCount(data.current_usage);
      } else {
        if (data.error === 'limit_reached') {
          setIsPaymentOpen(true);
          setErrorMsg('You have reached your free limit of 5 diagnoses.');
        } else {
          setErrorMsg(data.error || 'Failed to analyze prompt. Please try again.');
        }
      }
    } catch(err) {
      setErrorMsg('An unexpected error occurred. Is the API configured properly?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed bg-surface/80 backdrop-blur-[20px] docked full-width top-0 z-50 border-b border-outline-variant/20 shadow-[0_0_15px_rgba(208,188,255,0.1)] flex justify-between items-center w-full px-gutter h-16">
        <div className="flex items-center gap-4">
          <span className="font-headline-lg text-headline-lg md:text-headline-lg font-headline-lg text-primary tracking-tighter uppercase">PROMPT_CORONER</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input className="bg-surface-container-lowest border border-outline-variant rounded-full py-1.5 pl-10 pr-4 text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 w-64 placeholder:text-outline/70 transition-all" placeholder="Global Trace Search..." type="text"/>
          </div>
          <div className="flex items-center gap-md text-primary">
            {userEmail ? (
              <div className="hidden lg:block text-xs font-label-code text-on-surface mr-2 opacity-70">
                {userEmail}
              </div>
            ) : (
               <button onClick={() => router.push('/login')} className="text-xs font-label-code px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full hover:bg-primary/20 transition-all mr-2">Login</button>
            )}
            <button className="hover:bg-surface-container-highest/50 hover:text-primary transition-all duration-300 p-2 rounded-full flex items-center justify-center group relative">
              <span className="material-symbols-outlined group-active:scale-95 group-active:opacity-80 transition-all duration-150">notifications_paused</span>
            </button>
            <button onClick={() => setIsPaymentOpen(true)} className="hover:bg-surface-container-highest/50 hover:text-primary transition-all duration-300 p-2 rounded-full flex items-center justify-center group relative" title="Upgrade">
              <span className="material-symbols-outlined group-active:scale-95 group-active:opacity-80 transition-all duration-150">diamond</span>
            </button>
            <button onClick={userEmail ? handleSignOut : undefined} className="hover:bg-surface-container-highest/50 hover:text-primary transition-all duration-300 p-2 rounded-full flex items-center justify-center group relative" title={userEmail ? "Sign Out" : "Settings"}>
              <span className="material-symbols-outlined group-active:scale-95 group-active:opacity-80 transition-all duration-150">{userEmail ? "logout" : "settings"}</span>
            </button>
            <div className="w-8 h-8 rounded-full ml-2 border border-outline-variant/30 overflow-hidden bg-surface-container-highest">
              <img alt="Analyst Profile" className="w-full h-full object-cover grayscale opacity-80 hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqnvzi7BgQ_RXoLxvfyxECaC5QIir_pTK_KyvClKPqClrtKNfRU396OxFw6jOWrNVkemoWN4QzyOeARMY_ic73s-OVYTTIAciif3B5fZ_bUVz95PTDS64Lj9GkJIrezTU929bbBCiHhFpJsWQdvtCGYHF8MZHSVV2lhGF27of7K5sRAMYFI-jtz1hedA9op2Lhjq6uPS7Eh2yfcG5Wdg28If5xRO_wEJImP9UItRwZ2dbZcAkbt_w6g0e_gaAATUssIy5zYzD3tA"/>
            </div>
          </div>
        </div>
      </header>
      
      {/* SideNavBar */}
      <aside className="hidden md:flex bg-surface-container-low/60 backdrop-blur-[30px] docked left-0 h-full w-64 border-r border-outline-variant/10 shadow-none fixed left-0 top-0 flex-col pt-20 z-40">
        <div className="px-gutter mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-DEFAULT bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">memory</span>
            </div>
            <div>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight leading-none text-[16px]">CYBER_FORENSICS</h2>
              <p className="font-label-code text-label-code text-tertiary">Station ID: {usageCount || '77-X'}</p>
            </div>
          </div>
        </div>
        <button onClick={runAutopsy} disabled={loading || !prompt.trim()} className="mx-4 mb-8 bg-gradient-to-r from-primary-container to-inverse-primary text-on-primary-container font-label-code text-label-code py-3 px-4 rounded-DEFAULT tech-glow hover:brightness-110 transition-all border border-primary/20 uppercase font-bold text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              SCANNING...
            </>
          ) : (
            'INITIATE SCAN'
          )}
        </button>
        <nav className="flex-1 overflow-y-auto w-full">
          <ul className="flex flex-col w-full font-label-code text-label-code">
            <li>
              <a className="flex items-center gap-md bg-primary/10 text-primary border-r-2 border-primary py-3 px-4 hover:bg-surface-container-highest/30 hover:text-primary-fixed-dim hover:shadow-[0_0_10px_rgba(208,188,255,0.2)] transition-all" href="#">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
                Terminal
              </a>
            </li>
            <li>
              <a className="flex items-center gap-md text-on-surface-variant py-3 px-4 hover:bg-surface-container-highest/30 hover:text-primary-fixed-dim hover:shadow-[0_0_10px_rgba(208,188,255,0.2)] transition-all" href="#">
                <span className="material-symbols-outlined">radar</span>
                Active Scans
              </a>
            </li>
            <li>
              <a className="flex items-center gap-md text-on-surface-variant py-3 px-4 hover:bg-surface-container-highest/30 hover:text-primary-fixed-dim hover:shadow-[0_0_10px_rgba(208,188,255,0.2)] transition-all" href="/dashboard">
                <span className="material-symbols-outlined">folder_managed</span>
                Evidence Vault
              </a>
            </li>
            <li>
              <a className="flex items-center gap-md text-on-surface-variant py-3 px-4 hover:bg-surface-container-highest/30 hover:text-primary-fixed-dim hover:shadow-[0_0_10px_rgba(208,188,255,0.2)] transition-all" href="#">
                <span className="material-symbols-outlined">hub</span>
                Neural Trace
              </a>
            </li>
            <li>
              <a className="flex items-center gap-md text-on-surface-variant py-3 px-4 hover:bg-surface-container-highest/30 hover:text-primary-fixed-dim hover:shadow-[0_0_10px_rgba(208,188,255,0.2)] transition-all" href="#">
                <span className="material-symbols-outlined">list_alt</span>
                Log Stream
              </a>
            </li>
          </ul>
        </nav>
        <div className="mt-auto pb-4">
          <ul className="flex flex-col w-full font-label-code text-label-code">
            <li>
              <a className="flex items-center gap-md text-on-surface-variant py-3 px-4 hover:bg-surface-container-highest/30 hover:text-primary-fixed-dim hover:shadow-[0_0_10px_rgba(208,188,255,0.2)] transition-all" href="#">
                <span className="material-symbols-outlined">memory</span>
                Diagnostics
              </a>
            </li>
            <li>
              <a className="flex items-center gap-md text-on-surface-variant py-3 px-4 hover:bg-surface-container-highest/30 hover:text-primary-fixed-dim hover:shadow-[0_0_10px_rgba(208,188,255,0.2)] transition-all" href="#">
                <span className="material-symbols-outlined">help_center</span>
                Help
              </a>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="md:ml-64 pt-24 px-4 md:px-gutter pb-xl min-h-screen flex flex-col gap-xl">
        {/* Top Section: Hero + Feed */}
        <div className="grid grid-cols-4 md:grid-cols-12 gap-gutter">
          {/* Central Hero Visualization / Prompt Input (Span 8) */}
          <div className="col-span-4 md:col-span-8 glass-panel rounded-xl min-h-[450px] relative overflow-hidden group flex flex-col p-8 bg-surface-container-lowest/40" style={{ backgroundImage: "radial-gradient(circle at center, rgba(109, 59, 215, 0.1) 0%, transparent 70%)" }}>
            <div className="absolute inset-0 z-0 opacity-40 bg-cover bg-center mix-blend-screen" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCca5KG9AJ5Sqw8T-DOg-gC13Tv3R99hRHmWmdGv6rdBAcD0UH7wbNdosDYYZgNtA8TXxqeRAW6lu9WtTs--ZPpDR_4mG29WCSVYixWnjxz7s5vowP3TnoJUUHWZ1WrBejbWKI5PoYTtj1FNyZF6LmuG62_XJWcfWZYzlj72Ln3wjsFKRBZ22hZzMzirIRRyN2geWl3kJAawJlg71VZcsI0i_P3wE_SXbHZlHVPWp382orGTl81gkjI4Qfh9JoACKheb0wFpgNcOg')" }}></div>
            <div className="absolute inset-0 z-10 scanline pointer-events-none opacity-50 mix-blend-screen bg-[length:100%_4px] bg-repeat-y"></div>
            
            <div className="relative z-20 flex flex-col h-full w-full">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-4">
                    <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
                    <span className="font-label-code text-label-code text-tertiary">SYSTEM NOMINAL</span>
                  </div>
                  <h1 className="font-display-lg text-display-lg text-on-surface mb-2 drop-shadow-md">Prompt Diagnostics</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-lg">Input localized prompt data. Multi-node trace algorithms actively standing by to scan for structural anomalies.</p>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-error-container/80 border border-error/50 text-on-error-container p-4 rounded-xl text-sm mb-6 backdrop-blur-md relative z-30 shadow-[0_0_20px_rgba(255,180,171,0.15)] flex items-start gap-2">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  {errorMsg}
                </div>
              )}

              <div className="flex-1 relative z-30 group/textarea mt-4 flex flex-col">
                 {/* Input Focus Glow */}
                 <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-inverse-primary to-primary rounded-xl blur-sm opacity-20 group-focus-within/textarea:opacity-50 transition duration-500"></div>
                 <div className="relative flex-1 flex flex-col">
                   <textarea
                     value={prompt}
                     onChange={(e) => setPrompt(e.target.value)}
                     placeholder="e.g. Write a viral blog post about dog training..."
                     className="w-full flex-1 min-h-[150px] p-6 bg-surface-container/60 backdrop-blur-md border border-outline-variant/50 rounded-xl text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-y shadow-inner"
                   />
                   <div className="absolute bottom-4 right-4 text-xs font-label-code text-outline flex items-center gap-2 bg-surface-container/80 px-2 py-1 rounded">
                     {prompt.length} CHARS
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Live Case Feed (Span 4) */}
          <div className="col-span-4 md:col-span-4 glass-panel rounded-xl h-[450px] flex flex-col border-l border-l-outline-variant/30 md:border-l-0">
            <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-highest/20 rounded-t-xl">
              <h3 className="font-label-code text-label-code text-on-surface uppercase font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-tertiary">dynamic_feed</span> Live Case Feed
              </h3>
              <button className="text-outline hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">more_horiz</span></button>
            </div>
            <ul className="flex-1 overflow-y-auto font-label-code text-label-code custom-scrollbar flex flex-col">
              {loading && (
                <li className="px-4 py-3 border-b border-outline-variant/10 bg-primary/10 hover:bg-surface-container-highest/30 transition-colors cursor-pointer group flex gap-3">
                  <span className="text-outline/60 whitespace-nowrap pt-0.5 mt-0.5">NOW</span>
                  <div>
                    <span className="text-secondary block mb-0.5 animate-pulse flex items-center gap-1">
                       <span className="material-symbols-outlined text-[14px]">radar</span> TRACING...
                    </span>
                    <span className="text-on-surface-variant block truncate max-w-[200px] group-hover:text-on-surface">Initiating origin traceback sequence.</span>
                  </div>
                </li>
              )}
              {result && !loading && (
                 <li className="px-4 py-3 border-b border-outline-variant/10 hover:bg-surface-container-highest/30 transition-colors cursor-pointer group flex gap-3">
                   <span className="text-outline/60 whitespace-nowrap pt-0.5 mt-0.5">NOW</span>
                   <div>
                     <span className="text-tertiary block mb-0.5">SCAN COMPLETE</span>
                     <span className="text-on-surface-variant block truncate max-w-[200px] group-hover:text-on-surface">Score: {result.score} - {result.verdict}</span>
                   </div>
                 </li>
              )}
              <li className="px-4 py-3 border-b border-outline-variant/10 hover:bg-surface-container-highest/30 transition-colors cursor-pointer group flex gap-3">
                <span className="text-outline/60 whitespace-nowrap pt-0.5">14:02:44</span>
                <div>
                  <span className="text-tertiary block mb-0.5">SYSTEM READY</span>
                  <span className="text-on-surface-variant block truncate max-w-[200px] group-hover:text-on-surface">Awaiting prompt input for deep scan.</span>
                </div>
              </li>
              <li className="px-4 py-3 border-b border-outline-variant/10 bg-surface-container-highest/10 hover:bg-surface-container-highest/30 transition-colors cursor-pointer group flex gap-3 opacity-70">
                <span className="text-outline/60 whitespace-nowrap pt-0.5">13:58:22</span>
                <div>
                  <span className="text-outline block mb-0.5">LOG ENTRY</span>
                  <span className="text-on-surface-variant block truncate max-w-[200px] group-hover:text-on-surface">Routine system diagnostic finished.</span>
                </div>
              </li>
              <li className="px-4 py-3 border-b border-outline-variant/10 hover:bg-surface-container-highest/30 transition-colors cursor-pointer group flex gap-3 opacity-70">
                <span className="text-outline/60 whitespace-nowrap pt-0.5">13:50:00</span>
                <div>
                  <span className="text-outline block mb-0.5">USER LOGIN</span>
                  <span className="text-on-surface-variant block truncate max-w-[200px] group-hover:text-on-surface">Analyst authenticated.</span>
                </div>
              </li>
            </ul>
            <div className="p-3 border-t border-outline-variant/20 bg-surface-container-lowest flex justify-center rounded-b-xl">
              <button className="font-label-code text-label-code text-primary hover:text-primary-fixed-dim transition-colors uppercase tracking-widest text-[10px]">View Full Log</button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
              className="w-full mt-4"
            >
              <div className="glass-panel rounded-xl overflow-hidden shadow-2xl bg-surface-container-lowest/80 border-primary/30">
                <div className="bg-primary/10 border-b border-primary/20 px-6 py-4 flex items-center justify-between">
                   <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary flex items-center gap-2">
                     <span className="material-symbols-outlined">analytics</span>
                     Diagnostic Report: #{result.report_id || '99X'}
                   </h2>
                   <div className="px-3 py-1 bg-surface-container rounded font-label-code text-label-code border border-outline-variant">
                     SCORE: <span className={result.score >= 80 ? 'text-secondary' : result.score >= 50 ? 'text-tertiary' : 'text-error'}>{result.score}/100</span>
                   </div>
                </div>
                <div className="p-0">
                  <DiagnosisCard 
                    score={result.score}
                    verdict={result.verdict}
                    failures={result.failures}
                    rewrittenPrompt={result.rewritten_prompt}
                    reportId={result.report_id}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Secondary Grid: Tool Cards */}
        <div className="grid grid-cols-4 md:grid-cols-12 gap-gutter mt-auto pt-8">
          {/* Card 1: Deep Scan */}
          <div onClick={runAutopsy} className="col-span-4 glass-panel rounded-xl p-6 flex flex-col justify-between tech-glow-hover transition-all duration-300 cursor-pointer group relative overflow-hidden bg-gradient-to-br from-surface-container-low/80 to-surface-container-lowest/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-all"></div>
            <div className="mb-8 relative z-10">
              <div className="w-12 h-12 rounded-lg bg-surface-container border border-outline-variant/50 flex items-center justify-center mb-4 group-hover:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-[24px] text-primary">radar</span>
              </div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Deep Scan</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Perform an exhaustive sector-by-sector forensic analysis of targeted data structures.</p>
            </div>
            <div className="relative z-10 flex items-center justify-between border-t border-outline-variant/20 pt-4">
              <span className="font-label-code text-label-code text-outline group-hover:text-primary transition-colors">{prompt ? 'READY' : 'AWAITING INPUT'}</span>
              <span className="material-symbols-outlined text-outline group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
            </div>
          </div>
          {/* Card 2: Trace Origin */}
          <div className="col-span-4 glass-panel rounded-xl p-6 flex flex-col justify-between tech-glow-hover transition-all duration-300 cursor-pointer group relative overflow-hidden bg-gradient-to-br from-surface-container-low/80 to-surface-container-lowest/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-secondary/20 transition-all"></div>
            <div className="mb-8 relative z-10">
              <div className="w-12 h-12 rounded-lg bg-surface-container border border-outline-variant/50 flex items-center justify-center mb-4 group-hover:border-secondary/50 transition-colors">
                <span className="material-symbols-outlined text-[24px] text-secondary">hub</span>
              </div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Trace Origin</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Map network pathways backwards to isolate the initial injection point of malicious prompts.</p>
            </div>
            <div className="relative z-10 flex items-center justify-between border-t border-outline-variant/20 pt-4">
              <span className="font-label-code text-label-code text-outline group-hover:text-secondary transition-colors">INACTIVE</span>
              <span className="material-symbols-outlined text-outline group-hover:text-secondary group-hover:translate-x-1 transition-all">arrow_forward</span>
            </div>
          </div>
          {/* Card 3: Evidence Export */}
          <div className="col-span-4 glass-panel rounded-xl p-6 flex flex-col justify-between tech-glow-hover transition-all duration-300 cursor-pointer group relative overflow-hidden bg-gradient-to-br from-surface-container-low/80 to-surface-container-lowest/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-tertiary/20 transition-all"></div>
            <div className="mb-8 relative z-10">
              <div className="w-12 h-12 rounded-lg bg-surface-container border border-outline-variant/50 flex items-center justify-center mb-4 group-hover:border-tertiary/50 transition-colors">
                <span className="material-symbols-outlined text-[24px] text-tertiary">download</span>
              </div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Evidence Export</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Compile logs, metadata, and isolated payloads into cryptographically secure forensic packages.</p>
            </div>
            <div className="relative z-10 flex items-center justify-between border-t border-outline-variant/20 pt-4">
              <span className="font-label-code text-label-code text-outline group-hover:text-tertiary transition-colors">{result ? 'AVAILABLE' : 'LOCKED'}</span>
              <span className="material-symbols-outlined text-outline group-hover:text-tertiary group-hover:translate-x-1 transition-all">arrow_forward</span>
            </div>
          </div>
        </div>
      </main>

      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        userEmail={userEmail}
      />
    </div>
  );
}
