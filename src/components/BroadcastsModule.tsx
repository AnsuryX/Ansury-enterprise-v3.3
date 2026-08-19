import React, { useState } from 'react';
import {
  Send,
  Radio,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  BarChart2,
  FileCode,
  Calendar,
  AlertCircle,
  Play,
  Eye,
  MousePointer,
  UserX,
  Sparkles,
  ArrowRight,
  Filter,
  Trash2,
} from 'lucide-react';
import { BroadcastCampaign, WhatsAppTemplate } from '../types';

interface BroadcastsModuleProps {
  broadcasts: BroadcastCampaign[];
  templates: WhatsAppTemplate[];
  onAddBroadcast: (campaign: BroadcastCampaign) => void;
  onRunBroadcast: (id: string) => void;
  onDeleteBroadcast?: (id: string) => void;
}

export const BroadcastsModule: React.FC<BroadcastsModuleProps> = ({
  broadcasts,
  templates,
  onAddBroadcast,
  onRunBroadcast,
  onDeleteBroadcast,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<BroadcastCampaign | null>(
    broadcasts[0] || null
  );

  // Form State
  const [name, setName] = useState('');
  const [audienceTag, setAudienceTag] = useState('VIP Client');
  const [templateId, setTemplateId] = useState(templates[0]?.id || 'tpl_01');
  const [scheduledAt, setScheduledAt] = useState('Send Immediately');

  const approvedTemplates = templates.filter((t) => t.status === 'APPROVED');

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTpl = templates.find((t) => t.id === templateId);

    const newCampaign: BroadcastCampaign = {
      id: `bcast_${Date.now()}`,
      name: name || 'New WhatsApp Broadcast Wave',
      templateId,
      templateName: selectedTpl?.name || 'whatsapp_template',
      audienceTag,
      totalAudience: audienceTag === 'VIP Client' ? 1250 : 840,
      scheduledAt: scheduledAt === 'Send Immediately' ? 'Just now' : scheduledAt,
      status: scheduledAt === 'Send Immediately' ? 'sending' : 'scheduled',
      stats: {
        sent: scheduledAt === 'Send Immediately' ? 1250 : 0,
        delivered: scheduledAt === 'Send Immediately' ? 1242 : 0,
        read: scheduledAt === 'Send Immediately' ? 980 : 0,
        clicked: scheduledAt === 'Send Immediately' ? 340 : 0,
        unsubscribed: 2,
        conversions: 45,
      },
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddBroadcast(newCampaign);
    setSelectedCampaign(newCampaign);
    setIsModalOpen(false);
    setName('');
  };

  // Metrics Calculations
  const totalSent = broadcasts.reduce((acc, b) => acc + b.stats.sent, 0);
  const totalDelivered = broadcasts.reduce((acc, b) => acc + b.stats.delivered, 0);
  const totalRead = broadcasts.reduce((acc, b) => acc + b.stats.read, 0);
  const totalClicked = broadcasts.reduce((acc, b) => acc + b.stats.clicked, 0);

  const avgReadRate = totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) : '88.4';
  const avgCTR = totalRead > 0 ? ((totalClicked / totalRead) * 100).toFixed(1) : '31.2';

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-6 overflow-y-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Bulk WhatsApp Campaigns
            </span>
            <span className="text-xs text-slate-400">Meta Interactive Templates</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            WhatsApp Broadcasts & Targeted Blast Engine
          </h1>
          <p className="text-sm text-slate-400">
            Dispatch compliant bulk WhatsApp campaigns with quick reply buttons, track real-time delivery and read receipts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-900/40 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Broadcast Campaign
        </button>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Total Messages Sent</span>
            <Radio className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{totalSent.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 inline-block">
            +24.5% vs last month
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Avg WhatsApp Read Rate</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">{avgReadRate}%</div>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 inline-block">
            High Meta engagement score
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Avg Click-Through Rate</span>
            <MousePointer className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-300 font-mono">{avgCTR}%</div>
          <span className="text-[10px] text-purple-400 font-semibold mt-1 inline-block">
            Interactive buttons convert 3x
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Active Broadcast Waves</span>
            <BarChart2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{broadcasts.length} Waves</div>
          <span className="text-[10px] text-amber-400 font-semibold mt-1 inline-block">
            1 Scheduled for dispatch
          </span>
        </div>
      </div>

      {/* Main Grid: Broadcast List & Selected Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broadcasts List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center justify-between">
            <span>Recent Broadcast Waves</span>
            <span className="text-xs text-slate-500 font-normal">{broadcasts.length} Total</span>
          </h2>

          <div className="space-y-3">
            {broadcasts.map((bcast) => {
              const isSelected = selectedCampaign?.id === bcast.id;
              return (
                <div
                  key={bcast.id}
                  onClick={() => setSelectedCampaign(bcast)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-sky-500/80 shadow-lg shadow-sky-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        bcast.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : bcast.status === 'scheduled'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      }`}
                    >
                      {bcast.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{bcast.createdAt}</span>
                  </div>

                  <h3 className="font-bold text-white text-sm mb-1">{bcast.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>Target: {bcast.audienceTag}</span>
                    <span className="text-slate-600">•</span>
                    <span className="font-mono text-slate-300">{bcast.totalAudience} recipients</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Broadcast Deep-Dive Metrics */}
        {selectedCampaign ? (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      Target Segment: {selectedCampaign.audienceTag}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Template: {selectedCampaign.templateName}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{selectedCampaign.name}</h2>
                </div>

                <div className="flex items-center gap-2 self-start">
                  {selectedCampaign.status === 'scheduled' && (
                    <button
                      onClick={() => onRunBroadcast(selectedCampaign.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Dispatch Broadcast Now
                    </button>
                  )}

                  {onDeleteBroadcast && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete broadcast wave '${selectedCampaign.name}'?`)) {
                          onDeleteBroadcast(selectedCampaign.id);
                          setSelectedCampaign(broadcasts.find((b) => b.id !== selectedCampaign.id) || null);
                        }
                      }}
                      title="Delete Campaign Wave"
                      className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-bold transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar & Stats */}
              <div className="space-y-6 mb-8">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-300">Delivery Completion</span>
                    <span className="text-sky-400 font-mono">
                      {selectedCampaign.stats.delivered} / {selectedCampaign.totalAudience} delivered
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          selectedCampaign.totalAudience > 0
                            ? (selectedCampaign.stats.delivered / selectedCampaign.totalAudience) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                      Sent
                    </span>
                    <span className="text-lg font-bold text-white font-mono">
                      {selectedCampaign.stats.sent}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                      Delivered
                    </span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      {selectedCampaign.stats.delivered}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                      Read
                    </span>
                    <span className="text-lg font-bold text-sky-400 font-mono">
                      {selectedCampaign.stats.read}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                      Clicked
                    </span>
                    <span className="text-lg font-bold text-purple-400 font-mono">
                      {selectedCampaign.stats.clicked}
                    </span>
                  </div>
                </div>
              </div>

              {/* Template Body Preview */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Meta Approved Template Message Payload
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  "Hello {'{{1}}'}, we are excited to reveal our newest summer catalog collection! Tap below to view rich product cards directly in chat."
                </p>
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800/80">
                  <span className="px-3 py-1 bg-sky-500/10 text-sky-300 border border-sky-500/20 rounded-lg text-[10px] font-semibold">
                    Button: Browse Catalog
                  </span>
                  <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-semibold">
                    Button: Speak with Agent
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
              <span>Campaign Scheduled: {selectedCampaign.scheduledAt}</span>
              <span>WABA Rate Limit Score: 250,000 msgs/day</span>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center">
            <Radio className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-sm">Select a broadcast campaign from the left to view metrics</p>
          </div>
        )}
      </div>

      {/* CREATE BROADCAST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateBroadcast}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4"
          >
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-sky-400" />
              Create WhatsApp Broadcast Campaign
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Campaign Title</label>
              <input
                type="text"
                placeholder="e.g. August Flash Sale & VIP Catalog Blast"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience Tag</label>
                <select
                  value={audienceTag}
                  onChange={(e) => setAudienceTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="VIP Client">VIP Clients (~1,250)</option>
                  <option value="High Priority">High Priority (~540)</option>
                  <option value="All Contacts">All Opted-in Contacts (~3,400)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Schedule Timing</label>
                <select
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="Send Immediately">Send Immediately</option>
                  <option value="Tomorrow at 09:00 AM">Tomorrow at 09:00 AM</option>
                  <option value="Friday at 02:00 PM">Friday at 02:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Approved Meta WhatsApp Template
              </label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                {approvedTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-900/40"
              >
                Launch Broadcast Wave
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
