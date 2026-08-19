import React, { useEffect } from 'react';
import {
  MessageSquare,
  Share2,
  Users,
  Zap,
  ShieldCheck,
  FileCode,
  BarChart3,
  Settings,
  Sparkles,
  Bot,
  Layers,
  PhoneCall,
  CheckCircle2,
  Boxes,
  Cpu,
  Radio,
  ShoppingBag,
  Workflow,
  User,
  LogOut,
  ChevronRight,
  Shield,
  Crown,
  Lock,
  Calendar,
  Terminal,
} from 'lucide-react';
import { EnterpriseBrandConfig, UserProfile } from '../types';

export type ActiveTab =
  | 'super_admin'
  | 'inbox'
  | 'calendar'
  | 'ai_playground'
  | 'whatsapp_coexistence'
  | 'integrations'
  | 'meta_commerce'
  | 'broadcasts'
  | 'flow_builder'
  | 'ai_agents'
  | 'contacts'
  | 'automations'
  | 'slas'
  | 'templates'
  | 'widget_customizer'
  | 'analytics'
  | 'settings';


export type UserRoleCategory = 'Admin' | 'Manager' | 'Agent';

export function getRoleCategory(roleStr: string, email?: string): UserRoleCategory {
  const normalized = (roleStr || '').toLowerCase();
  const cleanEmail = (email || '').toLowerCase();

  if (
    cleanEmail === 'yansurylabs@gmail.com' ||
    normalized.includes('super admin') ||
    normalized.includes('admin') ||
    normalized.includes('owner')
  ) {
    return 'Admin';
  }
  if (
    normalized.includes('supervisor') ||
    normalized.includes('manager') ||
    normalized.includes('lead') ||
    normalized.includes('head')
  ) {
    return 'Manager';
  }
  return 'Agent';
}

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  brand: EnterpriseBrandConfig;
  unreadCount: number;
  coexistenceStatus: string;
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  brand,
  unreadCount,
  coexistenceStatus,
  userProfile,
  onOpenProfile,
  onLogout,
}) => {
  const isSuperAdmin = userProfile.email.toLowerCase() === 'yansurylabs@gmail.com' || userProfile.role.includes('Super Admin');
  const roleCategory = getRoleCategory(userProfile.role, userProfile.email);

  // Define all navigation items with allowed role categories
  const allNavItems = [
    ...(isSuperAdmin ? [{
      id: 'super_admin' as ActiveTab,
      label: 'SaaS Master Admin',
      icon: Crown,
      highlight: true,
      badge: 'PROVISIONING',
      allowedRoles: ['Admin'] as UserRoleCategory[],
    }] : []),
    {
      id: 'inbox' as ActiveTab,
      label: 'Omnichannel Inbox',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined,
      allowedRoles: ['Admin', 'Manager', 'Agent'] as UserRoleCategory[],
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'Google Calendar & Booking',
      icon: Calendar,
      highlight: true,
      allowedRoles: ['Admin', 'Manager', 'Agent'] as UserRoleCategory[],
    },
    {
      id: 'whatsapp_coexistence' as ActiveTab,

      label: 'WhatsApp Coexistence',
      icon: Share2,
      highlight: true,
      allowedRoles: ['Admin', 'Manager', 'Agent'] as UserRoleCategory[],
    },
    {
      id: 'meta_commerce' as ActiveTab,
      label: 'Meta Commerce & Catalog',
      icon: ShoppingBag,
      highlight: true,
      allowedRoles: ['Admin', 'Manager', 'Agent'] as UserRoleCategory[],
    },
    {
      id: 'broadcasts' as ActiveTab,
      label: 'WhatsApp Broadcasts',
      icon: Radio,
      allowedRoles: ['Admin', 'Manager', 'Agent'] as UserRoleCategory[],
    },
    {
      id: 'flow_builder' as ActiveTab,
      label: 'Automations & Visual Flows',
      icon: Workflow,
      allowedRoles: ['Admin', 'Manager'] as UserRoleCategory[],
    },
    {
      id: 'integrations' as ActiveTab,
      label: 'App Integrations Hub',
      icon: Boxes,
      highlight: false,
      allowedRoles: ['Admin', 'Manager'] as UserRoleCategory[],
    },
    {
      id: 'ai_agents' as ActiveTab,
      label: 'AI Agents & BYOK',
      icon: Cpu,
      highlight: false,
      allowedRoles: ['Admin'] as UserRoleCategory[],
    },
    {
      id: 'ai_playground' as ActiveTab,
      label: 'AI Agent Playground',
      icon: Terminal,
      highlight: true,
      allowedRoles: ['Admin', 'Manager'] as UserRoleCategory[],
    },
    {
      id: 'contacts' as ActiveTab,

      label: 'Contacts & CRM',
      icon: Users,
      allowedRoles: ['Admin', 'Manager', 'Agent'] as UserRoleCategory[],
    },
    {
      id: 'automations' as ActiveTab,
      label: 'AI Rules & Copilot',
      icon: Zap,
      allowedRoles: ['Admin', 'Manager'] as UserRoleCategory[],
    },
    {
      id: 'slas' as ActiveTab,
      label: 'SLA Engine',
      icon: ShieldCheck,
      allowedRoles: ['Admin', 'Manager'] as UserRoleCategory[],
    },
    {
      id: 'templates' as ActiveTab,
      label: 'WhatsApp Templates',
      icon: FileCode,
      allowedRoles: ['Admin', 'Manager', 'Agent'] as UserRoleCategory[],
    },
    {
      id: 'widget_customizer' as ActiveTab,
      label: 'Live Chat Widget',
      icon: Layers,
      allowedRoles: ['Admin', 'Manager'] as UserRoleCategory[],
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Enterprise Analytics',
      icon: BarChart3,
      allowedRoles: ['Admin', 'Manager'] as UserRoleCategory[],
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Ansury Settings',
      icon: Settings,
      allowedRoles: ['Admin'] as UserRoleCategory[],
    },
  ];

  // Filter modules based on user's role category
  const navItems = allNavItems.filter((item) =>
    item.allowedRoles.includes(roleCategory)
  );

  // Auto fallback if active tab is restricted for current role
  useEffect(() => {
    const isCurrentAllowed = navItems.some((item) => item.id === activeTab);
    if (!isCurrentAllowed && navItems.length > 0) {
      setActiveTab(navItems[0].id);
    }
  }, [userProfile.role, activeTab, navItems]);

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen max-h-screen select-none overflow-hidden">
      {/* Top Header & Status Banner */}
      <div className="shrink-0 border-b border-slate-800">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-teal-900/40">
              A
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-base leading-snug tracking-tight">
                {brand.brandName || 'Ansury'}
              </h1>
              <span className="text-[10px] uppercase font-semibold text-teal-400 tracking-wider bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/50">
                Enterprise Unlocked
              </span>
            </div>
          </div>
        </div>

        {/* Coexistence Tech Provider Status Banner */}
        <div className="mx-3 my-2.5 p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5 text-[11px]">
              <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
              Meta Tech Provider
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {coexistenceStatus || 'Connected'}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 truncate">
            Coexistence Sync: Active
          </p>
        </div>
      </div>

      {/* Scrollable Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 min-h-0 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        <div className="px-2 pb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
          <span>Modules ({navItems.length})</span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
            roleCategory === 'Admin'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : roleCategory === 'Manager'
              ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            {roleCategory} Tier
          </span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-teal-400'
                        : item.highlight
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="bg-teal-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-1">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Footer (Clickable) */}
      <div className="shrink-0 p-3 border-t border-slate-800 bg-slate-900/90">
        <div
          onClick={onOpenProfile}
          className="group flex items-center space-x-3 p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-teal-500/50 transition-all cursor-pointer shadow-sm"
          title="Click to view & manage profile, security & active sessions"
        >
          <div className="relative shrink-0">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-500/50 group-hover:ring-teal-400 transition-all"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 absolute bottom-0 right-0 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-100 truncate group-hover:text-teal-300 transition-colors">
                {userProfile.name}
              </p>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
              <Shield className="w-2.5 h-2.5 text-teal-400 inline" />
              {roleCategory} Tier ({userProfile.role.split(' ')[0]})
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
