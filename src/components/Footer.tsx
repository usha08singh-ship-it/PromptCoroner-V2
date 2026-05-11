import Link from 'next/link';

export function Footer({ usageCount }: { usageCount: number }) {
  return (
    <footer className="w-full border-t border-white/5 bg-[#050505] pt-12 pb-8 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <span className="text-xl font-bold tracking-tight text-white">Prompt<span className="text-brand-accent">Coroner</span></span>
          <p className="text-sm text-neutral-500">
            Advanced AI Prompt Forensics. Don't guess, diagnose.
          </p>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium text-neutral-400">
          <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-12 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-600 gap-4">
        <p>© {new Date().getFullYear()} PromptCoroner. All rights reserved.</p>
        <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5">
          <span className="text-neutral-400">5 free diagnoses per month.</span>
          {usageCount > 0 && <span className="ml-2 text-brand-accent">Used: {usageCount}/5</span>}
        </div>
      </div>
    </footer>
  );
}
