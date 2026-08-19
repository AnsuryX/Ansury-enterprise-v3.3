import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';
import { SLAPolicy } from '../types';

interface SLAEngineModuleProps {
  slas: SLAPolicy[];
}

export const SLAEngineModule: React.FC<SLAEngineModuleProps> = ({ slas }) => {
  return (
    <div className="flex-1 h-screen overflow-y-auto bg-slate-950 text-slate-100 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            Enterprise SLA Engine & Breach Guards
          </h1>
          <p className="text-xs text-slate-400">
            Enforce guaranteed response times, resolution targets, and manager escalation alerts.
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-500 shadow-md flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          Add SLA Policy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slas.map((policy) => (
          <div
            key={policy.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">{policy.name}</h3>
                <p className="text-xs text-slate-400">{policy.description}</p>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                ACTIVE POLICY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400 text-[10px]">First Response Target</span>
                <p className="font-bold text-teal-300 text-sm">{policy.firstResponseTimeMins} mins</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400 text-[10px]">Resolution Target</span>
                <p className="font-bold text-emerald-300 text-sm">{policy.resolutionTimeMins} mins</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Escalation Team:</span>
                <span className="text-slate-200 font-semibold">{policy.escalationTeam}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Breaches This Month:</span>
                <span className="text-rose-400 font-bold">{policy.breachCountThisMonth}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
