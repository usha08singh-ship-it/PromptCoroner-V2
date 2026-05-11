'use client';

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

export function AnalyticsClient({ logs }: { logs: any[] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-[#111] border border-slate-800 rounded-2xl p-12 text-center mt-8">
        <h3 className="text-xl font-medium text-slate-300">No data available</h3>
        <p className="text-slate-500 mt-2">Run some tests in the Playground to populate analytics.</p>
      </div>
    );
  }

  // Format data for charts
  const timeSeriesData = logs.map(log => ({
    time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    latency: log.latency_ms,
    tokens: log.tokens,
    model: log.model,
  }));

  // Group by model for comparative stats
  const modelStats = logs.reduce((acc: any, log) => {
    if (!acc[log.model]) {
      acc[log.model] = { name: log.model, totalLatency: 0, count: 0, avgLatency: 0 };
    }
    acc[log.model].totalLatency += log.latency_ms;
    acc[log.model].count += 1;
    acc[log.model].avgLatency = Math.round(acc[log.model].totalLatency / acc[log.model].count);
    return acc;
  }, {});

  const barData = Object.values(modelStats);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      
      {/* Latency Over Time Chart */}
      <div className="bg-[#111] border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-medium text-white mb-6">Latency Over Time</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#334155" fontSize={12} tickMargin={10} />
              <YAxis stroke="#334155" fontSize={12} />
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#06b6d4' }}
              />
              <Area type="monotone" dataKey="latency" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorLatency)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Comparison Chart */}
      <div className="bg-[#111] border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-medium text-white mb-6">Average Latency by Model</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#334155" fontSize={12} tickMargin={10} />
              <YAxis stroke="#334155" fontSize={12} />
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <Tooltip 
                cursor={{ fill: '#1e293b' }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
              />
              <Bar dataKey="avgLatency" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
