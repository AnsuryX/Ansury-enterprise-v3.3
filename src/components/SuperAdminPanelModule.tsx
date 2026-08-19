import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Sparkles,
  Plus,
  Crown,
  KeyRound,
  Trash2,
  RefreshCw,
  Zap,
  Globe,
  Settings,
  Shield,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Sliders,
  Check,
} from 'lucide-react';
import { TenantAccount, TenantStatus } from '../types';

interface SuperAdminPanelModuleProps {
  currentAdminEmail: string;
}

export const SuperAdminPanelModule: React.FC<SuperAdminPanelModuleProps> = ({
  currentAdminEmail,
}) => {
  const [tenants, setTenants] = useState<TenantAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State for Plan Editing
  const [editingTenant, setEditingTenant] = useState<TenantAccount | null>(null);
  const [editPlan, setEditPlan] = useState<'Free Trial' | 'Growth SaaS' | 'Enterprise Ultra' | 'Custom VIP'>('Growth SaaS');
  const [editMaxAgents, setEditMaxAgents] = useState<number>(10);
  const [editQuota, setEditQuota] = useState<number>(50000);

  // Modal State for Provisioning New Tenant
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tenants');
      const data = await res.json();
      if (data.success && data.tenants) {
        setTenants(data.tenants);
      }
    } catch (err) {
      console.error('Failed to fetch SaaS tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: TenantStatus, notes?: string) => {
    try {
      const res = await fetch(`/api/admin/tenants/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      const data = await res.json();
      if (data.success && data.tenants) {
        setTenants(data.tenants);
      }
    } catch (err) {
      console.error('Error updating tenant status:', err);
    }
  };

  const handleSavePlan = async () => {
    if (!editingTenant) return;
    try {
      const res = await fetch(`/api/admin/tenants/${editingTenant.id}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: editPlan,
          maxAgents: editMaxAgents,
          monthlyMessageQuota: editQuota,
        }),
      });
      const data = await res.json();
      if (data.success && data.tenants) {
        setTenants(data.tenants);
        setEditingTenant(null);
      }
    } catch (err) {
      console.error('Error saving tenant plan:', err);
    }
  };

  const handleDeleteTenant = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete tenant workspace '${name}'?`)) return;
    try {
      const res = await fetch(`/api/admin/tenants/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && data.tenants) {
        setTenants(data.tenants);
      }
    } catch (err) {
      console.error('Error deleting tenant:', err);
    }
  };

  const handleProvisionTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newAdminEmail,
          name: newAdminName || newAdminEmail.split('@')[0],
          company: newCompanyName || 'Pro Enterprise Workspace',
          role: 'Admin & System Owner',
        }),
      });
      const data = await res.json();

      // If registered as pending, immediately auto-approve as Super Admin provisioned
      if (data.tenant) {
        await handleUpdateStatus(data.tenant.id, 'APPROVED', 'Manually provisioned by Super Admin Ansury');
      }
      setShowProvisionModal(false);
      setNewCompanyName('');
      setNewAdminName('');
      setNewAdminEmail('');
      fetchTenants();
    } catch (err) {
      console.error('Failed to provision tenant:', err);
    }
  };

  // Filtered List
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = tenants.filter((t) => t.status === 'PENDING_APPROVAL').length;
  const approvedCount = tenants.filter((t) => t.status === 'APPROVED').length;
  const suspendedCount = tenants.filter((t) => t.status === 'SUSPENDED').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100 font-sans">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/60 border border-teal-800/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-900/50">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black tracking-tight text-white">SaaS Master Admin Control</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-bold uppercase">
                  Super Admin Exclusive
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as <strong>Ansury</strong> (<span className="text-teal-300 font-mono">{currentAdminEmail}</span>) — Multi-Tenant SaaS Workspace Approval & Access Provisioning
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={fetchTenants}
            title="Refresh Tenant Requests"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowProvisionModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-900/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Tenant Workspace</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Tenants */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total SaaS Workspaces</span>
            <Building2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white">{tenants.length}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Globe className="w-3 h-3 text-teal-400" />
            <span>Multi-tenant isolated schemas</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className={`p-5 rounded-2xl border space-y-2 shadow-xl transition-all ${
          pendingCount > 0
            ? 'bg-amber-950/30 border-amber-800/60 ring-1 ring-amber-500/20'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-200">{pendingCount}</div>
          <div className="text-[11px] text-amber-300/80">Requires Super Admin sign-off</div>
        </div>

        {/* Active Approved Workspaces */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Active Workspaces</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300">{approvedCount}</div>
          <div className="text-[11px] text-slate-400">Granted live dashboard access</div>
        </div>

        {/* Suspended / Blocked */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Suspended / Blocked</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-slate-200">{suspendedCount}</div>
          <div className="text-[11px] text-slate-400">Access disabled for policy check</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search company, admin name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'SUSPENDED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st === 'ALL' ? 'All Registrations' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Organization / Admin</th>
                <th className="p-4">Requested Role</th>
                <th className="p-4">Status & Access</th>
                <th className="p-4">SaaS Plan & Limits</th>
                <th className="p-4">Requested On</th>
                <th className="p-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No workspace requests found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const isAnsuryAccount = tenant.email.toLowerCase() === 'yansurylabs@gmail.com';

                  return (
                    <tr
                      key={tenant.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        tenant.status === 'PENDING_APPROVAL' ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Organization & Admin */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center shrink-0 shadow-md ${
                            isAnsuryAccount
                              ? 'bg-gradient-to-tr from-amber-500 to-teal-500 text-white'
                              : 'bg-slate-800 text-teal-300 border border-slate-700'
                          }`}>
                            {tenant.company.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-100 flex items-center gap-1.5">
                              <span>{tenant.company}</span>
                              {isAnsuryAccount && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-bold">
                                  MASTER SUPER ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px] flex items-center gap-2">
                              <span>{tenant.name}</span>
                              <span>•</span>
                              <span className="font-mono text-teal-400">{tenant.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]">
                          {tenant.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {tenant.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved / Active
                          </span>
                        )}

                        {tenant.status === 'PENDING_APPROVAL' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            Pending Admin Sign-off
                          </span>
                        )}

                        {tenant.status === 'SUSPENDED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Suspended
                          </span>
                        )}

                        {tenant.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            Rejected Request
                          </span>
                        )}
                      </td>

                      {/* Plan & Limits */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-200">{tenant.plan}</span>
                            <button
                              onClick={() => {
                                setEditingTenant(tenant);
                                setEditPlan(tenant.plan);
                                setEditMaxAgents(tenant.maxAgents);
                                setEditQuota(tenant.monthlyMessageQuota);
                              }}
                              className="text-[10px] text-teal-400 hover:underline flex items-center gap-0.5"
                            >
                              <Sliders className="w-3 h-3" /> Edit Quota
                            </button>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Agents: <strong className="text-slate-200">{tenant.maxAgents}</strong> | Quota: <strong className="text-slate-200">{tenant.monthlyMessageQuota.toLocaleString()} msg/mo</strong>
                          </div>
                        </div>
                      </td>

                      {/* Requested On */}
                      <td className="p-4 font-mono text-[11px] text-slate-400">
                        {tenant.requestedAt}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        {isAnsuryAccount ? (
                          <span className="text-[11px] text-slate-500 italic">Master Owner</span>
                        ) : (
                          <div className="flex items-center justify-end space-x-1.5">
                            
                            {/* Approve Button */}
                            {tenant.status !== 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateStatus(tenant.id, 'APPROVED', 'Approved by Ansury')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </button>
                            )}

                            {/* Suspend / Deactivate Button */}
                            {tenant.status === 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateStatus(tenant.id, 'SUSPENDED', 'Suspended by Super Admin')}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-800 text-xs font-bold transition-all"
                              >
                                Suspend
                              </button>
                            )}

                            {/* Reject Request Button */}
                            {tenant.status === 'PENDING_APPROVAL' && (
                              <button
                                onClick={() => handleUpdateStatus(tenant.id, 'REJECTED', 'Rejected by Super Admin')}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 text-xs font-bold transition-all"
                              >
                                Reject
                              </button>
                            )}

                            {/* Delete Tenant */}
                            <button
                              onClick={() => handleDeleteTenant(tenant.id, tenant.company)}
                              title="Delete Workspace Schema"
                              className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Quota & Plan Modal */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm text-white">Configure SaaS Plan & Quotas</h3>
              </div>
              <button onClick={() => setEditingTenant(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Organization</label>
                <div className="font-bold text-slate-100">{editingTenant.company} ({editingTenant.email})</div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">SaaS Tier Plan</label>
                <select
                  value={editPlan}
                  onChange={(e: any) => setEditPlan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="Free Trial">Free Trial (5 Agents, 10k Msgs)</option>
                  <option value="Growth SaaS">Growth SaaS (15 Agents, 50k Msgs)</option>
                  <option value="Enterprise Ultra">Enterprise Ultra (50 Agents, 200k Msgs)</option>
                  <option value="Custom VIP">Custom VIP (Unlimited WhatsApp Dual Coexistence)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Max Agent Seats</label>
                  <input
                    type="number"
                    value={editMaxAgents}
                    onChange={(e) => setEditMaxAgents(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Monthly Msg Quota</label>
                  <input
                    type="number"
                    value={editQuota}
                    onChange={(e) => setEditQuota(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setEditingTenant(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlan}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-900/40"
              >
                Save SaaS Limits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provision New Tenant Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleProvisionTenant}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm text-white">Super Admin Direct Workspace Provisioning</h3>
              </div>
              <button type="button" onClick={() => setShowProvisionModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Enterprise Global"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Admin Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Admin Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="jane@acmeenterprise.org"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowProvisionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-teal-900/40"
              >
                Instantly Provision & Approve
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
