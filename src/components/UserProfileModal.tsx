import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Bell,
  LogOut,
  Camera,
  Check,
  X,
  Lock,
  Globe,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Users,
  Activity,
  KeyRound,
  Sparkles,
  Laptop,
} from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'security' | 'notifications' | 'sessions'>('details');
  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [userStatus, setUserStatus] = useState<'online' | 'busy' | 'away'>('online');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSaveSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleSelectPreset = (url: string) => {
    setFormData({ ...formData, avatar: url });
  };

  const handleApplyCustomAvatar = () => {
    if (customAvatarInput.trim()) {
      setFormData({ ...formData, avatar: customAvatarInput.trim() });
      setCustomAvatarInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-500/50 shadow-md"
              />
              <span
                className={`w-3.5 h-3.5 rounded-full border-2 border-slate-900 absolute bottom-0 right-0 ${
                  userStatus === 'online'
                    ? 'bg-emerald-400'
                    : userStatus === 'busy'
                    ? 'bg-amber-400'
                    : 'bg-slate-500'
                }`}
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {formData.name}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                  {formData.role}
                </span>
              </h2>
              <p className="text-xs text-slate-400">{formData.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status selector & Tabs Navigation */}
        <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'details'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Profile Details
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'security'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Security & 2FA
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'notifications'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" /> Notifications
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'sessions'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" /> Sessions ({formData.activeSessionsCount})
            </button>
          </div>

          {/* Quick Status Picker */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold px-1.5">Status:</span>
            <button
              onClick={() => setUserStatus('online')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                userStatus === 'online' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-400'
              }`}
            >
              Online
            </button>
            <button
              onClick={() => setUserStatus('busy')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                userStatus === 'busy' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-400'
              }`}
            >
              Busy
            </button>
            <button
              onClick={() => setUserStatus('away')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                userStatus === 'away' ? 'bg-slate-800 text-slate-300' : 'text-slate-400'
              }`}
            >
              Away
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {saveSuccessMsg}
            </div>
          )}

          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Avatar Selector */}
              <div>
                <label className="block font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-teal-400" /> Avatar Image
                </label>
                <div className="flex items-center space-x-3 mb-2">
                  {AVATAR_PRESETS.map((url, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleSelectPreset(url)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                        formData.avatar === url ? 'border-teal-400 ring-2 ring-teal-500/40 scale-105' : 'border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    placeholder="Or paste custom image URL..."
                    value={customAvatarInput}
                    onChange={(e) => setCustomAvatarInput(e.target.value)}
                    className="flex-1 bg-slate-950 text-slate-200 p-2 rounded-lg border border-slate-800 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomAvatar}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Enterprise System Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-teal-500"
                  >
                    <option value="Admin & System Owner">Admin & System Owner</option>
                    <option value="Senior Supervisor">Senior Supervisor</option>
                    <option value="Support Specialist">Support Specialist</option>
                    <option value="Sales SDR">Sales SDR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Status Bio / Description</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Preferred Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800"
                  >
                    <option value="UTC-07:00 (Pacific Time)">UTC-07:00 (Pacific Time)</option>
                    <option value="UTC-05:00 (Eastern Time)">UTC-05:00 (Eastern Time)</option>
                    <option value="UTC+00:00 (GMT/London)">UTC+00:00 (GMT/London)</option>
                    <option value="UTC+01:00 (CET/Berlin)">UTC+01:00 (CET/Berlin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Interface Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-lg border border-slate-800"
                  >
                    <option value="English (United States)">English (United States)</option>
                    <option value="Spanish (Español)">Spanish (Español)</option>
                    <option value="German (Deutsch)">German (Deutsch)</option>
                    <option value="French (Français)">French (Français)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-lg flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-100 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-teal-400" /> Two-Factor Authentication (2FA)
                    </h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Enforce TOTP authenticator app verification upon every login.
                    </p>
                  </div>

                  <button
                    onClick={() => setFormData({ ...formData, twoFactorEnabled: !formData.twoFactorEnabled })}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      formData.twoFactorEnabled
                        ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {formData.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" /> Enterprise Access Key & Credentials
                </h3>
                <p className="text-slate-400 text-[11px]">
                  Last password update: 14 days ago. Zero-trust sessions backed by Supabase Auth & JWT.
                </p>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to ' + formData.email)}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                >
                  Send Password Reset Email
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-200">Email Digest Notifications</h4>
                  <p className="text-slate-400 text-[11px]">Receive hourly unread conversation summaries.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                  className="w-4 h-4 accent-teal-500 rounded"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-200">Desktop Push Notifications</h4>
                  <p className="text-slate-400 text-[11px]">Pop-up alerts for inbound Lead Ads & WhatsApp messages.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.desktopNotifications}
                  onChange={(e) => setFormData({ ...formData, desktopNotifications: e.target.checked })}
                  className="w-4 h-4 accent-teal-500 rounded"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-200">WhatsApp SLA Escalation Alerts</h4>
                  <p className="text-slate-400 text-[11px]">Instant priority ping when a VIP SLA breach warning triggers.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.whatsappEscalationAlerts}
                  onChange={(e) => setFormData({ ...formData, whatsappEscalationAlerts: e.target.checked })}
                  className="w-4 h-4 accent-teal-500 rounded"
                />
              </div>
            </div>
          )}

          {/* TAB 4: SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h4 className="font-bold text-slate-100">Current Web Session (Active)</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{formData.lastLogin}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                    THIS DEVICE
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-teal-400" />
                    <div>
                      <h4 className="font-bold text-slate-100">Mobile Ansury PWA Client</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Yesterday at 11:20 PM (iOS Safari)</p>
                    </div>
                  </div>
                  <button className="text-[10px] text-rose-400 hover:underline font-bold">
                    Revoke Access
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions & Log Out */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="px-4 py-2 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 font-bold text-xs hover:bg-rose-900 transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-slate-100 text-base">Log Out of Ansury?</h3>
              <p className="text-xs text-slate-400 mt-1">
                You will be signed out of your current session. All WhatsApp Coexistence syncs and AI Lead qualification agents will continue running on the server.
              </p>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg"
              >
                Confirm Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
