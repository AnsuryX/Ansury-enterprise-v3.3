import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Building,
  Tag,
  Smartphone,
  ShieldCheck,
  Target,
  Globe,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Bot,
  Zap,
  Filter,
  Trash2,
  Copy,
  Check,
  Code2,
  MessageSquare,
  Calendar,
  Building2,
  Edit3,
  ExternalLink,
  ChevronRight,
  Download,
  Upload,
  Layers,
  LayoutGrid,
  List,
  MapPin,
  Briefcase,
  Star,
  Clock,
  ArrowUpDown,
  X,
  AlertCircle,
} from 'lucide-react';
import { Contact, LeadAd, ChannelType } from '../types';
import { ALL_COUNTRY_DIAL_CODES } from '../data/countryDialCodes';

interface CRMModuleProps {
  contacts: Contact[];
  onAddContact: (contact: Partial<Contact>) => void;
  onUpdateContact?: (id: string, updated: Partial<Contact>) => void;
  onDeleteContact?: (id: string) => void;
  onStartConversation?: (contact: Contact) => void;
}

const COUNTRY_DIAL_CODES = ALL_COUNTRY_DIAL_CODES;

const PRESET_TAG_SUGGESTIONS = [
  'VIP Enterprise',
  'High Intent',
  'WhatsApp Coexistence',
  'Enterprise Deal',
  'SLA Tier 1',
  'SaaS Founder',
  'Decision Maker',
  'Procurement Active',
  'Security Review',
];

const AGENT_LIST = [
  'Elena Rostova (Lead Architect)',
  'Marcus Vance (Senior Supervisor)',
  'Enterprise Escalations Team',
  'VIP Sales SDRs',
];

