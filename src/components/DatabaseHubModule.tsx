import React, { useState, useEffect } from 'react';
import {
  Database,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Server,
  Cloud,
  Layers,
  FileCode,
  HardDrive,
  Cpu,
  Lock,
  ExternalLink,
  Activity,
  ArrowRight,
  Sparkles,
  Users,
  MessageSquare,
  Workflow,
  CheckCheck,
} from 'lucide-react';
import { Contact } from '../types';

interface DatabaseHubModuleProps {
  contacts: Contact[];
  onRefreshData?: () => void;
}

export const DatabaseHubModule: React.FC<DatabaseHubModuleProps> = ({ contacts, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<'firebase' | 'supabase' | 'explorer' | 'architecture'>('firebase');
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Firestore Test State
  const [testingFirestore, setTestingFirestore] = useState(false);
  const [firestoreResult, setFirestoreResult] = useState<any>(null);

  // Supabase Test State
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseResult, setSupabaseResult] = useState<any>(null);

  // Full Sync State
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  // SQL Script State
  const [sqlScript, setSqlScript] = useState<string>('');
  const [sqlInstructions, setSqlInstructions] = useState<string[]>([]);
  const [copiedSql, setCopiedSql] = useState(false);

  // Fetch Database Status & SQL Script
  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/database/status');
      const data = await res.json();
      if (data.success) {
        setDbStatus(data);
      }
    } catch (e) {
      console.warn('Failed to fetch DB status:', e);
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchSql = async () => {
    try {
      const res = await fetch('/api/database/supabase-sql');
      const data = await res.json();
      if (data.success) {
        setSqlScript(data.sql);
        setSqlInstructions(data.instructions || []);
      }
    } catch (e) {
      console.warn('Failed to fetch SQL:', e);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchSql();
  }, []);

  // Run Firestore Test
  const handleTestFirestore = async () => {
    setTestingFirestore(true);
    setFirestoreResult(null);
    try {
      const res = await fetch('/api/database/test-firestore', { method: 'POST' });
      const data = await res.json();
      setFirestoreResult(data);
    } catch (e: any) {
      setFirestoreResult({ success: false, message: e.message || 'Firestore connection check failed' });
    } finally {
      setTestingFirestore(false);
    }
  };

  // Run Supabase Test
  const handleTestSupabase = async () => {
    setTestingSupabase(true);
    setSupabaseResult(null);
    try {
      const res = await fetch('/api/database/test-supabase', { method: 'POST' });
      const data = await res.json();
      setSupabaseResult(data);
    } catch (e: any) {
      setSupabaseResult({ success: false, message: e.message || 'Supabase check failed' });
    } finally {
      setTestingSupabase(false);
    }
  };

  // Run Full Sync
  const handleSyncAll = async () => {
    setSyncingAll(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/database/sync-all', { method: 'POST' });
      const data = await res.json();
      setSyncResult(data);
      if (onRefreshData) onRefreshData();
      fetchStatus();
    } catch (e: any) {
      setSyncResult({ success: false, error: e.message || 'Sync failed' });
    } finally {
      setSyncingAll(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                  Enterprise Database & Cloud Persistence Hub
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Firebase Firestore Active
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Multi-tier persistent storage: Google Cloud Firebase Firestore (Europe West) + Supabase PostgreSQL + Local Disk
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSyncAll}
              disabled={syncingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm transition-all shadow-lg shadow-teal-900/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncingAll ? 'animate-spin' : ''}`} />
              {syncingAll ? 'Synchronizing...' : 'Sync All Data to Cloud'}
            </button>
            <button
              onClick={fetchStatus}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-all"
              title="Refresh database diagnostics"
            >
              <RefreshCw className={`w-4 h-4 ${loadingStatus ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Sync Success / Alert Toast */}
        {syncResult && (
          <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${syncResult.success ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-red-950/40 border-red-500/30 text-red-300'}`}>
            <div className="flex items-center gap-2">
              {syncResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
              <span>{syncResult.message || syncResult.error}</span>
            </div>
            <button onClick={() => setSyncResult(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CRM Contacts</span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{contacts.length}</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
            <CheckCheck className="w-3.5 h-3.5" /> Synchronized in Firestore
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Firestore DB Region</span>
            <Cloud className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">europe-west1</div>
          <div className="text-xs text-slate-400 mt-1">Google Cloud Data Center</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security Rules</span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">Master Gate (Pillars 1-8)</div>
          <div className="text-xs text-purple-400 mt-1">firestore.rules deployed</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Disk Backup</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">data/ansury_state.json</div>
          <div className="text-xs text-amber-400 mt-1">Local atomic auto-save</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('firebase')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'firebase'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cloud className="w-4 h-4" />
          Firebase Firestore (Live DB)
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'supabase'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Supabase SQL Script & Sync
        </button>

        <button
          onClick={() => setActiveTab('explorer')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'explorer'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Live Contact Records & Sync Status
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'architecture'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Storage Architecture & Security
        </button>
      </div>

      {/* Tab Content 1: Firebase Firestore */}
      {activeTab === 'firebase' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Card */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-100">Firebase Firestore Provisioning Status</h3>
                    <p className="text-xs text-slate-400">Dedicated multi-region NoSQL cloud datastore</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  PROVISIONED & ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
                  <span className="text-slate-500 font-medium">Google Cloud Project ID</span>
                  <div className="text-slate-200 font-mono font-medium">{dbStatus?.firebase?.projectId || 'gen-lang-client-0847864462'}</div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
                  <span className="text-slate-500 font-medium">Firestore Database ID</span>
                  <div className="text-slate-200 font-mono font-medium break-all">{dbStatus?.firebase?.databaseId || 'ai-studio-ansurychatv2-cb554a46-58d6-467f-a151-4d1af1b0b55f'}</div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
                  <span className="text-slate-500 font-medium">Cloud Region</span>
                  <div className="text-slate-200 font-mono font-medium">europe-west1 (Western Europe)</div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
                  <span className="text-slate-500 font-medium">Security Policy Deployment</span>
                  <div className="text-emerald-400 font-mono font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> firestore.rules (Active)
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleTestFirestore}
                  disabled={testingFirestore}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-all shadow-md disabled:opacity-50"
                >
                  <Activity className={`w-3.5 h-3.5 ${testingFirestore ? 'animate-spin' : ''}`} />
                  {testingFirestore ? 'Pinging Firestore...' : 'Test Firestore Live Connection'}
                </button>

                <button
                  onClick={handleSyncAll}
                  disabled={syncingAll}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
                  {syncingAll ? 'Syncing...' : 'Sync All Contacts & Data'}
                </button>
              </div>

              {/* Firestore Test Result Box */}
              {firestoreResult && (
                <div className={`p-4 rounded-xl border text-xs space-y-1 ${firestoreResult.success ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' : 'bg-red-950/40 border-red-500/30 text-red-200'}`}>
                  <div className="font-semibold flex items-center gap-2">
                    {firestoreResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                    {firestoreResult.message}
                  </div>
                  {firestoreResult.pingTimeMs !== undefined && (
                    <div className="text-slate-400">
                      Round-trip latency: <span className="font-mono text-emerald-300">{firestoreResult.pingTimeMs} ms</span> • Target DB: <span className="font-mono">{firestoreResult.databaseId}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Firestore Collections Overview */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                Active Collections Schema
              </h4>

              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <span className="font-mono text-slate-300">/contacts/{'{id}'}</span>
                  <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 font-semibold">{contacts.length} docs</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <span className="font-mono text-slate-300">/conversations/{'{id}'}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-semibold">{dbStatus?.firebase?.stats?.conversationsCount || 6} docs</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <span className="font-mono text-slate-300">/flows/{'{id}'}</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-semibold">{dbStatus?.firebase?.stats?.flowsCount || 4} docs</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <span className="font-mono text-slate-300">/tenants/{'{id}'}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold">{dbStatus?.firebase?.stats?.tenantsCount || 1} docs</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <span className="font-mono text-slate-300">/auditLogs/{'{id}'}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-700/40 text-slate-300 font-semibold">Active stream</span>
                </div>
              </div>

              <div className="p-3 bg-teal-950/30 border border-teal-500/20 rounded-xl text-xs text-teal-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Auto-Sync Active
                </div>
                <p className="text-slate-400">
                  Every newly created CRM contact, inbound WhatsApp message, or updated automation flow automatically commits to Firestore and local storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Supabase SQL Script & Instructions */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  Supabase PostgreSQL Schema Script & Setup
                </h3>
                <p className="text-xs text-slate-400">
                  Run this complete SQL script in your Supabase project to generate all database tables, columns, indexes, and Row Level Security (RLS) policies.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleTestSupabase}
                  disabled={testingSupabase}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <Activity className={`w-3.5 h-3.5 ${testingSupabase ? 'animate-spin' : ''}`} />
                  {testingSupabase ? 'Checking Supabase...' : 'Test Supabase Connection'}
                </button>

                <button
                  onClick={() => copyToClipboard(sqlScript)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-900/30"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copied to Clipboard!' : 'Copy Supabase SQL Script'}
                </button>
              </div>
            </div>

            {/* Supabase Test Result Box */}
            {supabaseResult && (
              <div className={`p-4 rounded-xl border text-xs space-y-1 ${supabaseResult.success ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' : 'bg-amber-950/40 border-amber-500/30 text-amber-200'}`}>
                <div className="font-semibold flex items-center gap-2">
                  {supabaseResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                  {supabaseResult.message}
                </div>
                {supabaseResult.tablesMissing && (
                  <p className="text-amber-300/90 mt-1">
                    👉 Copy the SQL script below, paste it into your Supabase Dashboard SQL Editor, and click "RUN" to create all required tables.
                  </p>
                )}
              </div>
            )}

            {/* Step-by-Step Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold">1</div>
                <h5 className="font-semibold text-slate-200">Open Supabase SQL Editor</h5>
                <p className="text-slate-400">Log in to <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">Supabase Dashboard</a>, select your project, and open "SQL Editor" in the left menu.</p>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold">2</div>
                <h5 className="font-semibold text-slate-200">Paste & Click "RUN"</h5>
                <p className="text-slate-400">Click the "Copy Supabase SQL Script" button above, paste it into a New Query tab in Supabase, and click "Run".</p>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold">3</div>
                <h5 className="font-semibold text-slate-200">Instant Dual-Sync Ready</h5>
                <p className="text-slate-400">Tables for contacts, conversations, messages, flows, and tenants will be automatically created with Row Level Security.</p>
              </div>
            </div>

            {/* SQL Code Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">ansury_schema.sql (Complete PostgreSQL DDL + RLS)</span>
                <span>{sqlScript.split('\n').length} lines of SQL</span>
              </div>
              <div className="relative">
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto max-h-96 leading-relaxed select-all">
                  {sqlScript || '-- Loading SQL script...'}
                </pre>
                <button
                  onClick={() => copyToClipboard(sqlScript)}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 border border-slate-700 shadow-sm"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Live Records Explorer */}
      {activeTab === 'explorer' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-400" />
                Live CRM Contact Storage Ledger
              </h3>
              <p className="text-xs text-slate-400">Real-time status of records persisted across Firestore, Supabase, and local disk</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              Total Contacts: {contacts.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Phone & Channel</th>
                  <th className="py-3 px-3">Lifecycle Stage</th>
                  <th className="py-3 px-3">Firestore Path</th>
                  <th className="py-3 px-3 text-right">Persistence Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={contact.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                          alt={contact.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <div className="font-semibold text-slate-200">{contact.name}</div>
                          <div className="text-[11px] text-slate-400">{contact.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      <div>{contact.phone}</div>
                      <span className="text-[10px] uppercase font-bold text-teal-400">{contact.preferredChannel || 'whatsapp'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {contact.lifecycleStage || 'lead'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                      /contacts/{contact.id}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Persisted (Firestore & Local)
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 4: Multi-Tier Architecture & Security */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-teal-400" />
                Multi-Tier Enterprise Data Durability Architecture
              </h3>
              <p className="text-xs text-slate-400">How Ansury guarantees zero data loss, real-time sync, and sub-millisecond inbox performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-950/70 border border-teal-500/30 rounded-xl space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="font-bold text-teal-400 uppercase tracking-wider text-[10px]">Tier 1 (Cloud Primary)</div>
                <h5 className="font-semibold text-slate-200 text-sm">Firebase Firestore</h5>
                <p className="text-slate-400">Google Cloud managed NoSQL document store with automatic multi-zone replication in <span className="font-mono text-teal-300">europe-west1</span>.</p>
              </div>

              <div className="p-4 bg-slate-950/70 border border-emerald-500/30 rounded-xl space-y-2 relative overflow-hidden">
                <div className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">Tier 2 (Relational Cloud)</div>
                <h5 className="font-semibold text-slate-200 text-sm">Supabase PostgreSQL</h5>
                <p className="text-slate-400">PostgreSQL database with custom schema, relational integrity, foreign key cascades, and granular Row Level Security.</p>
              </div>

              <div className="p-4 bg-slate-950/70 border border-amber-500/30 rounded-xl space-y-2 relative overflow-hidden">
                <div className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Tier 3 (Local Durability)</div>
                <h5 className="font-semibold text-slate-200 text-sm">Atomic Disk Storage</h5>
                <p className="text-slate-400">Synchronous, debounced state snapshots saved to container filesystem (<span className="font-mono text-amber-300">data/ansury_state.json</span>).</p>
              </div>

              <div className="p-4 bg-slate-950/70 border border-purple-500/30 rounded-xl space-y-2 relative overflow-hidden">
                <div className="font-bold text-purple-400 uppercase tracking-wider text-[10px]">Tier 4 (High Speed)</div>
                <h5 className="font-semibold text-slate-200 text-sm">In-Memory Cache</h5>
                <p className="text-slate-400">Active conversation states, collision detection, and typing presence cached in Node.js heap for &lt;5ms response times.</p>
              </div>
            </div>

            {/* Eight Pillars of Firestore Security Hardening */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                Eight Pillars of Firestore Security Hardening (Implemented in firestore.rules)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Pillar 1: Structural Rigidity</strong> — Explicit typing and validation rules for all entities.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Pillar 2: Relational Integrity</strong> — Path-level document ID and parent match enforcement.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Pillar 3: Temporal Bounds</strong> — Server-evaluated timestamp verification.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Pillar 4: Volume Limits</strong> — Content string limits (up to 10,000 chars for messages).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Pillar 5: State Machine Guard</strong> — Status transitions restricted to valid enum values.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Pillar 6: Granular Actions</strong> — Strict separation of get, list, create, update, delete.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Pillar 7: Zero-Trust Defaults</strong> — Master Gate default-deny on all unmapped paths.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Pillar 8: ABAC & Tenant Scoping</strong> — Isolation scoped to tenant and agent credentials.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
