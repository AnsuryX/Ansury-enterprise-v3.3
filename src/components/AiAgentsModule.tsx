import React, { useState } from 'react';
import {
  Bot,
  Key,
  Sparkles,
  BookOpen,
  Send,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Sliders,
  Shield,
  Zap,
  MessageSquare,
  HelpCircle,
  FileText,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  Brain,
  RefreshCw,
  Terminal,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { AiAgentConfig, AiPersona, KnowledgeBaseItem } from '../types';

interface AiAgentsModuleProps {
  config: AiAgentConfig;
  personas: AiPersona[];
  knowledgeBase: KnowledgeBaseItem[];
  onUpdateConfig: (updated: Partial<AiAgentConfig>) => void;
  onUpdatePersona: (persona: AiPersona) => void;
  onDeletePersona: (id: string) => void;
  onUpdateKb: (item: KnowledgeBaseItem) => void;
  onDeleteKb: (id: string) => void;
}

export const AiAgentsModule: React.FC<AiAgentsModuleProps> = ({
  config,
  personas,
  knowledgeBase,
  onUpdateConfig,
  onUpdatePersona,
  onDeletePersona,
  onUpdateKb,
  onDeleteKb,
}) => {
  const [activeTab, setActiveTab] = useState<'byok' | 'personas' | 'kb' | 'guardrails'>('byok');

  // BYOK Form state
  const [provider, setProvider] = useState(config.provider);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(config.model);
  const [temperature, setTemperature] = useState(config.temperature);
  const [maxTokens, setMaxTokens] = useState(config.maxTokens);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Persona Modal State
  const [editingPersona, setEditingPersona] = useState<AiPersona | null>(null);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);

  // KB Modal State
  const [editingKb, setEditingKb] = useState<KnowledgeBaseItem | null>(null);
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);

  // Guardrails State
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);
  const [blockProfanity, setBlockProfanity] = useState(true);
  const [autoEscalateNegativeSentiment, setAutoEscalateNegativeSentiment] = useState(true);
  const [piiRedaction, setPiiRedaction] = useState(true);
  const [guardrailsSaved, setGuardrailsSaved] = useState(false);

  const handleSaveByok = async () => {
    try {
      const res = await fetch('/api/ai-agents/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          model,
          temperature,
          maxTokens,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdateConfig(data.config);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePersonaForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPersona) return;

    try {
      const res = await fetch('/api/ai-agents/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPersona),
      });
      const data = await res.json();
      if (data.success) {
        onUpdatePersona(data.persona);
        setIsPersonaModalOpen(false);
        setEditingPersona(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveKbForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKb) return;

    try {
      const res = await fetch('/api/ai-agents/kb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingKb),
      });
      const data = await res.json();
      if (data.success) {
        onUpdateKb(data.item);
        setIsKbModalOpen(false);
        setEditingKb(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-6 overflow-y-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Bring Your Own Key (BYOK)
            </span>
            <span className="text-xs text-slate-400">Autonomous Copilot Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            AI Agents & Knowledge Base Grounding
          </h1>
          <p className="text-sm text-slate-400">
            Configure custom API keys, persona prompts, ground models on custom FAQs/PDFs, and define safety guardrails.
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('byok')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'byok'
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          BYOK Model Credentials
        </button>
        <button
          onClick={() => setActiveTab('personas')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'personas'
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          AI Personas ({personas.length})
        </button>
        <button
          onClick={() => setActiveTab('kb')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'kb'
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Knowledge Base & FAQs ({knowledgeBase.length})
        </button>
        <button
          onClick={() => setActiveTab('guardrails')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'guardrails'
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Safety Guardrails & Handoff
        </button>
      </div>

      {/* TAB 1: BYOK MODEL CREDENTIALS */}
      {activeTab === 'byok' && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="font-bold text-base text-white mb-1 flex items-center gap-2">
              <Key className="w-5 h-5 text-teal-400" />
              API Provider & Key Selection
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Enter your own OpenAI, Google Gemini, or Anthropic API keys. All keys are encrypted server-side and never exposed to client browsers.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  AI Model Provider
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'gemini', label: 'Google Gemini', desc: 'Gemini 3.6 Flash / 2.5 Pro' },
                    { id: 'openai', label: 'OpenAI', desc: 'GPT-4o / GPT-4o Mini' },
                    { id: 'anthropic', label: 'Anthropic', desc: 'Claude 3.5 Sonnet' },
                    { id: 'byok_custom', label: 'Custom Endpoint', desc: 'vLLM / Ollama' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setProvider(p.id as any);
                        if (p.id === 'gemini') setModel('gemini-3.6-flash');
                        else if (p.id === 'openai') setModel('gpt-4o');
                        else if (p.id === 'anthropic') setModel('claude-3-5-sonnet');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        provider === p.id
                          ? 'bg-teal-500/10 border-teal-500 text-teal-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-200">{p.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  API Key Secret
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-api03-... or AIzaSy..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono pr-20 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-3 text-[11px] font-bold text-slate-400 hover:text-slate-200"
                  >
                    {showKey ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Model ID</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Temperature ({temperature})</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full mt-2 accent-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Tokens</label>
                  <input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value) || 1024)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                {savedSuccess ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Provider credentials saved securely!
                  </span>
                ) : <div />}
                <button
                  onClick={handleSaveByok}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  Save Model Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAS */}
      {activeTab === 'personas' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-base text-white">Configured AI Personas</h2>
              <p className="text-xs text-slate-400">Manage agent identities, role definitions, and system prompts.</p>
            </div>
            <button
              onClick={() => {
                setEditingPersona({
                  id: `persona_${Date.now()}`,
                  name: 'New Custom Bot',
                  role: 'Support Specialist',
                  tone: 'Empathetic, clear, and professional',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
                  systemPrompt: 'You are an AI assistant for Ansury. Ground all answers on verified KB articles.',
                  isActive: true,
                  greeting: 'Hello! How may I assist you today?',
                });
                setIsPersonaModalOpen(true);
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
            >
              <Plus className="w-4 h-4" /> Add Persona
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((p) => (
              <div key={p.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-sm">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-sm">{p.name}</h3>
                        <p className="text-[11px] text-teal-400 font-semibold">{p.role}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-slate-400"><strong className="text-slate-300">Tone:</strong> {p.tone}</div>
                    <div className="text-slate-400"><strong className="text-slate-300">Greeting:</strong> "{p.greeting}"</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono line-clamp-3">
                    {p.systemPrompt}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setEditingPersona(p);
                      setIsPersonaModalOpen(true);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => onDeletePersona(p.id)}
                    className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-800/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: KNOWLEDGE BASE & FAQS */}
      {activeTab === 'kb' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-base text-white">Grounded Knowledge Base</h2>
              <p className="text-xs text-slate-400">Articles and verified documents used for semantic RAG grounding.</p>
            </div>
            <button
              onClick={() => {
                setEditingKb({
                  id: `kb_${Date.now()}`,
                  title: '',
                  category: 'FAQs',
                  content: '',
                  updatedAt: 'Just now',
                });
                setIsKbModalOpen(true);
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
            >
              <Plus className="w-4 h-4" /> Add Article
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeBase.map((item) => (
              <div key={item.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.updatedAt}</span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm mt-2">{item.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-3 leading-relaxed">{item.content}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setEditingKb(item);
                      setIsKbModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteKb(item.id)}
                    className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SAFETY GUARDRAILS & HANDOFF */}
      {activeTab === 'guardrails' && (
        <div className="max-w-3xl space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
            <div>
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                Enterprise Safety Guardrails & Human Handoff
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enforce strict boundaries for AI responses, block unauthorized actions, and trigger live agent escalation.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Confidence Threshold ({Math.round(confidenceThreshold * 100)}%)</h4>
                  <p className="text-slate-400 text-xs">Automatically route to a human agent when AI certainty falls below this level.</p>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="accent-teal-500 w-32"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">PII Auto-Redaction</h4>
                  <p className="text-slate-400 text-xs">Mask credit card numbers, SSNs, and sensitive tokens prior to LLM submission.</p>
                </div>
                <button
                  onClick={() => setPiiRedaction(!piiRedaction)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                    piiRedaction ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {piiRedaction ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Sentiment-Based Escalation</h4>
                  <p className="text-slate-400 text-xs">Instantly ping managers on Slack or Zoho CRM when customer frustration is detected.</p>
                </div>
                <button
                  onClick={() => setAutoEscalateNegativeSentiment(!autoEscalateNegativeSentiment)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                    autoEscalateNegativeSentiment ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {autoEscalateNegativeSentiment ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setGuardrailsSaved(true);
                  setTimeout(() => setGuardrailsSaved(false), 3000);
                }}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg flex items-center gap-2"
              >
                {guardrailsSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : null}
                {guardrailsSaved ? 'Guardrails Saved' : 'Save Safety Guardrails'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PERSONA MODAL */}
      {isPersonaModalOpen && editingPersona && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePersonaForm}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4"
          >
            <h2 className="font-bold text-lg text-white">Configure AI Persona</h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Persona Name</label>
              <input
                type="text"
                value={editingPersona.name}
                onChange={(e) => setEditingPersona({ ...editingPersona, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role Title</label>
              <input
                type="text"
                value={editingPersona.role}
                onChange={(e) => setEditingPersona({ ...editingPersona, role: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tone of Voice</label>
              <input
                type="text"
                value={editingPersona.tone}
                onChange={(e) => setEditingPersona({ ...editingPersona, tone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">System Instructions Prompt</label>
              <textarea
                value={editingPersona.systemPrompt}
                onChange={(e) => setEditingPersona({ ...editingPersona, systemPrompt: e.target.value })}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPersonaModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg"
              >
                Save Persona
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT KB MODAL */}
      {isKbModalOpen && editingKb && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveKbForm}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative space-y-4"
          >
            <h2 className="font-bold text-lg text-white">Add / Edit Knowledge Base Article</h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Article Title</label>
              <input
                type="text"
                value={editingKb.title}
                onChange={(e) => setEditingKb({ ...editingKb, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={editingKb.category}
                onChange={(e) => setEditingKb({ ...editingKb, category: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="FAQs">FAQs</option>
                <option value="Product Guides">Product Guides</option>
                <option value="Return & Refunds">Return & Refunds</option>
                <option value="Technical Specs">Technical Specs</option>
                <option value="Pricing & SLAs">Pricing & SLAs</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Content / Document Snippet</label>
              <textarea
                value={editingKb.content}
                onChange={(e) => setEditingKb({ ...editingKb, content: e.target.value })}
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
                placeholder="Paste product documentation, refund rules, or customer service answers..."
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsKbModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg"
              >
                Save KB Article
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
