'use client';

import { CheckCircle2, Copy } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

type Failure = {
  category: string;
  explanation: string;
};

interface DiagnosisCardProps {
  score: number;
  verdict: string;
  failures: Failure[];
  rewrittenPrompt: string;
  reportId: string;
}

export function DiagnosisCard({ score, verdict, failures, rewrittenPrompt, reportId }: DiagnosisCardProps) {
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const getScoreColor = (s: number) => {
    if (s <= 30) return { text: 'text-error', border: 'border-error', shadow: 'shadow-[0_0_15px_rgba(255,180,171,0.3)]', bg: 'bg-error/10' };
    if (s <= 60) return { text: 'text-tertiary', border: 'border-tertiary', shadow: 'shadow-[0_0_15px_rgba(255,184,105,0.3)]', bg: 'bg-tertiary/10' };
    if (s <= 85) return { text: 'text-secondary', border: 'border-secondary', shadow: 'shadow-[0_0_15px_rgba(173,198,255,0.3)]', bg: 'bg-secondary/10' };
    return { text: 'text-primary', border: 'border-primary', shadow: 'shadow-[0_0_15px_rgba(208,188,255,0.3)]', bg: 'bg-primary/10' };
  };

  const style = getScoreColor(score);

  const handleCopy = () => {
    navigator.clipboard.writeText(rewrittenPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/report/${reportId}`;
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full relative"
    >
      {/* Absolute glow behind card */}
      <div className={`absolute top-0 right-0 w-64 h-64 ${style.bg} rounded-full blur-[80px] -z-10`} />

      {/* Header Info */}
      <div className="p-8 border-b border-outline-variant/30 flex flex-col md:flex-row items-center gap-8 relative z-10">
        <motion.div 
          initial={{ rotate: -90, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className={`flex flex-col items-center justify-center w-32 h-32 rounded-full border-[2px] ${style.border} ${style.shadow} bg-surface-container-highest/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]`}
        >
          <span className={`text-4xl font-headline-lg font-extrabold ${style.text}`}>{score}</span>
          <span className="font-label-code text-[10px] tracking-widest mt-1 text-on-surface-variant">SCORE</span>
        </motion.div>
        <div className="flex-1 text-center md:text-left">
          <h3 className={`font-headline-lg text-headline-lg uppercase tracking-wide ${style.text}`}>{verdict}</h3>
          <p className="font-body-md text-on-surface-variant mt-2 leading-relaxed max-w-xl">
            Prompt analysis complete. Review the forensic breakdown of critical issues below.
          </p>
        </div>
      </div>

      {/* Failures */}
      <div className="p-8 bg-surface-container-lowest/30">
        <h4 className="font-label-code text-label-code uppercase text-primary mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          FAILURE_DIAGNOSTICS
        </h4>
        <div className="grid gap-4">
          {failures.map((f, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              key={i} 
              className="bg-surface-container-highest/20 rounded-DEFAULT p-5 border border-outline-variant/30 border-l-2 border-l-error hover:bg-surface-container-highest/40 transition-all hover:-translate-y-1"
            >
              <h5 className="font-headline-lg-mobile text-[18px] text-on-surface">{f.category}</h5>
              <p className="font-body-sm text-on-surface-variant mt-2 leading-relaxed">{f.explanation}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rewritten Prompt */}
      <div className="p-8 bg-surface-container-lowest border-t border-outline-variant/30 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-label-code text-label-code uppercase text-secondary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            REWRITTEN_PROMPT
          </h4>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="flex items-center gap-2 font-label-code text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors bg-surface-container-highest/30 px-4 py-2 rounded-DEFAULT border border-outline-variant/50 hover:bg-surface-container-highest/50"
          >
            {copied ? <CheckCircle2 className="w-3 h-3 text-secondary" /> : <Copy className="w-3 h-3" />}
            {copied ? 'COPIED' : 'COPY_TEXT'}
          </motion.button>
        </div>
        <div className="bg-[#000000]/40 p-6 rounded-DEFAULT font-label-code text-[14px] text-primary-fixed leading-relaxed overflow-x-auto whitespace-pre-wrap border border-outline-variant/20 shadow-inner relative group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-DEFAULT pointer-events-none" />
          {rewrittenPrompt}
        </div>
      </div>

      {/* Footer Share Action */}
      <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/30 flex justify-center rounded-b-xl">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="relative group bg-surface-container text-on-surface px-8 py-3 rounded-DEFAULT font-label-code text-label-code uppercase tracking-widest transition-all overflow-hidden border border-outline-variant/50 tech-glow-hover hover:border-primary/50"
        >
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 group-hover:text-primary-fixed-dim transition-colors">
            {shareCopied ? 'LINK_COPIED' : 'SHARE_REPORT'}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
