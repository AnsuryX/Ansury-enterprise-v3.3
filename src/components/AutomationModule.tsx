import React from 'react';
import { Zap, Plus, CheckCircle2, Bot, ArrowRight, Play } from 'lucide-react';
import { AutomationRule } from '../types';

interface AutomationModuleProps {
  automations: AutomationRule[];
}

export const AutomationModule: React.FC<AutomationModuleProps> = ({ automations }) => {
  return (
    <div className="flex-1 h-screen overflow-y-auto bg-slate-950 text-slate-100 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            AI Rules & Automation Engine
          </h1>
          <p className="text-xs text-slate-400">
            Trigger automated actions, team assignments, and Gemini AI Copilot workflows based on conversation events.
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-500 shadow-md flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          Create Automation Rule
        </button>
      </div>

      <div className="space-y-4">
        {automations.map((rule) => (
          <div
            key={rule.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{rule.name}</h3>
                  <p className="text-xs text-slate-400">{rule.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-400 font-mono">
                  {rule.executionCount} Executions
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    rule.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
            </div>

            {/* Conditions & Actions Flow Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                  WHEN & IF CONDITIONS
                </span>
                <div className="space-y-1 text-xs text-slate-300">
                  <p className="font-semibold text-teal-400">Event: {rule.event}</p>
                  {rule.conditions.map((cond, idx) => (
                    <p key={idx} className="bg-slate-900 p-1.5 rounded border border-slate-800">
                      • {cond.field} <span className="text-amber-400">{cond.operator}</span> "{cond.value}"
                    </p>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                  THEN AUTOMATED ACTIONS
                </span>
                <div className="space-y-1 text-xs text-slate-300">
                  {rule.actions.map((act, idx) => (
                    <p key={idx} className="bg-slate-900 p-1.5 rounded border border-slate-800 flex items-center justify-between">
                      <span>• {act.type.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-teal-300">{act.targetValue}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
