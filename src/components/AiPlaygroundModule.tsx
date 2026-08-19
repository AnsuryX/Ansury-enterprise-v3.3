import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Play,
  Sparkles,
  Zap,
  Sliders,
  Terminal,
  Activity,
  Code2,
  Calendar,
  BookOpen,
  UserCheck,
  Send,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Eye,
  Settings2,
  Layers,
  Search,
  Database,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import {
  AiAgentConfig,
  AiPersona,
  KnowledgeBaseItem,
  AiToolExecutionLog,
  AiPlaygroundMessage,
} from '../types';

interface AiPlaygroundModuleProps {
  config: AiAgentConfig;
  personas: AiPersona[];
  knowledgeBase: KnowledgeBaseItem[];
}

export const AiPlaygroundModule: React.FC<AiPlaygroundModuleProps> = ({
  config,
  personas,
  knowledgeBase,
}) => {
  // Sandbox Configuration States
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(
    personas[0]?.id || 'persona_01'
  );
  const [selectedModel, setSelectedModel] = useState<string>(
    config.model || 'gemini-3.6-flash'
  );
  const [temperature, setTemperature] = useState<number>(config.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState<number>(config.maxTokens || 2048);
  const [useKbGrounding, setUseKbGrounding] = useState<boolean>(true);
  const [systemPromptOverride, setSystemPromptOverride] = useState<string>('');
  const [enabledTools, setEnabledTools] = useState<string[]>([
    'google_calendar_schedule',
    'google_calendar_check_availability',
    'crm_lead_update',
  ]);

  // Chat Messages State
  const [messages, setMessages] = useState<AiPlaygroundMessage[]>([
    {
      id: 'msg_01',
      role: 'assistant',
      content:
        'Hello! I am your AI Copilot sandbox agent. You can ask me questions grounded in your Knowledge Base, test automated calendar scheduling with Google Calendar, or simulate CRM lead qualifications.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Diagnostics & Memory Inspector States
  const [activeTab, setActiveTab] = useState<'debugger' | 'memory' | 'manual_test'>('debugger');
  const [toolLogs, setToolLogs] = useState<AiToolExecutionLog[]>([]);
  const [selectedLogForJson, setSelectedLogForJson] = useState<AiToolExecutionLog | null>(null);
  const [lastTokenUsage, setLastTokenUsage] = useState<{
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
  }>({
    promptTokens: 384,
    completionTokens: 96,
    totalTokens: 480,
    estimatedCostUsd: 0.000072,
  });

  // Manual Tool Trigger State
  const [manualToolName, setManualToolName] = useState<string>('google_calendar_schedule');
  const [manualJsonPayload, setManualJsonPayload] = useState<string>(
    JSON.stringify(
      {
        summary: 'Ansury Enterprise Solution Consultation',
        attendeeName: 'Alex Rivera',
        attendeeEmail: 'alex@techflow.io',
        durationMinutes: 45,
        googleMeetRequired: true,
      },
      null,
      2
    )
  );
  const [manualTestResult, setManualTestResult] = useState<any>(null);
  const [isTestingManualTool, setIsTestingManualTool] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const activePersona = personas.find((p) => p.id === selectedPersonaId) || personas[0];

  useEffect(() => {
    if (activePersona) {
      setSystemPromptOverride(activePersona.systemPrompt);
    }
  }, [selectedPersonaId, activePersona]);

  // Fetch initial tool logs
  const fetchToolLogs = async () => {
    try {
      const res = await fetch('/api/ai/tools/logs');
      const data = await res.json();
      if (data.success && data.logs) {
        setToolLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchToolLogs();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const userMessage: AiPlaygroundMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: inputQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuery = inputQuery;
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/playground/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentQuery,
          personaId: selectedPersonaId,
          model: selectedModel,
          temperature,
          maxTokens,
          systemPromptOverride,
          useKbGrounding,
          enabledTools,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        const assistantMessage: AiPlaygroundMessage = {
          id: `msg_a_${Date.now()}`,
          role: 'assistant',
          content: data.result,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          toolCall: data.toolCalls && data.toolCalls.length > 0 ? data.toolCalls[0] : undefined,
          groundingSources: data.groundingSources,
          tokenEstimate: data.tokenUsage?.totalTokens,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        if (data.tokenUsage) {
          setLastTokenUsage(data.tokenUsage);
        }
        fetchToolLogs();
      }
    } catch (err) {
      console.error('Playground query error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualToolTrigger = async () => {
    try {
      setIsTestingManualTool(true);
      const parsed = JSON.parse(manualJsonPayload);
      const res = await fetch('/api/ai/tools/test-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: manualToolName,
          payload: parsed,
        }),
      });
      const data = await res.json();
      setManualTestResult(data);
      fetchToolLogs();
    } catch (err: any) {
      setManualTestResult({ success: false, error: err.message });
    } finally {
      setIsTestingManualTool(false);
    }
  };

  const handleCopyJson = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const toggleTool = (toolId: string) => {
    setEnabledTools((prev) =>
      prev.includes(toolId) ? prev.filter((t) => t !== toolId) : [...prev, toolId]
    );
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col h-screen overflow-hidden">
      {/* Top Banner */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
              <Terminal className="w-3 h-3" /> AI Developer Sandbox
            </span>
            <span className="text-xs text-slate-400">
              Interactive Diagnostics & Function Calling Inspector
            </span>
          </div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            AI Agent Playground & Tool Debugger
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMessages([
                {
                  id: 'msg_init',
                  role: 'assistant',
                  content: 'Sandbox session reset. Ready for testing.',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Sandbox
          </button>
        </div>
      </div>

      {/* 3-Column Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLUMN 1: Sandbox Configuration & Prompt Inspector */}
        <div className="w-80 border-r border-slate-800 bg-slate-900/60 overflow-y-auto p-4 space-y-5 shrink-0 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              Model & Persona Config
            </h2>
          </div>

          {/* Persona Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Active AI Persona
            </label>
            <select
              value={selectedPersonaId}
              onChange={(e) => setSelectedPersonaId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-teal-300 font-semibold focus:outline-none focus:border-teal-500"
            >
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
          </div>

          {/* Model Engine */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              LLM Model Architecture
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              <option value="gemini-3.6-flash">Google Gemini 3.6 Flash (Fastest / Recommended)</option>
              <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Deep Reasoning)</option>
              <option value="gpt-4o">OpenAI GPT-4o</option>
              <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
            </select>
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-400">
                Temperature: <span className="text-teal-400 font-mono font-bold">{temperature}</span>
              </label>
              <span className="text-[10px] text-slate-500">
                {temperature < 0.4 ? 'Precise / Deterministic' : temperature > 0.8 ? 'Creative' : 'Balanced'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-teal-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Function Calling Tools */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-2">
              Autonomous Tool Calling Capabilities
            </label>
            <div className="space-y-1.5">
              {[
                {
                  id: 'google_calendar_schedule',
                  label: 'google_calendar_schedule',
                  desc: 'Book slots on Google Calendar & create Meet room',
                },
                {
                  id: 'google_calendar_check_availability',
                  label: 'google_calendar_check_availability',
                  desc: 'Inspect schedule & return open booking windows',
                },
                {
                  id: 'crm_lead_update',
                  label: 'crm_lead_update',
                  desc: 'Mutate lead score & qualification tags in CRM',
                },
                {
                  id: 'n8n_trigger',
                  label: 'n8n_trigger',
                  desc: 'Fire webhook nodes into external automation workflows',
                },
              ].map((tool) => (
                <label
                  key={tool.id}
                  className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                    enabledTools.includes(tool.id)
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={enabledTools.includes(tool.id)}
                    onChange={() => toggleTool(tool.id)}
                    className="mt-0.5 rounded accent-teal-500"
                  />
                  <div>
                    <div className="font-mono font-bold text-[11px] text-white">
                      {tool.label}
                    </div>
                    <div className="text-[10px] text-slate-400">{tool.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Knowledge Base Grounding Toggle */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                Knowledge Base RAG
              </span>
              <button
                type="button"
                onClick={() => setUseKbGrounding(!useKbGrounding)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  useKbGrounding ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {useKbGrounding ? 'ACTIVE' : 'DISABLED'}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              {knowledgeBase.length} enterprise documents loaded for retrieval-augmented generation.
            </p>
          </div>

          {/* System Prompt Override */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-400">
                System Prompt Injection
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                ~{Math.round(systemPromptOverride.length / 4)} tokens
              </span>
            </div>
            <textarea
              rows={4}
              value={systemPromptOverride}
              onChange={(e) => setSystemPromptOverride(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* COLUMN 2: Interactive Sandbox Chat Stream */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden min-w-0">
          {/* Quick Test Prompt Templates */}
          <div className="p-2.5 border-b border-slate-800 bg-slate-900/40 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 shrink-0">
              Quick Tests:
            </span>
            {[
              'Schedule a consultation with Alex Rivera tomorrow at 2 PM',
              'What are our SLA response times for VIP clients?',
              'Find available calendar slots for Friday morning',
              'Qualify this lead and bump lead score to 90 in CRM',
            ].map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputQuery(promptText);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-all border border-slate-700/50"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-2xl p-4 text-xs space-y-2.5 shadow-md ${
                    msg.role === 'user'
                      ? 'bg-teal-600 text-slate-950 font-medium'
                      : 'bg-slate-900 border border-slate-800 text-slate-200'
                  }`}
                >
                  {/* Tool Execution Badge if triggered */}
                  {msg.toolCall && (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-teal-500/30 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-teal-400">
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-teal-400" />
                          Tool Call: {msg.toolCall.name}
                        </span>
                        <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded font-mono">
                          {msg.toolCall.executionMs || 82}ms
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 bg-slate-900 p-1.5 rounded truncate">
                        Params: {JSON.stringify(msg.toolCall.arguments)}
                      </div>
                    </div>
                  )}

                  {/* Main Message Content */}
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>

                  {/* Footer Grounding & Token Metadata */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/50">
                    <span>{msg.timestamp}</span>
                    {msg.groundingSources && msg.groundingSources.length > 0 && (
                      <span className="text-teal-400 font-semibold flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> Grounded in {msg.groundingSources.length} FAQs
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-teal-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating tools, grounding documents, and generating response...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Sandbox Query Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/90">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask query, test calendar scheduling, or invoke AI tools..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Send Query
              </button>
            </div>
          </form>
        </div>

        {/* COLUMN 3: Visual Tool Execution Log & Diagnostics Inspector */}
        <div className="w-88 border-l border-slate-800 bg-slate-900/80 overflow-y-auto p-4 space-y-4 shrink-0 text-xs">
          {/* Sub-tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('debugger')}
              className={`flex-1 py-1.5 rounded-lg text-center text-xs font-semibold transition-all ${
                activeTab === 'debugger' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              Tool Logs ({toolLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('memory')}
              className={`flex-1 py-1.5 rounded-lg text-center text-xs font-semibold transition-all ${
                activeTab === 'memory' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              Memory
            </button>
            <button
              onClick={() => setActiveTab('manual_test')}
              className={`flex-1 py-1.5 rounded-lg text-center text-xs font-semibold transition-all ${
                activeTab === 'manual_test' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              Manual Fire
            </button>
          </div>

          {/* TAB 1: TOOL CALLING LOGS */}
          {activeTab === 'debugger' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Live Function Invocations
                </span>
                <button
                  onClick={fetchToolLogs}
                  className="text-teal-400 hover:text-teal-300 text-[11px] flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              {toolLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2 cursor-pointer"
                  onClick={() => setSelectedLogForJson(log)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-teal-300 text-[11px]">
                      {log.toolName}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {log.status} ({log.latencyMs}ms)
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {log.summary}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                    <span>{log.timestamp}</span>
                    <span className="text-teal-400 underline">Inspect JSON →</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: MEMORY & TOKEN USAGE INSPECTOR */}
          {activeTab === 'memory' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-400" />
                  Token Consumption Meter
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Prompt Tokens</div>
                    <div className="text-base font-bold font-mono text-white">
                      {lastTokenUsage.promptTokens}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Completion Tokens</div>
                    <div className="text-base font-bold font-mono text-white">
                      {lastTokenUsage.completionTokens}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-teal-950/40 border border-teal-800/40 flex items-center justify-between">
                  <span className="text-slate-300">Estimated Cost:</span>
                  <span className="text-teal-300 font-mono font-bold">
                    ${lastTokenUsage.estimatedCostUsd} USD
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-purple-400" /> Grounded Context Chunks
                </h4>
                <p className="text-[11px] text-slate-400">
                  {knowledgeBase.length} articles indexed for semantic grounding.
                </p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {knowledgeBase.map((kb) => (
                    <div
                      key={kb.id}
                      className="p-2 rounded-lg bg-slate-900 text-[11px] text-slate-300 border border-slate-800"
                    >
                      <div className="font-semibold text-teal-300 truncate">{kb.title}</div>
                      <div className="text-[10px] text-slate-500">{kb.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANUAL TEST FIRE TOOL */}
          {activeTab === 'manual_test' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Target Tool
                </label>
                <select
                  value={manualToolName}
                  onChange={(e) => setManualToolName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-teal-300 font-semibold focus:outline-none"
                >
                  <option value="google_calendar_schedule">google_calendar_schedule</option>
                  <option value="google_calendar_check_availability">google_calendar_check_availability</option>
                  <option value="crm_lead_update">crm_lead_update</option>
                  <option value="n8n_trigger">n8n_trigger</option>
                  <option value="whatsapp_template_dispatch">whatsapp_template_dispatch</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  JSON Mock Payload
                </label>
                <textarea
                  rows={6}
                  value={manualJsonPayload}
                  onChange={(e) => setManualJsonPayload(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] text-teal-300 focus:outline-none"
                />
              </div>

              <button
                onClick={handleManualToolTrigger}
                disabled={isTestingManualTool}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                {isTestingManualTool ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                Execute Live Test Fire
              </button>

              {manualTestResult && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 max-h-48 overflow-y-auto">
                  <div className="font-bold text-[11px] text-teal-400">Response Payload:</div>
                  <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap">
                    {JSON.stringify(manualTestResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: JSON INSPECTOR */}
      {selectedLogForJson && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-mono font-bold text-sm text-teal-300">
                {selectedLogForJson.toolName} (Payload Trace)
              </h3>
              <button
                onClick={() => setSelectedLogForJson(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Input Arguments:</span>
                  <button
                    onClick={() =>
                      handleCopyJson(JSON.stringify(selectedLogForJson.inputPayload, null, 2))
                    }
                    className="text-teal-400 hover:underline"
                  >
                    Copy
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  {JSON.stringify(selectedLogForJson.inputPayload, null, 2)}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Output Result:</span>
                  <button
                    onClick={() =>
                      handleCopyJson(JSON.stringify(selectedLogForJson.outputPayload, null, 2))
                    }
                    className="text-teal-400 hover:underline"
                  >
                    Copy
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                  {JSON.stringify(selectedLogForJson.outputPayload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
