import Link from 'next/link';
import { Mail, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-300 flex flex-col pt-20 px-6">
      <div className="max-w-3xl mx-auto w-full flex-1 mb-20">
        <Link href="/" className="text-brand-accent hover:text-white transition-colors mb-8 inline-block font-medium">
          &larr; Back to Home
        </Link>
        <h1 className="text-4xl font-extrabold text-white mb-8">Contact Support</h1>
        
        <div className="glass-panel p-10 rounded-3xl text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-accent/10 border border-brand-accent/20 mb-2">
            <Mail className="w-8 h-8 text-brand-accent" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">How can we help?</h2>
            <p className="text-neutral-400">Whether you have a question about billing, need technical support, or want to report a bug, we're here for you.</p>
          </div>

          <div className="p-6 bg-[#0a0a0a]/50 rounded-2xl border border-white/5 inline-block">
            <span className="text-sm font-semibold uppercase tracking-widest text-neutral-500 block mb-2">Email Us At</span>
            <a href="mailto:usha08singh@gmail.com" className="text-2xl font-mono text-white hover:text-brand-accent transition-colors">
              usha08singh@gmail.com
            </a>
          </div>

          <p className="text-sm text-neutral-500">We typically respond within 24 hours.</p>
        </div>
      </div>
    </div>
  );
}
