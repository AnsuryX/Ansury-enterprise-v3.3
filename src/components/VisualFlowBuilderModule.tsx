import React, { useState } from 'react';
import {
  Workflow,
  Plus,
  Play,
  Zap,
  Bot,
  ShoppingBag,
  Tag,
  UserCheck,
  Clock,
  Webhook,
  GitBranch,
  ArrowDown,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Terminal,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { VisualFlow, FlowNode, FlowTrigger, AiPersona } from '../types';

interface VisualFlowBuilderModuleProps {
  flows: VisualFlow[];
  personas: AiPersona[];
  onAddFlow: (flow: VisualFlow) => void;
  onUpdateFlow: (flow: VisualFlow) => void;
  onDeleteFlow: (id: string) => void;
}

export const VisualFlowBuilderModule: React.FC<VisualFlowBuilderModuleProps> = ({
  flows,
  personas,
  onAddFlow,
  onUpdateFlow,
  onDeleteFlow,
}) => {
  const [selectedFlowId, setSelectedFlowId] = useState<string>(flows[0]?.id || '');
  const [isNewFlowModalOpen, setIsNewFlowModalOpen] = useState(false);
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);

  // New Flow Form
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDesc, setNewFlowDesc] = useState('');
  const [triggerType, setTriggerType] = useState<FlowTrigger['type']>('keyword');
  const [triggerKeyword, setTriggerKeyword] = useState('price, catalog, buy');

  // Add Node Form
  const [nodeType, setNodeType] = useState<FlowNode['type']>('send_message');
  const [nodeTitle, setNodeTitle] = useState('');
  const [nodeDesc, setNodeDesc] = useState('');

  // Flow Test Simulation State
  const [isTestingFlow, setIsTestingFlow] = useState(false);
  const [activeTestStep, setActiveTestStep] = useState<number | null>(null);

  // n8n Custom Webhook node state
  const [n8nUrl, setN8nUrl] = useState('https://n8n.ansury.com/webhook/omnichannel-event-v2');
  const [n8nMethod, setN8nMethod] = useState<'POST' | 'PUT' | 'GET'>('POST');
  const [n8nPayload, setN8nPayload] = useState('{\n  "event": "conversation_qualified",\n  "contact_phone": "{{contact.phone}}",\n  "deal_stage": "Proposal Sent"\n}');
  const [n8nTestResult, setN8nTestResult] = useState<{
    success: boolean;
    statusCode: number;
    responseBody: string;
    latencyMs: number;
  } | null>(null);
  const [isN8nExecuting, setIsN8nExecuting] = useState(false);

  const activeFlow = flows.find((f) => f.id === selectedFlowId) || flows[0];

  const handleCreateFlow = (e: React.FormEvent) => {
    e.preventDefault();
    const created: VisualFlow = {
      id: `flow_${Date.now()}`,
      name: newFlowName || 'New Visual Chat Route',
      description: newFlowDesc || 'Automated multi-step chat flow.',
      trigger: {
        type: triggerType,
        config: { keywords: triggerKeyword },
      },
      isActive: true,
      executionCount: 0,
      lastTriggered: 'Never',
      nodes: [
        {
          id: `node_trig_${Date.now()}`,
          type: 'trigger',
          title: `Trigger: ${triggerType.toUpperCase()}`,
          description: `Fires on ${triggerType}`,
          config: { keywords: triggerKeyword },
          nextNodes: [],
        },
      ],
    };

    onAddFlow(created);
    setSelectedFlowId(created.id);
    setIsNewFlowModalOpen(false);
    setNewFlowName('');
    setNewFlowDesc('');
  };

  const handleAddNodeToActiveFlow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFlow) return;

    const config: Record<string, any> = {};
    if (nodeType === 'webhook_n8n') {
      config.webhookUrl = n8nUrl;
      config.httpMethod = n8nMethod;
      config.payload = n8nPayload;
    }

    const newNode: FlowNode = {
      id: `node_${Date.now()}`,
      type: nodeType,
      title: nodeTitle || getPresetNodeTitle(nodeType),
      description: nodeDesc || getPresetNodeDesc(nodeType),
      config,
      nextNodes: [],
    };

    const updatedNodes = [...activeFlow.nodes];
    if (updatedNodes.length > 0) {
      updatedNodes[updatedNodes.length - 1].nextNodes = [newNode.id];
    }
    updatedNodes.push(newNode);

    onUpdateFlow({ ...activeFlow, nodes: updatedNodes });
    setIsAddNodeModalOpen(false);
    setNodeTitle('');
    setNodeDesc('');
  };

  const handleExecuteN8nWebhook = async (node: FlowNode) => {
    setIsN8nExecuting(true);
    setN8nTestResult(null);

    try {
      const url = node.config?.webhookUrl || n8nUrl;
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(node.config?.payload || n8nPayload);
      } catch (e) {
        parsedPayload = { raw: node.config?.payload || n8nPayload };
      }

      const res = await fetch('/api/integrations/n8n/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: url,
          nodeTitle: node.title,
          payload: parsedPayload,
        }),
      });

      const data = await res.json();
      setN8nTestResult({
        success: data.success,
        statusCode: data.statusCode || 200,
        responseBody: data.responseBody || 'Success',
        latencyMs: data.latencyMs || 28,
      });
    } catch (e) {
      setN8nTestResult({
        success: false,
        statusCode: 500,
        responseBody: 'Network error triggering n8n webhook',
        latencyMs: 0,
      });
    } finally {
      setIsN8nExecuting(false);
    }
  };

  const getPresetNodeTitle = (type: FlowNode['type']) => {
    switch (type) {
      case 'send_message':
        return 'Send WhatsApp Message';
      case 'send_product_catalog':
        return 'Send Meta Commerce Catalog';
      case 'ai_copilot_handover':
        return 'Handover to AI Agent Persona';
      case 'condition_branch':
        return 'IF / ELSE Condition Branch';
      case 'add_tag':
        return 'Add CRM Contact Tag';
      case 'assign_agent':
        return 'Assign Human Support Agent';
      case 'delay':
        return 'Drip Sequence Delay Timer';
      case 'webhook_n8n':
        return 'Trigger n8n / Webhook Endpoint';
      default:
        return 'Action Step';
    }
  };

  const getPresetNodeDesc = (type: FlowNode['type']) => {
    switch (type) {
      case 'send_message':
        return 'Sends automated rich greeting or response template.';
      case 'send_product_catalog':
        return 'Presents in-chat product cards with instant checkout.';
      case 'ai_copilot_handover':
        return 'Hands conversation over to autonomous grounded AI.';
      case 'condition_branch':
        return 'Routes customer based on VIP tag or working hours.';
      case 'add_tag':
        return 'Tags customer profile in CRM.';
      case 'assign_agent':
        return 'Transfers chat to Sarah Jenkins or Tier 2 Queue.';
      case 'delay':
        return 'Waits 2 hours before sending follow-up drip message.';
      case 'webhook_n8n':
        return 'Posts event payload to external n8n workflow.';
      default:
        return 'Executes custom action node.';
    }
  };

  const getNodeIcon = (type: FlowNode['type']) => {
    switch (type) {
      case 'trigger':
        return Zap;
      case 'send_message':
        return Terminal;
      case 'send_product_catalog':
        return ShoppingBag;
      case 'ai_copilot_handover':
        return Bot;
      case 'condition_branch':
        return GitBranch;
      case 'add_tag':
        return Tag;
      case 'assign_agent':
        return UserCheck;
      case 'delay':
        return Clock;
      case 'webhook_n8n':
        return Webhook;
      default:
        return Workflow;
    }
  };

  const getNodeColor = (type: FlowNode['type']) => {
    switch (type) {
      case 'trigger':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'send_product_catalog':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'ai_copilot_handover':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'condition_branch':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'webhook_n8n':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  const runTestSimulation = async () => {
    if (!activeFlow || isTestingFlow) return;
    setIsTestingFlow(true);
    for (let i = 0; i < activeFlow.nodes.length; i++) {
      setActiveTestStep(i);
      await new Promise((r) => setTimeout(r, 700));
    }
    setActiveTestStep(null);
    setIsTestingFlow(false);
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-6 overflow-y-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Visual Flow Canvas
            </span>
            <span className="text-xs text-slate-400">Automated Route Builder v3.0</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Automations & Visual Flow Builder
          </h1>
          <p className="text-sm text-slate-400">
            Construct automated chat routes, keyword triggers, drip sequences, AI agent handovers, and n8n webhooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewFlowModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-900/40 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Visual Flow
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Flows List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Active Workflows</h2>
          <div className="space-y-3">
            {flows.map((flow) => {
              const isSelected = activeFlow?.id === flow.id;
              return (
                <div
                  key={flow.id}
                  onClick={() => setSelectedFlowId(flow.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500/80 shadow-lg shadow-amber-950/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        flow.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {flow.isActive ? 'Active' : 'Paused'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {flow.executionCount} runs
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm mb-1">{flow.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{flow.description}</p>

                  <div className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Trigger: {flow.trigger.type}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Canvas: Selected Flow Pathway */}
        {activeFlow && (
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              {/* Flow Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Trigger: {activeFlow.trigger.type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Last Triggered: {activeFlow.lastTriggered}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{activeFlow.name}</h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={runTestSimulation}
                    disabled={isTestingFlow}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
                  >
                    <Play className={`w-3.5 h-3.5 text-emerald-400 ${isTestingFlow ? 'animate-spin' : ''}`} />
                    {isTestingFlow ? 'Simulating Path...' : 'Test Flow Path'}
                  </button>

                  <button
                    onClick={() =>
                      onUpdateFlow({
                        ...activeFlow,
                        isActive: !activeFlow.isActive,
                      })
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      activeFlow.isActive
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {activeFlow.isActive ? 'Status: Active' : 'Status: Paused'}
                  </button>

                  <button
                    onClick={() => setIsAddNodeModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Add Node
                  </button>
                </div>
              </div>

              {/* Visual Nodes Chain View */}
              <div className="max-w-xl mx-auto space-y-4 relative py-4">
                {activeFlow.nodes.map((node, index) => {
                  const NodeIcon = getNodeIcon(node.type);
                  const colorStyle = getNodeColor(node.type);
                  const isCurrentStepTesting = activeTestStep === index;

                  return (
                    <React.Fragment key={node.id}>
                      <div
                        className={`bg-slate-950 border rounded-2xl p-5 transition-all shadow-xl relative group ${
                          isCurrentStepTesting
                            ? 'ring-2 ring-emerald-400 border-emerald-500 scale-105'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${colorStyle}`}
                            >
                              <NodeIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                                  Step 0{index + 1}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 uppercase">
                                  {node.type}
                                </span>
                              </div>
                              <h4 className="font-bold text-white text-sm">{node.title}</h4>
                              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                                {node.description}
                              </p>

                              {/* n8n Custom Webhook Node Inspector */}
                              {node.type === 'webhook_n8n' && (
                                <div className="mt-3 p-3 rounded-xl bg-teal-950/40 border border-teal-800/50 space-y-2 text-xs">
                                  <div className="flex items-center justify-between text-teal-300 font-semibold text-[11px]">
                                    <span className="flex items-center gap-1 font-mono">
                                      <Webhook className="w-3.5 h-3.5 text-teal-400" />
                                      {node.config?.webhookUrl || n8nUrl}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono text-[9px]">
                                      {node.config?.httpMethod || 'POST'}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono bg-slate-900/80 p-2 rounded border border-slate-800 truncate">
                                    Payload: {node.config?.payload || n8nPayload}
                                  </div>

                                  <div className="pt-1 flex items-center justify-between gap-2">
                                    <button
                                      onClick={() => handleExecuteN8nWebhook(node)}
                                      disabled={isN8nExecuting}
                                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-md shrink-0"
                                    >
                                      <Zap className={`w-3 h-3 ${isN8nExecuting ? 'animate-spin' : ''}`} />
                                      {isN8nExecuting ? 'Firing n8n...' : 'Test Live n8n Dispatch'}
                                    </button>

                                    {n8nTestResult && (
                                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                        n8nTestResult.success
                                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                      }`}>
                                        HTTP {n8nTestResult.statusCode} ({n8nTestResult.latencyMs}ms)
                                      </span>
                                    )}
                                  </div>

                                  {n8nTestResult && (
                                    <pre className="text-[9px] font-mono bg-slate-900 text-emerald-300 p-2 rounded border border-slate-800 overflow-x-auto max-h-24 leading-tight">
                                      {n8nTestResult.responseBody}
                                    </pre>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <span className="text-slate-600 group-hover:text-slate-400 font-mono text-xs">
                            #{node.id.substring(0, 7)}
                          </span>
                        </div>
                      </div>

                      {/* Arrow Connector line to next node */}
                      {index < activeFlow.nodes.length - 1 && (
                        <div className="flex justify-center my-2">
                          <div className="flex flex-col items-center">
                            <div className="w-0.5 h-6 bg-slate-800" />
                            <ArrowDown className="w-4 h-4 text-slate-600 -mt-1" />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Nodes Count: {activeFlow.nodes.length} connected</span>
              <button
                onClick={() => onDeleteFlow(activeFlow.id)}
                className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Visual Flow
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE NEW FLOW MODAL */}
      {isNewFlowModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateFlow}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4"
          >
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <Workflow className="w-5 h-5 text-amber-400" />
              Create Visual Chat Route Flow
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Flow Name</label>
              <input
                type="text"
                placeholder="e.g. Abandoned Cart WhatsApp Follow-up"
                value={newFlowName}
                onChange={(e) => setNewFlowName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <input
                type="text"
                placeholder="Brief summary of what this visual route does..."
                value={newFlowDesc}
                onChange={(e) => setNewFlowDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Trigger Type</label>
                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="keyword">Keyword Match</option>
                  <option value="conversation_created">New Conversation Started</option>
                  <option value="order_placed">Order Placed in Chat</option>
                  <option value="sla_breach">SLA Warning / Breach</option>
                  <option value="abandoned_cart">Abandoned Cart Event</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Trigger Keywords
                </label>
                <input
                  type="text"
                  placeholder="price, shop, buy, info"
                  value={triggerKeyword}
                  onChange={(e) => setTriggerKeyword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewFlowModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-lg"
              >
                Build Visual Route
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD NODE MODAL */}
      {isAddNodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddNodeToActiveFlow}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4"
          >
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              Add Pathway Action Node
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Node Type</label>
              <select
                value={nodeType}
                onChange={(e) => setNodeType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200"
              >
                <option value="send_message">Send Automated Message</option>
                <option value="send_product_catalog">Send Interactive Meta Product Catalog</option>
                <option value="ai_copilot_handover">AI Agent Persona Copilot Handover</option>
                <option value="condition_branch">IF / ELSE Condition Branch</option>
                <option value="add_tag">Add Contact Tag</option>
                <option value="assign_agent">Assign Human Agent</option>
                <option value="delay">Wait / Delay Drip Timer</option>
                <option value="webhook_n8n">Trigger n8n / External Webhook</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Node Title</label>
              <input
                type="text"
                placeholder={getPresetNodeTitle(nodeType)}
                value={nodeTitle}
                onChange={(e) => setNodeTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Configuration</label>
              <input
                type="text"
                placeholder={getPresetNodeDesc(nodeType)}
                value={nodeDesc}
                onChange={(e) => setNodeDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200"
              />
            </div>

            {/* Extra n8n Webhook Config Fields */}
            {nodeType === 'webhook_n8n' && (
              <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-800/40 space-y-3">
                <div className="flex items-center gap-2 text-teal-300 text-xs font-bold">
                  <Webhook className="w-4 h-4 text-teal-400" />
                  n8n Custom Webhook Parameters
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Webhook Endpoint URL</label>
                    <input
                      type="url"
                      value={n8nUrl}
                      onChange={(e) => setN8nUrl(e.target.value)}
                      placeholder="https://n8n.company.com/webhook/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-teal-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">HTTP Method</label>
                    <select
                      value={n8nMethod}
                      onChange={(e) => setN8nMethod(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono"
                    >
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="GET">GET</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">JSON Event Payload Template</label>
                  <textarea
                    rows={3}
                    value={n8nPayload}
                    onChange={(e) => setN8nPayload(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-[11px] font-mono text-emerald-300 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddNodeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-lg"
              >
                Append Node to Flow
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