export const CRMModule: React.FC<CRMModuleProps> = ({
  contacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onStartConversation,
}) => {
  // Main view tab (DEFAULT TO CONTACTS DIRECTORY)
  const [activeTab, setActiveTab] = useState<'contacts' | 'leads' | 'analytics'>('contacts');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'score'>('recent');

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);

  // Leads State
  const [leads, setLeads] = useState<LeadAd[]>([]);
  const [leadFilterSource, setLeadFilterSource] = useState<'all' | 'facebook_lead_ad' | 'google_ads_lead_form'>('all');
  const [qualifyingLeadId, setQualifyingLeadId] = useState<string | null>(null);

  // Form State for Contact Creation / Editing
  const [contactForm, setContactForm] = useState({
    name: '',
    dialCode: '+1',
    phoneLocal: '',
    email: '',
    company: '',
    jobTitle: '',
    location: '',
    preferredChannel: 'whatsapp' as ChannelType,
    lifecycleStage: 'lead',
    leadScore: 75,
    assignedAgent: 'Elena Rostova (Lead Architect)',
    coexistenceActive: true,
    tags: ['VIP Enterprise', 'High Intent'],
    tagInput: '',
    notes: '',
    customAttributes: [
      { key: 'SLA Tier', value: 'Platinum 24/7' },
      { key: 'Estimated Budget', value: '$25,000 / yr' },
    ],
  });

  // Lead Creation Form State
  const [newLeadForm, setNewLeadForm] = useState({
    source: 'facebook_lead_ad' as 'facebook_lead_ad' | 'google_ads_lead_form',
    leadName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: 'VP of Engineering',
    campaignName: 'Meta Enterprise WhatsApp Coexistence Ad',
    budgetRange: '$10,000 / month',
    seats: '25 Seats',
  });

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success && data.leads) {
        setLeads(data.leads);
      }
    } catch (e) {
      console.warn('Failed to fetch leads:', e);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Filter and sort contacts
  const filteredContacts = contacts
    .filter((c) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        (c.company && c.company.toLowerCase().includes(query)) ||
        (c.jobTitle && c.jobTitle.toLowerCase().includes(query)) ||
        c.tags.some((t) => t.toLowerCase().includes(query));

      const matchesStage = stageFilter === 'all' || (c.lifecycleStage || 'lead') === stageFilter;
      const matchesChannel = channelFilter === 'all' || (c.preferredChannel || 'whatsapp') === channelFilter;

      return matchesSearch && matchesStage && matchesChannel;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'score') return (b.leadScore || 50) - (a.leadScore || 50);
      return 0; // Default recent order
    });

  const filteredLeads = leads.filter((l) => {
    const matchesSource = leadFilterSource === 'all' || l.source === leadFilterSource;
    const matchesQuery =
      l.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.company && l.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      l.campaignName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesQuery;
  });

  // Open Create Modal
  const handleOpenAddModal = () => {
    setEditingContactId(null);
    setContactForm({
      name: '',
      dialCode: '+1',
      phoneLocal: '',
      email: '',
      company: '',
      jobTitle: '',
      location: 'San Francisco, CA',
      preferredChannel: 'whatsapp',
      lifecycleStage: 'lead',
      leadScore: 75,
      assignedAgent: 'Elena Rostova (Lead Architect)',
      coexistenceActive: true,
      tags: ['VIP Enterprise', 'High Intent'],
      tagInput: '',
      notes: '',
      customAttributes: [
        { key: 'SLA Tier', value: 'Platinum 24/7' },
        { key: 'Estimated Budget', value: '$25,000 / yr' },
      ],
    });
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (contact: Contact) => {
    setEditingContactId(contact.id);
    let dialCode = '+1';
    let localPhone = contact.phone;

    for (const c of COUNTRY_DIAL_CODES) {
      if (contact.phone.startsWith(c.code)) {
        dialCode = c.code;
        localPhone = contact.phone.substring(c.code.length).trim();
        break;
      }
    }

    const attrs = Object.entries(contact.customAttributes || {}).map(([key, value]) => ({ key, value }));
    if (attrs.length === 0) {
      attrs.push({ key: 'SLA Tier', value: 'Standard Tier 1' });
    }

    setContactForm({
      name: contact.name,
      dialCode,
      phoneLocal: localPhone,
      email: contact.email,
      company: contact.company || '',
      jobTitle: contact.jobTitle || '',
      location: contact.location || '',
      preferredChannel: (contact.preferredChannel as ChannelType) || 'whatsapp',
      lifecycleStage: contact.lifecycleStage || 'lead',
      leadScore: contact.leadScore || 70,
      assignedAgent: contact.assignedAgent || 'Elena Rostova (Lead Architect)',
      coexistenceActive: Boolean(contact.waBusinessProfile?.coexistenceActive),
      tags: [...contact.tags],
      tagInput: '',
      notes: contact.notes || '',
      customAttributes: attrs,
    });
    setShowAddModal(true);
  };

  // Add tag chip
  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (trimmed && !contactForm.tags.includes(trimmed)) {
      setContactForm({
        ...contactForm,
        tags: [...contactForm.tags, trimmed],
        tagInput: '',
      });
    }
  };

  // Remove tag chip
  const handleRemoveTag = (tagToRemove: string) => {
    setContactForm({
      ...contactForm,
      tags: contactForm.tags.filter((t) => t !== tagToRemove),
    });
  };

  // Submit Contact Form
  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim()) return;

    let fullPhone = contactForm.phoneLocal.trim();
    if (fullPhone.startsWith('+')) {
      // User entered full international format directly
    } else if (fullPhone) {
      fullPhone = `${contactForm.dialCode} ${fullPhone}`;
    } else {
      fullPhone = `${contactForm.dialCode} (555) 000-0000`;
    }

    const customAttrMap: Record<string, string> = {};
    contactForm.customAttributes.forEach((attr) => {
      if (attr.key.trim()) {
        customAttrMap[attr.key.trim()] = attr.value.trim();
      }
    });

    const contactPayload: Partial<Contact> = {
      name: contactForm.name.trim(),
      phone: fullPhone,
      email: contactForm.email.trim() || `${contactForm.name.toLowerCase().replace(/\s+/g, '')}@ansury.com`,
      company: contactForm.company.trim() || 'Enterprise Client',
      jobTitle: contactForm.jobTitle.trim() || 'Business Leader',
      location: contactForm.location.trim() || 'Global',
      preferredChannel: contactForm.preferredChannel,
      lifecycleStage: contactForm.lifecycleStage,
      leadScore: contactForm.leadScore,
      assignedAgent: contactForm.assignedAgent,
      tags: contactForm.tags.length > 0 ? contactForm.tags : ['Inbound Lead'],
      notes: contactForm.notes.trim(),
      customAttributes: customAttrMap,
      avatar:
        editingContactId && selectedContact
          ? selectedContact.avatar
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      waBusinessProfile: contactForm.coexistenceActive
        ? {
            verifiedName: contactForm.name.trim(),
            accountType: 'BUSINESS',
            coexistenceActive: true,
            lastAppSync: 'Just now',
            waId: fullPhone,
          }
        : undefined,
    };

    if (editingContactId && onUpdateContact) {
      onUpdateContact(editingContactId, contactPayload);
      if (selectedContact && selectedContact.id === editingContactId) {
        setSelectedContact({ ...selectedContact, ...contactPayload } as Contact);
      }
      showToast(`Contact "${contactPayload.name}" updated successfully.`);
    } else {
      setSearchQuery('');
      setStageFilter('all');
      setChannelFilter('all');
      setActiveTab('contacts');
      onAddContact(contactPayload);
      setNewlyCreatedId(`new_${Date.now()}`);
      showToast(`New contact "${contactPayload.name}" created and saved to database!`);
    }

    setShowAddModal(false);
  };

  // Trigger Lead AI Qualification
  const handleAiQualifyOrClose = async (leadId: string, targetStatus: 'qualified' | 'closed_won' | 'disqualified') => {
    setQualifyingLeadId(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/ai-qualify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetStatus }),
      });
      const data = await res.json();
      if (data.success && data.leads) {
        setLeads(data.leads);
        showToast(`Lead status updated to ${targetStatus.replace('_', ' ').toUpperCase()}`);
      }
    } catch (e) {
      console.warn('Error qualifying lead:', e);
    } finally {
      setQualifyingLeadId(null);
    }
  };

  // Submit Inbound Lead
  const handleCreateLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint =
        newLeadForm.source === 'facebook_lead_ad'
          ? '/api/webhooks/facebook-leads'
          : '/api/webhooks/google-leads';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadgen_id: `lead_${Date.now()}`,
          form_data: {
            full_name: newLeadForm.leadName,
            email: newLeadForm.email,
            phone_number: newLeadForm.phone,
            company_name: newLeadForm.company,
            job_title: newLeadForm.jobTitle,
            campaign_name: newLeadForm.campaignName,
            budget: newLeadForm.budgetRange,
            custom_fields: {
              'Required Seats': newLeadForm.seats,
              'Preferred Channel': 'WhatsApp Coexistence',
            },
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchLeads();
        setShowNewLeadModal(false);
        showToast('Lead ingested successfully! AI analysis completed.');
      }
    } catch (e) {
      console.warn('Error ingesting lead:', e);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (contacts.length === 0) {
      showToast('No contacts to export.', 'info');
      return;
    }
    const headers = ['Name', 'Phone', 'Email', 'Company', 'Job Title', 'Stage', 'Lead Score', 'Tags', 'Coexistence'];
    const rows = contacts.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.company || ''}"`,
      `"${c.jobTitle || ''}"`,
      `"${c.lifecycleStage || 'lead'}"`,
      c.leadScore || 50,
      `"${c.tags.join(', ')}"`,
      c.waBusinessProfile?.coexistenceActive ? 'Active' : 'Inactive',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ansury_crm_contacts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CRM contacts exported to CSV.');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWebhook(id);
    setTimeout(() => setCopiedWebhook(null), 2000);
  };

  // Summary Metrics
  const totalContacts = contacts.length;
  const coexistenceCount = contacts.filter((c) => c.waBusinessProfile?.coexistenceActive).length;
  const vipCount = contacts.filter((c) => c.tags.includes('VIP Enterprise') || c.lifecycleStage === 'vip').length;
  const avgScore = contacts.length > 0 ? Math.round(contacts.reduce((acc, c) => acc + (c.leadScore || 50), 0) / contacts.length) : 0;

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col min-h-screen overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-teal-900/90 border border-teal-500 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-teal-300" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main CRM Header */}
      <div className="p-6 pb-4 border-b border-slate-850 bg-slate-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Enterprise CRM & Leads Engine
              </span>
              <span className="text-xs text-slate-400">Meta Coexistence & Multi-Channel Pipeline</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Customer Directory & Lead Pipeline
            </h1>
            <p className="text-sm text-slate-400">
              Manage unified customer profiles, WhatsApp coexistence statuses, and high-intent inbound ad leads.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-teal-950/40 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Contact</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Total CRM Contacts</p>
              <h3 className="text-xl font-bold text-white mt-0.5">{totalContacts}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">WhatsApp Coexistence</p>
              <h3 className="text-xl font-bold text-emerald-400 mt-0.5">{coexistenceCount}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">VIP Enterprise Accounts</p>
              <h3 className="text-xl font-bold text-amber-300 mt-0.5">{vipCount}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Avg. Lead Score</p>
              <h3 className="text-xl font-bold text-cyan-300 mt-0.5">{avgScore}/100</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* View Switcher Sub-Tabs */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-4">
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'contacts'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Contacts ({contacts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'leads'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Ad Leads Pipeline ({leads.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Lead Insights</span>
            </button>
          </div>

          {activeTab === 'contacts' && (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: CONTACTS DIRECTORY */}
      {activeTab === 'contacts' && (
        <div className="p-6 space-y-5">
          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, company, email, phone, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
              >
                <option value="all">All Stages</option>
                <option value="lead">Lead</option>
                <option value="prospect">Qualified Prospect</option>
                <option value="customer">Active Customer</option>
                <option value="vip">VIP Enterprise</option>
                <option value="partner">Strategic Partner</option>
              </select>

              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
              >
                <option value="all">All Channels</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="livechat">Live Chat</option>
                <option value="email">Email</option>
                <option value="instagram">Instagram</option>
                <option value="sms">SMS</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
              >
                <option value="recent">Sort: Most Recent</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="score">Sort: Highest Lead Score</option>
              </select>
            </div>
          </div>

          {/* Empty State */}
          {filteredContacts.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">No Matching Contacts</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {searchQuery || stageFilter !== 'all'
                    ? 'No contacts matched your search filter criteria. Try clearing filters or creating a new contact.'
                    : 'Your contact database is ready. Add your first customer or enterprise lead.'}
                </p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Contact</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map((c) => {
                const score = c.leadScore || 50;
                const isCoex = Boolean(c.waBusinessProfile?.coexistenceActive);

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedContact(c)}
                    className={`p-4 rounded-2xl bg-slate-900 border transition-all cursor-pointer group flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5 ${
                      c.id === newlyCreatedId
                        ? 'border-teal-500 bg-slate-900/90 shadow-lg shadow-teal-950/40 ring-2 ring-teal-500/20'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Bar with Avatar & Actions */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="w-11 h-11 rounded-xl object-cover ring-2 ring-teal-500/20 shrink-0"
                          />
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-100 text-sm truncate group-hover:text-teal-300 transition-colors">
                              {c.name}
                            </h3>
                            <p className="text-xs text-slate-400 truncate">
                              {c.jobTitle ? `${c.jobTitle} • ` : ''}
                              {c.company || 'Enterprise Contact'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            title="Edit Contact"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/60"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {onDeleteContact && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete contact "${c.name}"?`)) {
                                  onDeleteContact(c.id);
                                }
                              }}
                              title="Delete Contact"
                              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-all border border-rose-800/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Contact Info Pills */}
                      <div className="space-y-1.5 text-xs text-slate-300 mb-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-teal-400" />
                            Phone:
                          </span>
                          <span className="font-mono text-slate-200">{c.phone}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-teal-400" />
                            Email:
                          </span>
                          <span className="truncate text-slate-200 max-w-[170px]">{c.email}</span>
                        </div>
                      </div>

                      {/* Coexistence & Status Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        {isCoex ? (
                          <div className="px-2 py-0.5 rounded-md bg-emerald-950/50 border border-emerald-700/50 text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                            <Smartphone className="w-3 h-3" />
                            <span>WhatsApp Coexistence Linked</span>
                          </div>
                        ) : (
                          <div className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-medium">
                            Standard Omnichannel
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-[11px] font-bold">
                          <span className="text-slate-400 text-[10px]">Score:</span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-mono ${
                              score >= 80
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : score >= 60
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {score}/100
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {c.tags.map((t) => (
                          <span
                            key={t}
                            className="bg-slate-800/80 text-teal-300 text-[10px] px-2 py-0.5 rounded-md border border-slate-700/60"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick Direct Actions on Bottom */}
                    <div
                      className="border-t border-slate-800/80 pt-3 flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {onStartConversation && (
                        <button
                          onClick={() => onStartConversation(c)}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white font-bold text-xs transition-all border border-teal-500/30 flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Open Chat</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedContact(c)}
                        className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 flex items-center gap-1"
                      >
                        <span>Profile</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/40">
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Phone / Channel</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Stage</th>
                      <th className="py-3 px-4">Lead Score</th>
                      <th className="py-3 px-4">Tags</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredContacts.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedContact(c)}
                        className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={c.avatar}
                              alt={c.name}
                              className="w-8 h-8 rounded-lg object-cover ring-1 ring-teal-500/20"
                            />
                            <div>
                              <div className="font-bold text-slate-100">{c.name}</div>
                              <div className="text-[11px] text-slate-400">{c.company || 'Enterprise Contact'}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-mono text-slate-200">{c.phone}</div>
                          {c.waBusinessProfile?.coexistenceActive && (
                            <span className="text-[10px] text-emerald-400 font-semibold">● Coexistence Active</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-300">{c.email}</td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-teal-300 border border-slate-700">
                            {c.lifecycleStage || 'lead'}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-slate-200">{c.leadScore || 50}/100</td>

                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {c.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="bg-slate-800 text-teal-300 text-[10px] px-1.5 py-0.5 rounded border border-slate-700"
                              >
                                {t}
                              </span>
                            ))}
                            {c.tags.length > 2 && (
                              <span className="text-[10px] text-slate-400">+{c.tags.length - 2}</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {onStartConversation && (
                              <button
                                onClick={() => onStartConversation(c)}
                                title="Open WhatsApp Chat"
                                className="p-1.5 rounded-lg bg-teal-600/20 text-teal-300 hover:bg-teal-600 hover:text-white transition-all border border-teal-500/30"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEditModal(c)}
                              title="Edit Contact"
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-700"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteContact && (
                              <button
                                onClick={() => {
                                  if (confirm(`Delete contact "${c.name}"?`)) {
                                    onDeleteContact(c.id);
                                  }
                                }}
                                title="Delete Contact"
                                className="p-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900 transition-all border border-rose-800/40"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AD LEADS PIPELINE */}
      {activeTab === 'leads' && (
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-400" />
                Inbound Lead Form Webhook Ingestion
              </h2>
              <p className="text-xs text-slate-400">
                Incoming leads from Meta Lead Ads & Google Ads extensions are automatically scored by Gemini AI and queued for WhatsApp Coexistence outreach.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewLeadModal(true)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                Ingest Inbound Lead
              </button>
            </div>
          </div>

          {/* Webhook URLs for Integration Setup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4" /> Meta Facebook Lead Ads Webhook
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">READY</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Paste this into Meta App Dashboard &gt; Webhooks &gt; Leadgen subscriptions:
              </p>
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <code className="text-[11px] text-teal-300 font-mono flex-1 truncate">
                  https://api.ansury.com/api/webhooks/facebook-leads
                </code>
                <button
                  onClick={() => copyToClipboard('https://api.ansury.com/api/webhooks/facebook-leads', 'fb_wh')}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {copiedWebhook === 'fb_wh' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" /> Google Ads Lead Form Webhook
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">READY</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Paste this into Google Ads &gt; Lead Form Extensions &gt; Webhook Delivery:
              </p>
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <code className="text-[11px] text-teal-300 font-mono flex-1 truncate">
                  https://api.ansury.com/api/webhooks/google-leads
                </code>
                <button
                  onClick={() => copyToClipboard('https://api.ansury.com/api/webhooks/google-leads', 'gg_wh')}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {copiedWebhook === 'gg_wh' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Lead Cards List */}
          {filteredLeads.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <Target className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="font-bold text-white text-base">No Inbound Ad Leads Ingested Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Incoming lead submissions from Meta and Google Lead Ads will automatically appear here with AI qualification ratings and automated WhatsApp outreach triggers.
              </p>
              <button
                onClick={() => setShowNewLeadModal(true)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simulate Inbound Lead Ingestion</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            lead.source === 'facebook_lead_ad'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {lead.source === 'facebook_lead_ad' ? 'Facebook Ad' : 'Google Ads'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{lead.createdAt}</span>
                      </div>
                      <h3 className="font-bold text-slate-100 text-sm">{lead.leadName}</h3>
                      <p className="text-xs text-slate-400">{lead.company || 'Enterprise Prospect'}</p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        lead.status === 'qualified'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : lead.status === 'closed_won'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Phone</span>
                      <span className="font-mono text-slate-200">{lead.phone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Email</span>
                      <span className="truncate block text-slate-200">{lead.email}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Campaign</span>
                      <span className="truncate block text-slate-300">{lead.campaignName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Lead Score</span>
                      <span className="font-bold text-teal-300">{lead.leadScore || 80}/100</span>
                    </div>
                  </div>

                  {lead.aiSummary && (
                    <div className="p-2.5 rounded-xl bg-teal-950/30 border border-teal-800/40 text-xs text-teal-200 flex items-start gap-2">
                      <Bot className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{lead.aiSummary}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleAiQualifyOrClose(lead.id, 'qualified')}
                      disabled={qualifyingLeadId === lead.id}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-xs border border-emerald-500/30 transition-all flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Qualify Lead
                    </button>

                    <button
                      onClick={() => {
                        // Convert lead directly into CRM Contact
                        onAddContact({
                          name: lead.leadName,
                          phone: lead.phone,
                          email: lead.email,
                          company: lead.company || 'Enterprise Lead',
                          tags: ['Ad Lead', 'High Intent'],
                          lifecycleStage: 'prospect',
                          leadScore: lead.leadScore || 85,
                        });
                        showToast(`Lead "${lead.leadName}" converted to CRM Contact!`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow transition-all"
                    >
                      Convert to CRM Contact
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CRM ANALYTICS & INSIGHTS */}
      {activeTab === 'analytics' && (
        <div className="p-6 space-y-6 max-w-4xl">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              Lead Conversion & Stage Funnel
            </h2>

            <div className="space-y-4">
              {[
                { stage: 'Leads & Inbound Inquiries', count: contacts.filter((c) => (c.lifecycleStage || 'lead') === 'lead').length, color: 'bg-blue-500' },
                { stage: 'Qualified Prospects', count: contacts.filter((c) => c.lifecycleStage === 'prospect').length, color: 'bg-teal-500' },
                { stage: 'Active Enterprise Customers', count: contacts.filter((c) => c.lifecycleStage === 'customer').length, color: 'bg-emerald-500' },
                { stage: 'VIP Platinum Accounts', count: contacts.filter((c) => c.lifecycleStage === 'vip').length, color: 'bg-amber-500' },
              ].map((item) => {
                const pct = totalContacts > 0 ? Math.round((item.count / totalContacts) * 100) : 0;
                return (
                  <div key={item.stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{item.stage}</span>
                      <span className="text-slate-400 font-mono">
                        {item.count} contacts ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 360° CONTACT PROFILE DRAWER / MODAL */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedContact.avatar}
                  alt={selectedContact.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-500/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{selectedContact.name}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {selectedContact.lifecycleStage || 'lead'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedContact.jobTitle ? `${selectedContact.jobTitle} • ` : ''}
                    {selectedContact.company || 'Enterprise Client'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedContact(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {onStartConversation && (
                <button
                  onClick={() => {
                    const c = selectedContact;
                    setSelectedContact(null);
                    onStartConversation(c);
                  }}
                  className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Start WhatsApp</span>
                </button>
              )}

              <a
                href={`mailto:${selectedContact.email}`}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
              >
                <Mail className="w-4 h-4 text-teal-400" />
                <span>Send Email</span>
              </a>

              <button
                onClick={() => {
                  handleOpenEditModal(selectedContact);
                  setSelectedContact(null);
                }}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Edit Profile</span>
              </button>

              {onDeleteContact && (
                <button
                  onClick={() => {
                    if (confirm(`Delete contact "${selectedContact.name}"?`)) {
                      onDeleteContact(selectedContact.id);
                      setSelectedContact(null);
                    }
                  }}
                  className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-rose-800/40"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>

            {/* Profile Overview Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px] block mb-2">
                  Contact Information
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono text-slate-200">{selectedContact.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Work Email:</span>
                  <span className="text-slate-200">{selectedContact.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-200">{selectedContact.location || 'Global'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assigned Agent:</span>
                  <span className="text-teal-300 font-medium">{selectedContact.assignedAgent || 'Elena Rostova'}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px] block mb-2">
                  Channel & Coexistence Status
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Preferred Channel:</span>
                  <span className="font-semibold text-slate-200 uppercase">{selectedContact.preferredChannel || 'whatsapp'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Meta Coexistence:</span>
                  <span className="font-bold text-emerald-400">
                    {selectedContact.waBusinessProfile?.coexistenceActive ? 'ACTIVE (Dual Synced)' : 'Not Linked'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Lead Score:</span>
                  <span className="font-mono font-bold text-cyan-300">{selectedContact.leadScore || 50}/100</span>
                </div>
              </div>
            </div>

            {/* Tags & Custom Attributes */}
            <div className="space-y-3">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px] block">
                Active Tags & Segments
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedContact.tags.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-800 text-teal-300 text-xs border border-slate-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Custom Key-Value Attributes */}
            {selectedContact.customAttributes && Object.keys(selectedContact.customAttributes).length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px] block">
                  Enterprise Custom Attributes
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(selectedContact.customAttributes).map(([k, v]) => (
                    <div key={k} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">{k}</span>
                      <span className="font-semibold text-slate-200">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT CONTACT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleContactFormSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                {editingContactId ? 'Edit CRM Contact Profile' : 'Add New CRM Contact'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Row 1: Name and Phone with Country Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                  <div className="flex gap-2">
                    <select
                      value={contactForm.dialCode}
                      onChange={(e) => setContactForm({ ...contactForm, dialCode: e.target.value })}
                      className="bg-slate-950 text-slate-300 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-teal-500 w-28 shrink-0 text-xs font-mono"
                    >
                      {COUNTRY_DIAL_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.country})
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      required
                      placeholder="(555) 234-5678"
                      value={contactForm.phoneLocal}
                      onChange={(e) => setContactForm({ ...contactForm, phoneLocal: e.target.value })}
                      className="flex-1 bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Work Email</label>
                  <input
                    type="email"
                    placeholder="alex@enterprise.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Global Cloud"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Row 3: Job Title & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Job Title / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Head of Customer Support"
                    value={contactForm.jobTitle}
                    onChange={(e) => setContactForm({ ...contactForm, jobTitle: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">City / Country</label>
                  <input
                    type="text"
                    placeholder="e.g. New York, USA"
                    value={contactForm.location}
                    onChange={(e) => setContactForm({ ...contactForm, location: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Row 4: Lifecycle Stage, Lead Score, Preferred Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Lifecycle Stage</label>
                  <select
                    value={contactForm.lifecycleStage}
                    onChange={(e) => setContactForm({ ...contactForm, lifecycleStage: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-teal-500"
                  >
                    <option value="lead">Lead</option>
                    <option value="prospect">Qualified Prospect</option>
                    <option value="customer">Active Customer</option>
                    <option value="vip">VIP Enterprise</option>
                    <option value="partner">Strategic Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Preferred Channel</label>
                  <select
                    value={contactForm.preferredChannel}
                    onChange={(e) => setContactForm({ ...contactForm, preferredChannel: e.target.value as ChannelType })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-teal-500"
                  >
                    <option value="whatsapp">WhatsApp Coexistence</option>
                    <option value="livechat">Web Live Chat</option>
                    <option value="email">Email</option>
                    <option value="instagram">Instagram Direct</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 flex items-center justify-between">
                    <span>Lead Score</span>
                    <span className="font-bold text-teal-400 font-mono">{contactForm.leadScore}/100</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={contactForm.leadScore}
                    onChange={(e) => setContactForm({ ...contactForm, leadScore: parseInt(e.target.value, 10) })}
                    className="w-full accent-teal-500 mt-2"
                  />
                </div>
              </div>

              {/* Row 5: Assigned Agent & Coexistence Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Assigned Agent</label>
                  <select
                    value={contactForm.assignedAgent}
                    onChange={(e) => setContactForm({ ...contactForm, assignedAgent: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-teal-500"
                  >
                    {AGENT_LIST.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-semibold text-slate-200 block text-xs">WhatsApp Coexistence</span>
                    <span className="text-[10px] text-slate-500">Sync with WhatsApp Business Mobile App</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={contactForm.coexistenceActive}
                    onChange={(e) => setContactForm({ ...contactForm, coexistenceActive: e.target.checked })}
                    className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-2">
                <label className="block text-slate-400">Tags & Segments</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {contactForm.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg bg-teal-950/60 text-teal-300 text-xs border border-teal-800/60 flex items-center gap-1.5"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-teal-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                {/* Preset Suggestions */}
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-[10px] text-slate-500 mr-1">Suggestions:</span>
                  {PRESET_TAG_SUGGESTIONS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddTag(preset)}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add custom tag (e.g. Q4 Evaluation)"
                    value={contactForm.tagInput}
                    onChange={(e) => setContactForm({ ...contactForm, tagInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(contactForm.tagInput);
                      }
                    }}
                    className="flex-1 bg-slate-950 text-slate-100 p-2 rounded-xl border border-slate-800 focus:outline-none focus:border-teal-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(contactForm.tagInput)}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-semibold text-xs"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                {editingContactId ? 'Save Changes' : 'Create Contact'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INGEST INBOUND LEAD MODAL */}
      {showNewLeadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateLeadSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-400" />
                Simulate Inbound Lead Ingestion
              </h3>
              <button
                type="button"
                onClick={() => setShowNewLeadModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Lead Channel Source</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewLeadForm({ ...newLeadForm, source: 'facebook_lead_ad' })}
                    className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-2 ${
                      newLeadForm.source === 'facebook_lead_ad'
                        ? 'bg-blue-950 border-blue-600 text-blue-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Target className="w-4 h-4 text-blue-400" /> Facebook Lead Ad
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewLeadForm({ ...newLeadForm, source: 'google_ads_lead_form' })}
                    className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-2 ${
                      newLeadForm.source === 'google_ads_lead_form'
                        ? 'bg-amber-950 border-amber-600 text-amber-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-amber-400" /> Google Search Lead
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Prospect Name</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.leadName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, leadName: e.target.value })}
                    placeholder="e.g. Rachel Adams"
                    className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.company}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                    placeholder="e.g. Horizon Fintech"
                    className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    placeholder="rachel@horizon.io"
                    className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    placeholder="+1 (555) 392-0192"
                    className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Budget Range</label>
                  <select
                    value={newLeadForm.budgetRange}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, budgetRange: e.target.value })}
                    className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-teal-500"
                  >
                    <option value="$2,500 - $5,000 / month">$2,500 - $5,000 / month</option>
                    <option value="$5,000 - $10,000 / month">$5,000 - $10,000 / month</option>
                    <option value="$10,000 - $25,000 / month">$10,000 - $25,000 / month</option>
                    <option value="$25,000+ Enterprise / mo">$25,000+ Enterprise / mo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Campaign Title</label>
                  <input
                    type="text"
                    value={newLeadForm.campaignName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, campaignName: e.target.value })}
                    className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewLeadModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                Ingest Lead & Trigger AI
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
