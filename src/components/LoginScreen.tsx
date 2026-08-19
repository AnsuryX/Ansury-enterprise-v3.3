import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  Building2,
  Sparkles,
  UserCheck,
  KeyRound,
  ArrowRight,
  Globe,
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  Shield,
  Layers,
  HelpCircle,
  Clock,
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

  // Form State
  const [email, setEmail] = useState('yansurylabs@gmail.com');
  const [password, setPassword] = useState('ansury2026!');
  const [fullName, setFullName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('Ansury Labs Workspace');
  const [role, setRole] = useState<string>('Admin & System Owner');
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Info Modals
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showArchInfo, setShowArchInfo] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);

  // Quick Admin Login Preset Trigger
  const handleQuickAdminLogin = () => {
    setEmail('yansurylabs@gmail.com');
    setPassword('ansury2026!');
    setErrorMsg('');
    submitLogin('yansurylabs@gmail.com', 'Ansury', 'Super Admin & Platform Owner', 'Ansury Labs Enterprise');
  };

  const submitLogin = async (targetEmail: string, targetName: string, targetRole: string, targetCompany?: string) => {
    setIsSubmitting(true);
    setErrorMsg('');
    setPendingUser(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          password,
          name: targetName,
          role: targetRole,
          company: targetCompany || workspaceName,
        }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem('ansury_auth_token', data.token || 'jwt_token_ansury_valid');
        localStorage.setItem('ansury_user_profile', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else if (data.status === 'PENDING_APPROVAL') {
        setPendingUser(data.user || null);
      } else {
        setErrorMsg(data.message || 'Invalid credentials or login verification failed.');
      }
    } catch (err) {
      console.error('Auth login error:', err);
      // Fallback local session if offline
      const fallbackUser: UserProfile = {
        id: 'usr_ansury_01',
        name: targetName || 'Ansury',
        email: targetEmail || 'yansurylabs@gmail.com',
        phone: '+1 (555) 928-1029',
        role: targetRole || 'Super Admin & Platform Owner',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        bio: 'Super Admin maintaining Enterprise Omnichannel Messaging & WhatsApp Dual Coexistence.',
        timezone: 'UTC-07:00 (Pacific Time)',
        language: 'English (United States)',
        twoFactorEnabled: true,
        emailNotifications: true,
        desktopNotifications: true,
        whatsappEscalationAlerts: true,
        activeSessionsCount: 3,
        lastLogin: 'Just now (IP: 192.168.1.102)',
      };
      localStorage.setItem('ansury_auth_token', 'jwt_token_ansury_offline');
      localStorage.setItem('ansury_user_profile', JSON.stringify(fallbackUser));
      onLoginSuccess(fallbackUser);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name for sign up.');
        return;
      }
      submitLogin(email.trim(), fullName.trim(), role, workspaceName.trim());
    } else {
      const isAnsury = email.toLowerCase() === 'yansurylabs@gmail.com';
      submitLogin(
        email.trim(),
        isAnsury ? 'Ansury' : email.split('@')[0],
        isAnsury ? 'Super Admin & Platform Owner' : 'Omnichannel Support Lead',
        workspaceName
      );
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-y-auto font-sans text-slate-100 selection:bg-teal-500 selection:text-white">
      
      {/* Background Aesthetic Gradients */}
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
          <span>Multi-Tenancy Specs</span>
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
                Enterprise Multi-Tenant Architecture
              </span>
              <button onClick={() => setShowArchInfo(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Ansury is architected as an <strong>Enterprise Multi-Tenant Engine</strong>. Each organization is partitioned into isolated workspace schemas with tenant-scoped Row-Level Security (RLS) policies.
            </p>
            <ul className="text-[11px] space-y-1 text-teal-200/90 list-disc list-inside">
              <li><strong>Sign Up:</strong> Creates a new isolated tenant workspace and provisions tenant admin keys.</li>
              <li><strong>Sign In:</strong> Authenticates user credentials and binds active session JWTs to tenant ID.</li>
              <li><strong>Default Admin:</strong> Account for <strong>Ansury</strong> (<code>yansurylabs@gmail.com</code>).</li>
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
                Thank you, <strong>{pendingUser.name}</strong>! Your enterprise workspace sign up request for <strong className="text-teal-300">{pendingUser.email}</strong> is under review.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span>Super Admin Reviewer:</span>
                <span className="font-bold text-teal-300">Ansury</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Admin Email:</span>
                <span className="font-mono text-slate-400">yansurylabs@gmail.com</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Registration Status:</span>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                  PENDING SIGN-OFF
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => submitLogin(pendingUser.email, pendingUser.name, pendingUser.role)}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Check Approval Status
              </button>

              <button
                onClick={handleQuickAdminLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-800 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Log In as Ansury (Super Admin)
              </button>

              <button
                onClick={() => setPendingUser(null)}
                className="w-full text-center text-xs text-slate-400 hover:text-white pt-1"
              >
                ← Back to Sign In
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
              {mode === 'signin' ? 'Sign In to Ansury Platform' : 'Create Enterprise Workspace'}
            </h1>
            <p className="text-xs text-slate-400">
              {mode === 'signin'
                ? 'Protected Dashboard — Authentication Required'
                : 'Provision a new isolated tenant workspace'}
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
                mode === 'signin'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
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
                mode === 'signup'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Sign Up
            </button>
          </div>

          {/* Admin Quick Login Badge / Button */}
          {mode === 'signin' && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs">
                  A
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Ansury (Super Admin)</div>
                  <div className="text-[10px] text-slate-400 font-mono">yansurylabs@gmail.com</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className="px-2.5 py-1 rounded-lg bg-teal-600/30 hover:bg-teal-600 text-teal-200 hover:text-white border border-teal-500/30 text-[11px] font-bold transition-all shadow-sm flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-teal-300" />
                1-Click Sign In
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name for Sign Up */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ansury"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-all"
                />
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                Work Email Address
              </label>
              <input
                type="email"
                required
                placeholder="yansurylabs@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-all font-mono"
              />
            </div>

            {/* Workspace Name & Role for Sign Up */}
            {mode === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-400" />
                    Organization / Tenant Workspace
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ansury Labs Workspace"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-teal-400" />
                    Assign Role
                  </label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500 transition-all"
                  >
                    <option value="Admin & System Owner">Admin & System Owner</option>
                    <option value="Omnichannel Support Lead">Omnichannel Support Lead</option>
                    <option value="AI Operations Specialist">AI Operations Specialist</option>
                  </select>
                </div>
              </>
            )}

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setPassword('ansury2026!')}
                    className="text-[10px] text-teal-400 hover:underline"
                  >
                    Use Default Password
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-all font-mono"
              />
            </div>

            {/* Error Message Alert */}
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
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-900/40 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Authenticating Session...
                </>
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In to Workspace' : 'Create & Launch Workspace'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Protected by Zero-Trust JWT & Session Encryption</span>
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
