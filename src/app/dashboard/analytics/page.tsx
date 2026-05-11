import { getAnalyticsData } from '@/app/actions/analytics';
import { AnalyticsClient } from '@/components/dashboard/AnalyticsClient';
import { Activity, Clock, Zap } from 'lucide-react';

export default async function AnalyticsPage() {
  const { logs, stats } = await getAnalyticsData();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-1">Monitor prompt performance, token usage, and latency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-400">Total API Calls</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.totalCalls}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-400">Tokens Processed</p>
              <h3 className="text-3xl font-bold text-white mt-1">{(stats.totalTokens / 1000).toFixed(1)}k</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center border border-brand-purple/20">
              <Zap className="w-5 h-5 text-brand-purple" />
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-400">Average Latency</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.avgLatency}ms</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-pink/10 flex items-center justify-center border border-brand-pink/20">
              <Clock className="w-5 h-5 text-brand-pink" />
            </div>
          </div>
        </div>
      </div>

      <AnalyticsClient logs={logs} />
    </div>
  );
}
