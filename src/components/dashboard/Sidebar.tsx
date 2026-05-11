'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderKanban, LayoutDashboard, Settings, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Projects', href: '/dashboard', icon: FolderKanban },
  { name: 'Analytics', href: '/dashboard/analytics', icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-[#050505] border-r border-slate-800/50 flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-500 to-brand-purple flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.5)]">
            <span className="text-white text-xs font-bold font-heading">P</span>
          </span>
          <span className="font-heading font-bold text-lg text-white tracking-tight">PromptCoroner</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative
                ${isActive ? 'text-white bg-slate-800/40' : 'text-slate-400 hover:text-white hover:bg-slate-800/20'}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800/50">
        <div className="px-4 py-3 bg-gradient-to-r from-brand-purple/10 to-cyan-500/10 rounded-xl border border-white/5">
          <div className="text-xs text-cyan-400 font-medium mb-1">PRO Plan Active</div>
          <div className="text-xs text-slate-400">Unlimited Diagnostics</div>
        </div>
      </div>
    </div>
  );
}
