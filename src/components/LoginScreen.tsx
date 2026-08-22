import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  Building2,
  Sparkles,
  UserCheck,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Mail,
  User,
  Shield,
  Layers,
  Clock,
  Briefcase,
  Globe2,
} from 'lucide-react';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  brandName?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  brandName = 'Ansury',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Form State — Clean, non-hardcoded defaults
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [industry, setIndustry] = useState('Technology & SaaS');
  const [plan, setPlan] = useState<'Enterprise Ultra' | 'Growth SaaS' | 'Custom VIP'>('Enterprise Ultra');
  const [role, setRole] = useState<string>('Admin & System Owner');

  // Status & Info Modals
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showArchInfo, setShowArchInfo] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setPendingUser(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        if (data.token) {
          localStorage.setItem('ansury_auth_token', data.token);
        }
        if (data.tenant) {
          localStorage.setItem('ansury_active_tenant', JSON.stringify(data.tenant));
        }
        localStorage.setItem('ansury_user_profile', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else if (data.status === 'PENDING_APPROVAL') {
        setPendingUser(data.user || null);
      } else {
        setErrorMsg(data.message || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('Sign-in network exception:', err);
      setErrorMsg('Unable to connect to authentication service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please provide your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (!workspaceName.trim()) {
      setErrorMsg('Please enter your Organization or Workspace name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setPendingUser(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          password,
          workspaceName: workspaceName.trim(),
          industry,
          plan,
          role,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        if (data.token) {
          localStorage.setItem('ansury_auth_token', data.token);
        }
        if (data.tenant) {
          localStorage.setItem('ansury_active_tenant', JSON.stringify(data.tenant));
        }
        localStorage.setItem('ansury_user_profile', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.message || 'Workspace provisioning failed. Please verify details.');
      }
    } catch (err: any) {
      console.error('Sign-up network exception:', err);
      setErrorMsg('Network error encountered while provisioning workspace.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-y-auto font-sans text-slate-100 selection:bg-teal-500 selection:text-white">
      {/* Background Aesthetic Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(30,58,138,0.2),transparent_50%)] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-500/20 ring-1 ring-white/20">
            A
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-white">{brandName}</span>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                Enterprise Multi-Tenant
              </span>
            </div>
            <p className="text-xs text-slate-400">Omnichannel Coexistence & Automation Platform</p>
          </div>
        </div>

        <button
          onClick={() => setShowArchInfo(!showArchInfo)}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-2 transition-all shadow-md"
        >
          <Layers className="w-3.5 h-3.5 text-teal-400" />
          <span>Multi-Tenancy Architecture</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto p-6">
        {/* Architecture Info Banner */}
        {showArchInfo && (
          <div className="mb-6 p-4 rounded-2xl bg-teal-950/60 border border-teal-800/60 text-slate-200 text-xs space-y-2 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between font-bold text-teal-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Enterprise Multi-Tenant Security & Storage
              </span>
              <button onClick={() => setShowArchInfo(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every organization in Ansury is partitioned into isolated workspace domains with encrypted tenant records, HMAC-SHA256 password security, active session tokens, and durable database persistence.
            </p>
            <ul className="text-[11px] space-y-1 text-teal-200/90 list-disc list-inside">
              <li>
                <strong>Sign In:</strong> Authenticates against stored database credentials and binds session tokens.
              </li>
              <li>
                <strong>Create Workspace:</strong> Provisions a new multi-tenant workspace with isolated settings.
              </li>
              <li>
                <strong>Data Persistence:</strong> All contacts, conversations, calendar events, and audit trails persist across sessions.
              </li>
            </ul>
          </div>
        )}

        {/* Pending Approval Holding Screen */}
        {pendingUser ? (
          <div className="bg-slate-900/90 border border-amber-800/60 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6 animate-in zoom-in duration-150">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-slate-100">Workspace Registration Pending Approval</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Thank you, <strong>{pendingUser.name}</strong>! Your enterprise workspace sign-up for{' '}
                <strong className="text-teal-300">{pendingUser.email}</strong> is currently pending administrator verification.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => setPendingUser(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                ← Return to Sign In
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
            {/* Lock Icon & Title */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center mx-auto text-teal-400 shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {mode === 'signin' ? 'Sign In to Workspace' : 'Create Enterprise Workspace'}
              </h1>
              <p className="text-xs text-slate-400">
                {mode === 'signin'
                  ? 'Enter your work credentials to access your tenant dashboard'
                  : 'Provision a dedicated enterprise workspace with multi-tenancy'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  mode === 'signin' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  mode === 'signup' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Create Workspace
              </button>
            </div>

            {/* Sign In Form */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-400" />
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-all font-mono"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-all font-mono"
                  />
                </div>

                {/* Error Alert */}
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-900/40 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Authenticating Session...
                    </>
                  ) : (
                    <>
                      Sign In to Workspace
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Onboarding / Sign Up Form */
              <form onSubmit={handleSignUp} className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                {/* Work Email */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-400" />
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@acmecorp.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-all font-mono"
                  />
                </div>

                {/* Workspace / Company Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-400" />
                    Organization / Workspace Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Acme Global Technologies"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                {/* Industry & Plan in 2 columns */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-teal-400" />
                      Industry
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                    >
                      <option value="Technology & SaaS">Technology & SaaS</option>
                      <option value="Healthcare & Life Sciences">Healthcare</option>
                      <option value="Financial Services">Financial Services</option>
                      <option value="E-Commerce & Retail">E-Commerce</option>
                      <option value="Hospitality & Services">Hospitality</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <Globe2 className="w-3 h-3 text-teal-400" />
                      Tier Plan
                    </label>
                    <select
                      value={plan}
                      onChange={(e: any) => setPlan(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                    >
                      <option value="Enterprise Ultra">Enterprise Ultra</option>
                      <option value="Growth SaaS">Growth SaaS</option>
                      <option value="Custom VIP">Custom VIP</option>
                    </select>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                    Create Secure Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Choose a strong password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-all font-mono"
                  />
                </div>

                {/* Error Alert */}
                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Provision Workspace Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-900/40 transition-all cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Provisioning Workspace Schema...
                    </>
                  ) : (
                    <>
                      Create & Provision Workspace
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Footer Note */}
            <div className="pt-4 border-t border-slate-800/80 text-center space-y-1">
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Zero-Trust Token Encryption & Multi-Tenant Isolation</span>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto p-6 text-center text-xs text-slate-500">
        © 2026 Ansury Enterprise Omnichannel & Coexistence Platform. All rights reserved.
      </footer>
    </div>
  );
};

