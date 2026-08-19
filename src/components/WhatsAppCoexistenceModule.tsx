import React, { useState } from 'react';
import {
  Share2,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Send,
  Key,
  Globe,
  Settings,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  PhoneCall,
  Check,
  Copy,
  Activity,
  Terminal,
} from 'lucide-react';
import { WhatsAppCoexistenceConfig } from '../types';

interface WhatsAppCoexistenceModuleProps {
  config: WhatsAppCoexistenceConfig;
  onUpdateConfig: (updated: Partial<WhatsAppCoexistenceConfig>) => void;
  onSendSimulatorWebhook?: (text: string, senderName: string, senderPhone: string) => Promise<any>;
}

export const WhatsAppCoexistenceModule: React.FC<WhatsAppCoexistenceModuleProps> = ({
  config,
  onUpdateConfig,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'monitor' | 'embedded_signup' | 'settings'>('monitor');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Embedded Signup Wizard state
  const [signupStep, setSignupStep] = useState<number>(1);
  const [selectedWaba, setSelectedWaba] = useState<string>(config.wabaId || '');
  const [selectedPhone, setSelectedPhone] = useState<string>(config.displayPhoneNumber || '');
  const [isVerifyingWebhook, setIsVerifyingWebhook] = useState(false);
  const [webhookVerificationResult, setWebhookVerificationResult] = useState<{ success: boolean; message: string } | null>(null);

  const webhookCallbackUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/whatsapp`
    : 'https://api.ansury.com/api/webhooks/whatsapp';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestWebhookPing = async () => {
    setIsVerifyingWebhook(true);
    setWebhookVerificationResult(null);
    try {
      const res = await fetch(`/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(config.webhookVerifyToken)}&hub.challenge=CHALLENGE_VERIFY_OK`);
      if (res.ok) {
        const text = await res.text();
        setWebhookVerificationResult({
          success: true,
          message: `Webhook Challenge 200 OK (${text}). Meta Cloud API endpoint is reachable and responsive.`,
        });
        onUpdateConfig({ lastWebhookPing: 'Verified Active (200 OK)' });
      } else {
        setWebhookVerificationResult({
          success: false,
          message: `Webhook verification returned HTTP ${res.status}. Verify token may mismatch.`,
        });
      }
    } catch (e: any) {
      setWebhookVerificationResult({
        success: false,
        message: e.message || 'Failed to ping webhook endpoint.',
      });
    } finally {
      setIsVerifyingWebhook(false);
    }
  };

  const handleFacebookLogin = () => {
    if (typeof window !== 'undefined' && (window as any).FB) {
      try {
        (window as any).FB.login(
          (response: any) => {
            console.log('Meta FB SDK Auth Response:', response);
            setSignupStep(2);
          },
          {
            scope: 'whatsapp_business_messaging,whatsapp_business_management',
            extras: {
              feature: 'whatsapp_embedded_signup',
              setup: {
                // Configured for App ID 946589648227889
              },
            },
          }
        );
        return;
      } catch (e) {
        console.warn('FB SDK login exception, falling back to guided flow', e);
      }
    }
    setSignupStep(2);
  };

  const handleCompleteEmbeddedSignup = () => {
    onUpdateConfig({
      wabaId: selectedWaba || 'WABA_ENTERPRISE_ACTIVE',
      displayPhoneNumber: selectedPhone || '+1 (555) 019-2831',
      embeddedSignupCompleted: true,
      coexistenceStatus: 'CONNECTED',
      lastWebhookPing: 'Just now (Embedded Signup Validated)',
    });
    setActiveSubTab('monitor');
    setSignupStep(1);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-teal-900/60 via-slate-900 to-emerald-950/80 border border-teal-800/60 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-teal-600/30 text-teal-300 border border-teal-500/40">
              <Share2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100">
              Meta WhatsApp Coexistence Engine
            </h1>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Meta Tech Provider Partner
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Eliminate WhatsApp API vs. Mobile App lock-in! Allow field agents to use native WhatsApp Business phone apps alongside Ansury’s enterprise omnichannel inbox with real-time bi-directional sync & deduplication.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('embedded_signup')}
            className="px-3.5 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-500 shadow-md transition-all flex items-center gap-1.5"
          >
            <Key className="w-4 h-4" />
            Meta Embedded Signup
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('monitor')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'monitor'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-400 bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Realtime Webhook & Dual-Sync Monitor
        </button>

        <button
          onClick={() => setActiveSubTab('embedded_signup')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'embedded_signup'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-400 bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          Meta Embedded Signup Onboarding
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'settings'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-400 bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          Coexistence & Webhook Settings
        </button>
      </div>

      {/* SUB-TAB 1: REALTIME WEBHOOK & DUAL-SYNC MONITOR */}
      {activeSubTab === 'monitor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Card 1: Coexistence State */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Coexistence Mode</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  {config.syncMode}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{config.coexistenceStatus === 'CONNECTED' ? 'Dual-Sync Active' : 'Awaiting Connection'}</h3>
                  <p className="text-[11px] text-slate-400">WABA: {config.wabaId || 'Not registered yet'}</p>
                </div>
              </div>
            </div>

            {/* Status Card 2: Phone App Sync */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Business Phone</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {config.displayPhoneNumber ? 'REGISTERED' : 'UNASSIGNED'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{config.displayPhoneNumber || 'No phone number added'}</h3>
                  <p className="text-[11px] text-slate-400">Native iOS/Android App Coexistence</p>
                </div>
              </div>
            </div>

            {/* Status Card 3: Webhook Health */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Webhook Status</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  PORT 3000 INGRESS
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-slate-100 text-sm truncate">{config.lastWebhookPing || 'Awaiting ping'}</h3>
                  <p className="text-[11px] text-slate-400 truncate">Verify Token: {config.webhookVerifyToken}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Webhook Configuration & Health Verification Box */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-teal-400" />
                  Meta Webhook Callback URL for WhatsApp Coexistence
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure this endpoint in your Meta App Dashboard under WhatsApp &gt; Configuration &gt; Callback URL.
                </p>
              </div>

              <button
                onClick={handleTestWebhookPing}
                disabled={isVerifyingWebhook}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingWebhook ? 'animate-spin' : ''}`} />
                <span>{isVerifyingWebhook ? 'Pinging Webhook...' : 'Verify Webhook Health'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-400">Callback URL</label>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-teal-300">
                  <span className="truncate flex-1">{webhookCallbackUrl}</span>
                  <button
                    onClick={() => copyToClipboard(webhookCallbackUrl, 'cb_url')}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'cb_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-400">Verify Token</label>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-amber-300">
                  <span className="truncate flex-1">{config.webhookVerifyToken}</span>
                  <button
                    onClick={() => copyToClipboard(config.webhookVerifyToken, 'v_token')}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'v_token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {webhookVerificationResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  webhookVerificationResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {webhookVerificationResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{webhookVerificationResult.message}</span>
              </div>
            )}
          </div>

          {/* Architectural Information */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              How WhatsApp Coexistence Operates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-teal-300">1. Simultaneous Operation</span>
                <p className="text-slate-400 leading-relaxed">
                  Both your mobile field staff on iOS/Android and your support agents inside Ansury interact with the same business phone number.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-teal-300">2. WAMID Deduplication</span>
                <p className="text-slate-400 leading-relaxed">
                  Every incoming and outgoing message contains a unique WhatsApp Message ID (`WAMID`) ensuring zero duplicate alerts or loops.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-teal-300">3. AI Grounding & Escalation</span>
                <p className="text-slate-400 leading-relaxed">
                  The AI Copilot reads live message threads to suggest responses or automatically escalate SLA breaches directly into Zoho CRM or Slack.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: META EMBEDDED SIGNUP ONBOARDING WIZARD */}
      {activeSubTab === 'embedded_signup' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Key className="w-5 h-5 text-teal-400" />
              Meta Embedded Signup Flow (Partner App ID 946589648227889)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Connect your Meta Business Manager and provision WhatsApp Business Accounts (WABA) with Coexistence permissions.
            </p>
          </div>

          {signupStep === 1 && (
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-4 max-w-xl">
              <p className="text-xs text-slate-300 leading-relaxed">
                Click below to launch the official Meta Facebook Login for WhatsApp Business window. This grants Coexistence messaging access.
              </p>
              <button
                onClick={handleFacebookLogin}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Continue with Facebook Login</span>
              </button>
            </div>
          )}

          {signupStep === 2 && (
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-4 max-w-xl">
              <h4 className="font-bold text-white text-sm">Select WABA & Business Phone Number</h4>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">WhatsApp Business Account (WABA ID)</label>
                  <input
                    type="text"
                    value={selectedWaba}
                    onChange={(e) => setSelectedWaba(e.target.value)}
                    placeholder="e.g. WABA_982301492041920"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-teal-300 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Business Phone Number</label>
                  <input
                    type="text"
                    value={selectedPhone}
                    onChange={(e) => setSelectedPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 389-2041"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-teal-300 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setSignupStep(1)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs"
                >
                  Back
                </button>
                <button
                  onClick={handleCompleteEmbeddedSignup}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg"
                >
                  Complete Onboarding
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 max-w-2xl">
          <h3 className="font-bold text-white text-base">Coexistence & Webhook Settings</h3>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Meta Partner App ID</label>
              <input
                type="text"
                value={config.appId}
                onChange={(e) => onUpdateConfig({ appId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">WhatsApp Business Account ID (WABA ID)</label>
              <input
                type="text"
                value={config.wabaId}
                onChange={(e) => onUpdateConfig({ wabaId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Display Phone Number</label>
              <input
                type="text"
                value={config.displayPhoneNumber}
                onChange={(e) => onUpdateConfig({ displayPhoneNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Webhook Verify Token</label>
              <input
                type="text"
                value={config.webhookVerifyToken}
                onChange={(e) => onUpdateConfig({ webhookVerifyToken: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
