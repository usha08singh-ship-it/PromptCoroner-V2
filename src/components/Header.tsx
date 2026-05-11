'use client';

import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface HeaderProps {
  userEmail?: string;
  onSignOut: () => void;
  onUpgrade: () => void;
}

export function Header({ userEmail, onSignOut, onUpgrade }: HeaderProps) {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 inset-x-0 z-40 h-20 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl shadow-lg shadow-black/20"
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-brand-purple flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40"
          >
            <ShieldAlert className="w-5 h-5 text-white" />
          </motion.div>
          <span className="text-2xl font-heading font-extrabold tracking-tight text-white">Prompt<span className="text-cyan-400">Coroner</span></span>
        </Link>

        <div className="flex items-center gap-6">
          {userEmail && (
            <>
              <Link 
                href="/dashboard"
                className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors hidden sm:inline-block border-b border-transparent hover:border-cyan-400"
              >
                Dashboard
              </Link>
              <span className="text-sm font-medium text-slate-400 hidden sm:inline-block border-l border-slate-700 pl-4">
                {userEmail}
              </span>
            </>
          )}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSignOut}
            className="text-xs font-semibold uppercase tracking-wider px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-slate-300"
          >
            Sign Out
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUpgrade}
            className="group relative text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full overflow-hidden transition-all duration-300 shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-brand-purple to-brand-pink opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-[1.5px] bg-[#020617] rounded-full transition-all duration-300 group-hover:bg-opacity-0" />
            <span className="relative z-10 bg-gradient-to-r from-cyan-400 to-brand-pink bg-clip-text text-transparent group-hover:text-white transition-colors duration-300">
              Upgrade to Pro
            </span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
