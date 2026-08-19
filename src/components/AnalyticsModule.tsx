import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  ShieldCheck,
  Clock,
  Share2,
  Activity,
  Zap,
  Flame,
  Radio,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  ComposedChart,
  Line,
  ReferenceLine,
} from 'recharts';

export const AnalyticsModule: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [engagementTab, setEngagementTab] = useState<'volume' | 'response' | 'peak'>('volume');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMetrics(data.metrics);
        }
      })
      .catch(console.error);
  }, []);

  if (!metrics) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400 text-xs h-screen">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-400 animate-spin" />
          <span>Loading Real-time Enterprise Analytics...</span>
        </div>
      </div>
    );
  }

  const realtime = metrics.realtimeEngagement || {
    liveStats: {
      activeConcurrentChats: 142,
      liveAgentsOnDuty: 8,
      queueDepth: 3,
      avgHoldSeconds: 18,
      resolutionVelocityPerHr: 86,
    },
    activeVolumeTrend: [
      { time: '00:00', active: 18, whatsapp: 12, livechat: 4, instagram: 2 },
      { time: '03:00', active: 10, whatsapp: 7, livechat: 2, instagram: 1 },
      { time: '06:00', active: 28, whatsapp: 20, livechat: 5, instagram: 3 },
      { time: '09:00', active: 94, whatsapp: 62, livechat: 22, instagram: 10 },
      { time: '11:00', active: 135, whatsapp: 88, livechat: 32, instagram: 15 },
      { time: '13:00', active: 168, whatsapp: 110, livechat: 42, instagram: 16 },
      { time: '15:00', active: 195, whatsapp: 130, livechat: 48, instagram: 17 },
      { time: '17:00', active: 140, whatsapp: 95, livechat: 30, instagram: 15 },
      { time: '19:00', active: 98, whatsapp: 68, livechat: 20, instagram: 10 },
      { time: '21:00', active: 52, whatsapp: 38, livechat: 10, instagram: 4 },
    ],
    responseTimesPerChannel: [
      { channel: 'WhatsApp', avgMinutes: 1.8, targetSla: 5.0, color: '#10b981' },
      { channel: 'Live Chat', avgMinutes: 2.4, targetSla: 5.0, color: '#0f766e' },
      { channel: 'Instagram Direct', avgMinutes: 4.1, targetSla: 10.0, color: '#ec4899' },
      { channel: 'Email VIP', avgMinutes: 12.5, targetSla: 30.0, color: '#6366f1' },
    ],
    peakUsageHours: [
      { slot: '08:00 - 10:00', totalMessages: 280, loadPct: 58, status: 'Moderate' },
      { slot: '10:00 - 12:00', totalMessages: 510, loadPct: 88, status: 'Peak' },
      { slot: '12:00 - 14:00', totalMessages: 640, loadPct: 98, status: 'Peak' },
      { slot: '14:00 - 16:00', totalMessages: 590, loadPct: 92, status: 'Peak' },
      { slot: '16:00 - 18:00', totalMessages: 380, loadPct: 65, status: 'Moderate' },
      { slot: '18:00 - 20:00', totalMessages: 210, loadPct: 38, status: 'Off-Peak' },
      { slot: '20:00 - 22:00', totalMessages: 130, loadPct: 22, status: 'Off-Peak' },
    ],
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            Ansury Enterprise Intelligence & Real-time Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time conversation load, channel latency benchmarks, and peak hour capacity diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
              isLiveStreaming
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveStreaming ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
              }`}
            />
            {isLiveStreaming ? 'Live Streaming Active' : 'Stream Paused'}
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <span className="text-slate-400 text-[10px] font-semibold uppercase">Total Conversations</span>
          <p className="text-2xl font-black text-slate-100">{metrics.totalConversations}</p>
          <p className="text-[10px] text-teal-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> ↑ 18.4% from last week
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <span className="text-slate-400 text-[10px] font-semibold uppercase flex items-center gap-1">
            <Share2 className="w-3 h-3 text-emerald-400" />
            WhatsApp Coexistence Volume
          </span>
          <p className="text-2xl font-black text-emerald-400">{metrics.whatsappCoexistenceVolume}</p>
          <p className="text-[10px] text-emerald-300 font-medium">62.3% of total channel traffic</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <span className="text-slate-400 text-[10px] font-semibold uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-teal-400" />
            Avg First Response Time
          </span>
          <p className="text-2xl font-black text-teal-300">{metrics.avgFirstResponseMins}m</p>
          <p className="text-[10px] text-teal-400 font-medium">Under 5-min SLA threshold</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
          <span className="text-slate-400 text-[10px] font-semibold uppercase">CSAT Score</span>
          <p className="text-2xl font-black text-amber-300">⭐ {metrics.csatScore} / 5.0</p>
          <p className="text-[10px] text-amber-400 font-medium">Based on 840 post-chat surveys</p>
        </div>
      </div>

      {/* ========================================================== */}
      {/* REAL-TIME ENGAGEMENT FEATURED CARD                         */}
      {/* ========================================================== */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-teal-500/30 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow effect behind header */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header & View Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold shadow-inner">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Real-time Engagement & Live Operations
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-teal-950 text-teal-300 border border-teal-800/80">
                  Recharts Analytics
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Live stream monitoring of active sessions, response latency by channel, and traffic peak hours.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setEngagementTab('volume')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                engagementTab === 'volume'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Active Conversation Volume
            </button>
            <button
              onClick={() => setEngagementTab('response')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                engagementTab === 'response'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Avg Response Times per Channel
            </button>
            <button
              onClick={() => setEngagementTab('peak')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                engagementTab === 'peak'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Peak Usage Hours
            </button>
          </div>
        </div>

        {/* Live Operational Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 relative z-10">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Active Concurrent Chats</div>
            <div className="text-xl font-extrabold text-teal-300 font-mono mt-0.5">
              {realtime.liveStats.activeConcurrentChats}
            </div>
            <div className="text-[9px] text-teal-400/80 mt-0.5">Across 4 channels</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Agents On Duty</div>
            <div className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
              {realtime.liveStats.liveAgentsOnDuty} Agents
            </div>
            <div className="text-[9px] text-emerald-400/80 mt-0.5">100% capacity ready</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Queue Depth</div>
            <div className="text-xl font-extrabold text-amber-300 font-mono mt-0.5">
              {realtime.liveStats.queueDepth} waiting
            </div>
            <div className="text-[9px] text-amber-400/80 mt-0.5">Avg hold: {realtime.liveStats.avgHoldSeconds}s</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Resolution Velocity</div>
            <div className="text-xl font-extrabold text-indigo-300 font-mono mt-0.5">
              {realtime.liveStats.resolutionVelocityPerHr}/hr
            </div>
            <div className="text-[9px] text-indigo-400/80 mt-0.5">Closed & satisfied</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">SLA Compliance</div>
            <div className="text-xl font-extrabold text-emerald-300 font-mono mt-0.5">
              {metrics.slaComplianceRate}%
            </div>
            <div className="text-[9px] text-emerald-400/80 mt-0.5">Target &gt;95.0%</div>
          </div>
        </div>

        {/* Graph 1: Active Conversation Volume Trend */}
        {engagementTab === 'volume' && (
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-400" />
                Active Conversation Volume (24-Hour Timeline)
              </span>
              <div className="flex items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> Total Active
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> WhatsApp
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600" /> Live Chat
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={realtime.activeVolumeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="waGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="active"
                    name="Total Active Chats"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#activeGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="whatsapp"
                    name="WhatsApp Coexistence"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#waGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="livechat"
                    name="Live Chat Widget"
                    stroke="#0f766e"
                    strokeWidth={2}
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Graph 2: Average Response Times per Channel */}
        {engagementTab === 'response' && (
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                Average First Response Speed per Channel (Minutes) vs SLA Target
              </span>
              <span className="text-[11px] text-teal-400 font-mono">Target SLA: &lt;5 mins</span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={realtime.responseTimesPerChannel} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="channel" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} unit="m" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                    formatter={(value: any) => [`${value} minutes`, 'Avg Response Time']}
                  />
                  <ReferenceLine y={5} label="5m SLA Target" stroke="#ef4444" strokeDasharray="4 4" />
                  <Bar dataKey="avgMinutes" name="Actual Avg Speed (mins)" radius={[8, 8, 0, 0]}>
                    {realtime.responseTimesPerChannel.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Graph 3: Peak Usage Hours */}
        {engagementTab === 'peak' && (
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Peak Usage Hours Heatmap & Agent Capacity Load
              </span>
              <span className="text-[11px] text-amber-300 font-mono">Highest Load Window: 12:00 - 14:00 (98%)</span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={realtime.peakUsageHours} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="slot" stroke="#64748b" fontSize={10} />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="totalMessages"
                    name="Total Messages Received"
                    fill="#14b8a6"
                    radius={[6, 6, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="loadPct"
                    name="Capacity Load %"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Volume Bar Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-400" />
            Hourly Traffic Distribution (WhatsApp vs LiveChat)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.hourlyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="whatsapp" fill="#10b981" name="WhatsApp Coexistence" radius={[4, 4, 0, 0]} />
                <Bar dataKey="livechat" fill="#0f766e" name="Live Chat Widget" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Breakdown Pie */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            Channel Traffic Share & Distribution
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.channelBreakdown}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {metrics.channelBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

