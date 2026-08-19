import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Building2,
  Workflow,
  Webhook,
  Mail,
  Slack,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  Shield,
  Zap,
  Plus,
  Search,
  Check,
  AlertCircle,
  Target,
  Globe,
  Trash2,
  Boxes,
  Key,
  Code2,
  Copy,
  Terminal,
  Send,
  Sparkles,
  Lock,
  Play,
  Unlink,
  BookOpen,
  HelpCircle,
  ChevronRight,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { Integration } from '../types';

interface IntegrationsModuleProps {
  integrations: Integration[];
  onAddIntegration?: (newIntegration: Partial<Integration>) => void;
  onUpdateIntegration: (id: string, updated: Partial<Integration>) => void;
  onDeleteIntegration?: (id: string) => void;
}

interface DeveloperApiKey {
  id: string;
  name: string;
  key: string;
  scope: string;
  createdAt: string;
  lastUsed: string;
}

interface IntegrationGuideDetail {
  id: string;
  title: string;
  provider: string;
  docUrl: string;
  primaryCallbackUrl: string;
  fallbackCallbackUrl?: string;
  webhookUrl?: string;
  verifyToken?: string;
  requiredScopes?: string[];
  steps: string[];
  tips: string[];
}

export const IntegrationsModule: React.FC<IntegrationsModuleProps> = ({
  integrations,
  onAddIntegration,
  onUpdateIntegration,
  onDeleteIntegration,
}) => {
  const [activeTab, setActiveTab] = useState<'connectors' | 'guides_callbacks' | 'developer_api'>('connectors');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [activeGuideIntegrationId, setActiveGuideIntegrationId] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isOauthConnecting, setIsOauthConnecting] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Custom Connector Modal State
  const [showAddConnectorModal, setShowAddConnectorModal] = useState(false);
  const [newConnectorName, setNewConnectorName] = useState('');
  const [newConnectorCategory, setNewConnectorCategory] = useState('Workflows & Automation');
  const [newConnectorDesc, setNewConnectorDesc] = useState('');
  const [newConnectorWebhookUrl, setNewConnectorWebhookUrl] = useState('');
  const [newConnectorSecret, setNewConnectorSecret] = useState('');
  const [newConnectorIcon, setNewConnectorIcon] = useState('Webhook');

  // Developer API Key & REST Explorer State
  const [apiKeys, setApiKeys] = useState<DeveloperApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState('full_access');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const categories = ['All', 'CRM & ERP', 'Workflows & Automation', 'Productivity & Support', 'E-Commerce', 'Lead Generation & Ads'];

  const getBaseOrigin = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://ais-dev-jfl3vkkuot4bkqbc3abomu-259601339379.europe-west2.run.app';
  };

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyText = (text: string, identifier: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedSnippet(identifier);
    showToast(`Copied to clipboard: ${text.length > 40 ? text.substring(0, 37) + '...' : text}`);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  // Dynamic integration guides definition
  const origin = getBaseOrigin();
  const integrationGuides: Record<string, IntegrationGuideDetail> = {
    int_gcal: {
      id: 'int_gcal',
      title: 'Google Calendar & Workspace Setup',
      provider: 'Google Cloud Console',
      docUrl: 'https://console.cloud.google.com/apis/credentials',
      primaryCallbackUrl: `${origin}/auth/callback/google`,
      fallbackCallbackUrl: `${origin}/auth/callback`,
      requiredScopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      steps: [
        '1. Go to Google Cloud Console > APIs & Services > Credentials.',
        '2. Click "+ CREATE CREDENTIALS" and select "OAuth client ID".',
        '3. Application type: Choose "Web application". Name it "Ansury Omnichannel Calendar".',
        `4. In "Authorized redirect URIs", add BOTH exact callback URLs:`,
        `   • Primary: ${origin}/auth/callback/google`,
        `   • Universal Fallback: ${origin}/auth/callback`,
        '5. Go to "Enabled APIs & Services" > Click "+ ENABLE APIS AND SERVICES" > Search and enable "Google Calendar API".',
        '6. Copy your Client ID and Client Secret into the Ansury Google Calendar connector settings.',
        '7. Click "Connect via Google OAuth" to link your calendar and enable real-time booking!',
      ],
      tips: [
        'Ensure the redirect URI in Google Cloud Console matches your browser URL protocol and host exactly.',
        'If your Google App is in "Testing" mode, add your Google account email under "OAuth consent screen > Test users".',
      ],
    },
    int_google_leads: {
      id: 'int_google_leads',
      title: 'Google Ads & Lead Forms Sync',
      provider: 'Google Ads & Cloud Platform',
      docUrl: 'https://console.cloud.google.com/apis/credentials',
      primaryCallbackUrl: `${origin}/auth/callback/google`,
      fallbackCallbackUrl: `${origin}/auth/callback`,
      requiredScopes: [
        'https://www.googleapis.com/auth/adwords',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      steps: [
        '1. Open Google Cloud Console > Credentials.',
        '2. Add the Authorized redirect URI: ' + `${origin}/auth/callback/google`,
        '3. Enable "Google Ads API" in Google Cloud Library.',
        '4. Enter your Google Ads Developer Token & Client ID in the configuration fields.',
        '5. Leads submitted through Google Lead Extensions will stream directly into the Ansury CRM inbox.',
      ],
      tips: [
        'Google Ads webhooks can also be routed to the custom webhook endpoint: ' + `${origin}/api/webhooks/custom`,
      ],
    },
    int_zoho: {
      id: 'int_zoho',
      title: 'Zoho CRM Multi-Region OAuth 2.0',
      provider: 'Zoho API Console',
      docUrl: 'https://api-console.zoho.com',
      primaryCallbackUrl: `${origin}/auth/callback/zoho`,
      fallbackCallbackUrl: `${origin}/auth/callback`,
      requiredScopes: [
        'ZohoCRM.modules.ALL',
        'ZohoCRM.settings.ALL',
        'ZohoCRM.users.READ',
      ],
      steps: [
        '1. Visit the Zoho Developer API Console at api-console.zoho.com.',
        '2. Click "Add Client" and select "Server-based Applications".',
        '3. Client Name: "Ansury Omnichannel CRM Bridge".',
        '4. Homepage URL: ' + origin,
        '5. In "Authorized Redirect URIs", add BOTH exact callback URLs:',
        `   • Primary: ${origin}/auth/callback/zoho`,
        `   • Universal: ${origin}/auth/callback`,
        '6. Copy the generated Client ID and Client Secret into the Ansury Zoho connector.',
        '7. Select your Zoho Datacenter domain (e.g., zoho.com for US, zoho.eu for Europe, zoho.in for India).',
        '8. Click "Connect via Zoho OAuth" to start bidirectional deal & contact syncing!',
      ],
      tips: [
        'Zoho CRM requires the correct domain region. If you log into crm.zoho.eu, make sure you select "zoho.eu".',
        'All deal status changes and contact tags will be saved directly into Zoho Leads & Contacts.',
      ],
    },
    int_whatsapp: {
      id: 'int_whatsapp',
      title: 'Meta WhatsApp Cloud API & Coexistence Webhook',
      provider: 'Meta for Developers (Facebook)',
      docUrl: 'https://developers.facebook.com/apps',
      primaryCallbackUrl: `${origin}/api/webhooks/whatsapp`,
      webhookUrl: `${origin}/api/webhooks/whatsapp`,
      verifyToken: 'ansury_wa_verify_2026',
      steps: [
        '1. Go to developers.facebook.com and open your Meta App.',
        '2. In the left navigation, click "WhatsApp" > "Configuration".',
        '3. Click "Edit" next to the Webhook section.',
        `4. Callback URL: ${origin}/api/webhooks/whatsapp`,
        `5. Verify Token: ansury_wa_verify_2026 (or your custom token from Coexistence Settings).`,
        '6. Click "Verify and Save" (Ansury responds instantly with HTTP 200 and challenge verification).',
        '7. Click "Manage Webhook fields" and subscribe to "messages" and "message_template_status_update".',
        '8. Inbound WhatsApp messages and Coexistence status will now stream in real time into the Inbox!',
      ],
      tips: [
        'WAMID deduplication is built-in to prevent dual delivery across the WhatsApp Business App and Cloud API.',
      ],
    },
    int_shopify: {
      id: 'int_shopify',
      title: 'Shopify Store Webhook & Buyer Sync',
      provider: 'Shopify Admin',
      docUrl: 'https://admin.shopify.com',
      primaryCallbackUrl: `${origin}/api/webhooks/shopify`,
      webhookUrl: `${origin}/api/webhooks/shopify`,
      steps: [
        '1. Log into your Shopify Store Admin (admin.shopify.com).',
        '2. Navigate to Settings > Notifications (or Settings > Webhooks).',
        '3. Click "Create webhook".',
        '4. Event: Select "Order creation" (orders/create) or "Customer creation" (customers/create).',
        '5. Format: JSON.',
        `6. URL: ${origin}/api/webhooks/shopify`,
        '7. Click "Save webhook".',
        '8. Every time a customer places an order, their profile and cart details are automatically ingested into Ansury CRM.',
      ],
      tips: [
        'You can also configure the Shopify Store API Key in connector settings to look up order catalogs on demand.',
      ],
    },
    int_slack: {
      id: 'int_slack',
      title: 'Slack Bot & Event Subscriptions',
      provider: 'Slack API Console',
      docUrl: 'https://api.slack.com/apps',
      primaryCallbackUrl: `${origin}/api/webhooks/slack`,
      webhookUrl: `${origin}/api/webhooks/slack`,
      steps: [
        '1. Visit api.slack.com/apps and select or create your Slack App.',
        '2. In the sidebar, click "Event Subscriptions" and toggle "Enable Events" to ON.',
        `3. In "Request URL", paste: ${origin}/api/webhooks/slack`,
        '4. Slack will send an HTTP POST with a challenge parameter, which Ansury verifies automatically.',
        '5. Under "Subscribe to bot events", add "message.channels" and "message.im".',
        '6. Click "Save Changes" and reinstall the app to your workspace.',
        '7. In Ansury Slack connector config, paste your Incoming Webhook URL to dispatch alerts to Slack channels.',
      ],
      tips: [
        'Use the Slack connector to notify sales teams of SLA breaches or high-value leads.',
      ],
    },
    int_n8n: {
      id: 'int_n8n',
      title: 'n8n & Make / Zapier Workflow Relay',
      provider: 'n8n Workflow Automation',
      docUrl: 'https://n8n.io',
      primaryCallbackUrl: `${origin}/api/webhooks/custom`,
      webhookUrl: `${origin}/api/webhooks/custom`,
      steps: [
        '1. In your n8n workflow or Make scenario, add an HTTP Request node.',
        '2. Method: POST.',
        `3. URL: ${origin}/api/webhooks/custom`,
        '4. Headers: Add "Content-Type: application/json".',
        '5. (Optional) Add security header: "x-ansury-secret: your_custom_secret".',
        '6. In Body, pass any JSON structure with customer, deal, or conversation information.',
        '7. Ansury processes the payload, creates audit logs, and triggers automated follow-up flows.',
      ],
      tips: [
        'Outbound triggers can also be fired from Visual Automation Flows into n8n Webhook URLs.',
      ],
    },
    int_webhook: {
      id: 'int_webhook',
      title: 'Custom REST API & Webhook Connector',
      provider: 'Ansury Open Ingestion Engine',
      docUrl: `${origin}/api/docs`,
      primaryCallbackUrl: `${origin}/api/webhooks/custom`,
      webhookUrl: `${origin}/api/webhooks/custom`,
      steps: [
        `1. Point any third-party ERP, billing tool, or CRM to: ${origin}/api/webhooks/custom`,
        '2. Use HTTP POST with JSON body.',
        '3. Ansury automatically stores incoming events in Supabase and the enterprise audit trail.',
      ],
      tips: [
        'Check the Developer API tab to generate tenant API keys for authenticating outbound requests.',
      ],
    },
  };

  // Fetch API keys
  useEffect(() => {
    fetch('/api/developer/keys')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.keys) setApiKeys(d.keys);
      })
      .catch((e) => console.error(e));
  }, []);

  // Listen for OAuth postMessage callbacks from popup
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data && (event.data.type === 'OAUTH_SUCCESS' || event.data.type === 'OAUTH_AUTH_SUCCESS')) {
        const provider = event.data.provider;
        if (provider === 'google') {
          const gcal = integrations.find((i) => i.id === 'int_gcal');
          if (gcal) {
            onUpdateIntegration('int_gcal', {
              status: 'connected',
              lastSynced: 'Just now (OAuth 2.0 Verified)',
              config: { ...gcal.config, accessToken: 'oauth2_verified' },
            });
          }
          const gleads = integrations.find((i) => i.id === 'int_google_leads');
          if (gleads) {
            onUpdateIntegration('int_google_leads', {
              status: 'connected',
              lastSynced: 'Just now (OAuth 2.0 Verified)',
            });
          }
        } else if (provider === 'zoho') {
          const zoho = integrations.find((i) => i.id === 'int_zoho');
          if (zoho) {
            onUpdateIntegration('int_zoho', {
              status: 'connected',
              lastSynced: 'Just now (OAuth 2.0 Verified)',
              config: { ...zoho.config, accessToken: 'oauth2_verified' },
            });
          }
        }
        setIsOauthConnecting(null);
        setTestResult({
          success: true,
          message: `OAuth 2.0 authorization succeeded for ${provider.toUpperCase()}! Tokens stored securely.`,
        });
        showToast(`OAuth authorization succeeded for ${provider.toUpperCase()}`);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [integrations, onUpdateIntegration]);

  const handleStartOAuth = async (provider: 'google' | 'zoho') => {
    setIsOauthConnecting(provider);
    setTestResult(null);
    try {
      const explicitRedirectUri = encodeURIComponent(`${origin}/auth/callback/${provider}`);
      const endpoint = provider === 'google'
        ? `/api/auth/google/url?redirect_uri=${explicitRedirectUri}`
        : `/api/auth/zoho/url?redirect_uri=${explicitRedirectUri}`;
      
      const res = await fetch(endpoint);
      const data = await res.json();
      const authUrl = data.url || data.authUrl;
      if (data.success && authUrl) {
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        window.open(
          authUrl,
          `${provider}_oauth_popup`,
          `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes`
        );
        showToast(`Opening ${provider.toUpperCase()} OAuth authorization window...`);
      } else {
        const errMsg = data.error || data.message || `Client ID and Secret are required for ${provider.toUpperCase()}. Please configure your OAuth credentials in the settings below and save before launching OAuth.`;
        setTestResult({
          success: false,
          message: errMsg,
        });
        showToast(errMsg);
        setIsOauthConnecting(null);
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || `Failed to reach ${provider} OAuth endpoint.`,
      });
      setIsOauthConnecting(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      const res = await fetch(`/api/integrations/${id}/disconnect`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.integration) {
        onUpdateIntegration(id, data.integration);
      } else {
        onUpdateIntegration(id, { status: 'disconnected', lastSynced: 'Disconnected' });
      }
      showToast('Connector disconnected.');
      if (activeModalId === id) {
        setActiveModalId(null);
      }
    } catch (e) {
      onUpdateIntegration(id, { status: 'disconnected', lastSynced: 'Disconnected' });
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName || 'New API Key', scope: newKeyScope }),
      });
      const data = await res.json();
      if (data.success && data.key) {
        setApiKeys([data.key, ...apiKeys]);
        setNewKeyName('');
        showToast('New Tenant API Key generated.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    try {
      const res = await fetch(`/api/developer/keys/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setApiKeys(apiKeys.filter((k) => k.id !== id));
        showToast('API Key revoked.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCustomConnector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConnectorName.trim()) return;

    const payload: Partial<Integration> = {
      id: `int_custom_${Date.now()}`,
      name: newConnectorName.trim(),
      key: 'webhook',
      category: newConnectorCategory,
      description: newConnectorDesc.trim() || 'Custom third-party REST webhook and data synchronization connector',
      iconName: newConnectorIcon,
      status: 'disconnected',
      config: {
        webhookUrl: newConnectorWebhookUrl.trim(),
        secretToken: newConnectorSecret.trim(),
      },
      lastSynced: 'Not synced yet',
      eventsCount: 0,
    };

    if (onAddIntegration) {
      onAddIntegration(payload);
    }
    showToast(`Connector "${payload.name}" created and synced to Supabase!`);
    setShowAddConnectorModal(false);
    setNewConnectorName('');
    setNewConnectorDesc('');
    setNewConnectorWebhookUrl('');
    setNewConnectorSecret('');
  };

  const handleSaveConfig = async (id: string) => {
    try {
      const res = await fetch(`/api/integrations/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: configForm }),
      });
      const data = await res.json();
      if (data.success && data.integration) {
        onUpdateIntegration(id, data.integration);
      } else {
        onUpdateIntegration(id, {
          config: configForm,
          lastSynced: 'Config saved (Pending test)',
        });
      }
      showToast('Configuration updated and saved to Supabase!');
      setActiveModalId(null);
    } catch (e) {
      onUpdateIntegration(id, {
        config: configForm,
        lastSynced: 'Config saved locally',
      });
      setActiveModalId(null);
    }
  };

  const handleTestConnection = async (id: string) => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/integrations/${id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: configForm }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.integration) {
        onUpdateIntegration(id, data.integration);
      } else if (data.success) {
        onUpdateIntegration(id, { status: 'connected', lastSynced: 'Just now (Verified)' });
      } else {
        onUpdateIntegration(id, { status: 'disconnected' });
      }

      if (data.success) {
        showToast('Connection verified successfully!');
      } else {
        showToast(data.message || 'Connection test failed');
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || 'Connection request failed. Please check network connectivity.',
      });
      onUpdateIntegration(id, { status: 'disconnected' });
    } finally {
      setIsTesting(false);
    }
  };

  const openConfigModal = (item: Integration) => {
    setActiveModalId(item.id);
    setConfigForm(item.config || {});
    setTestResult(null);
  };

  const openGuideModal = (item: Integration) => {
    setActiveGuideIntegrationId(item.id);
  };

  const getIcon = (name?: string) => {
    switch (name) {
      case 'Calendar':
        return Calendar;
      case 'Building2':
        return Building2;
      case 'Workflow':
        return Workflow;
      case 'Webhook':
        return Webhook;
      case 'Mail':
        return Mail;
      case 'Slack':
        return Slack;
      case 'ShoppingBag':
        return ShoppingBag;
      case 'Target':
        return Target;
      case 'Globe':
        return Globe;
      default:
        return Zap;
    }
  };

  const filtered = integrations.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeIntegration = integrations.find((i) => i.id === activeModalId);
  const activeGuide: IntegrationGuideDetail | null = activeGuideIntegrationId ? (integrationGuides[activeGuideIntegrationId] || {
    id: activeGuideIntegrationId,
    title: 'Custom Connector Integration Guide',
    provider: 'Generic REST / Webhook Service',
    docUrl: `${origin}/api/docs`,
    primaryCallbackUrl: `${origin}/api/webhooks/custom`,
    fallbackCallbackUrl: `${origin}/api/webhooks/custom`,
    webhookUrl: `${origin}/api/webhooks/custom`,
    verifyToken: 'ansury_wa_verify_2026',
    steps: [
      `1. Send POST JSON requests to: ${origin}/api/webhooks/custom`,
      '2. Include header: "Content-Type: application/json"',
      '3. Inbound payloads will be logged in Supabase and trigger live messaging automations.',
    ],
    tips: ['Test your webhook with a cURL request or Postman.'],
  }) : null;

  return (
    <div className="w-full h-full min-h-0 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-teal-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-teal-400/40 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Main Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Boxes className="w-6 h-6 text-teal-400" />
              App Connectors & OAuth Integrations
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
              Supabase Synced
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage bi-directional enterprise connectors, Google Calendar OAuth 2.0, Zoho CRM, Meta Webhooks, and Developer API keys.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-sm shrink-0">
          <button
            onClick={() => setActiveTab('connectors')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'connectors'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Connectors ({integrations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('guides_callbacks')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'guides_callbacks'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Callback URLs & Guides</span>
          </button>

          <button
            onClick={() => setActiveTab('developer_api')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'developer_api'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>REST API Keys</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ALL CONNECTORS GRID */}
      {activeTab === 'connectors' && (
        <>
          {/* Quick Notice Banner with Active Domain */}
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-200">Active Deployment Domain:</span>{' '}
                <code className="bg-slate-950 px-2 py-0.5 rounded font-mono text-teal-300 border border-slate-800">
                  {origin}
                </code>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('guides_callbacks')}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 shrink-0"
            >
              <span>View All Authorized Callback URLs & Setup Steps</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filters & Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search connectors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 placeholder-slate-500"
                />
              </div>

              <button
                onClick={() => setShowAddConnectorModal(true)}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Connector</span>
              </button>
            </div>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => {
              const IconComp = getIcon(item.iconName);
              const isConnected = item.status === 'connected';
              const isGoogle = item.id === 'int_gcal' || item.id === 'int_google_leads';
              const isZoho = item.id === 'int_zoho';

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          isConnected
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isConnected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Connected
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-500" />
                            Not Configured
                          </>
                        )}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-100 text-base mb-1.5">{item.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.description}</p>
                  </div>

                  <div>
                    <div className="border-t border-slate-800/80 pt-3 mt-2 flex items-center justify-between text-[11px] text-slate-500 mb-4">
                      <span>Status: {item.lastSynced || 'Awaiting setup'}</span>
                      <button
                        onClick={() => openGuideModal(item)}
                        className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Guide & URL</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {/* OAuth Quick Connect Button for Google / Zoho */}
                      {isGoogle && (
                        <button
                          onClick={() => handleStartOAuth('google')}
                          disabled={isOauthConnecting === 'google'}
                          className="w-full py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>{isOauthConnecting === 'google' ? 'Connecting Google...' : isConnected ? 'Re-authenticate Google' : 'Connect via Google OAuth'}</span>
                        </button>
                      )}

                      {isZoho && (
                        <button
                          onClick={() => handleStartOAuth('zoho')}
                          disabled={isOauthConnecting === 'zoho'}
                          className="w-full py-2 px-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{isOauthConnecting === 'zoho' ? 'Connecting Zoho...' : isConnected ? 'Re-authenticate Zoho' : 'Connect via Zoho OAuth'}</span>
                        </button>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openConfigModal(item)}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-slate-700/50"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400" />
                          Configure
                        </button>

                        <button
                          onClick={() => handleTestConnection(item.id)}
                          title="Test Connection Ping"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700/50"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {isConnected && (
                          <button
                            onClick={() => handleDisconnect(item.id)}
                            title="Disconnect Connector"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 transition-all border border-slate-700/50"
                          >
                            <Unlink className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onDeleteIntegration && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete integration '${item.name}'?`)) {
                                onDeleteIntegration(item.id);
                              }
                            }}
                            title="Delete Integration Connector"
                            className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-all border border-rose-800/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* TAB 2: CALLBACK URLS & DETAILED STEP-BY-STEP SETUP GUIDES */}
      {activeTab === 'guides_callbacks' && (
        <div className="space-y-8 max-w-5xl">
          {/* Base URL Highlight Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-teal-400" />
                  Integration Callback & Webhook URLs Hub
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Copy and whitelist these exact URLs in your third-party developer consoles to avoid OAuth callback and webhook errors.
                </p>
              </div>

              <button
                onClick={() => handleCopyText(origin, 'base_origin')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSnippet === 'base_origin' ? 'Copied Origin!' : 'Copy Base Domain'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-xs">
              <div className="text-slate-300">
                <span className="text-slate-500 mr-2">Current Origin:</span>
                <span className="text-teal-300 font-bold">{origin}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Server Auto-Deduction Active
              </span>
            </div>
          </div>

          {/* Detailed Guides List */}
          <div className="space-y-6">
            {Object.values(integrationGuides).map((guide) => (
              <div
                key={guide.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{guide.title}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>Provider Portal:</span>
                        <span className="text-slate-300 font-semibold">{guide.provider}</span>
                      </p>
                    </div>
                  </div>

                  <a
                    href={guide.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shrink-0 self-start md:self-auto"
                  >
                    <span>Open {guide.provider}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Primary Callback URL Display */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      {guide.webhookUrl ? 'Inbound Webhook URL:' : 'Authorized Redirect URI (Primary):'}
                    </span>
                    <button
                      onClick={() => handleCopyText(guide.primaryCallbackUrl, `cb_${guide.id}`)}
                      className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedSnippet === `cb_${guide.id}` ? 'Copied!' : 'Copy URL'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-teal-300 break-all select-all">
                    {guide.primaryCallbackUrl}
                  </div>
                </div>

                {/* Fallback Callback URL if applicable */}
                {guide.fallbackCallbackUrl && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Universal Fallback Redirect URI:</span>
                      <button
                        onClick={() => handleCopyText(guide.fallbackCallbackUrl!, `fb_${guide.id}`)}
                        className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedSnippet === `fb_${guide.id}` ? 'Copied!' : 'Copy Fallback'}</span>
                      </button>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-400 break-all select-all">
                      {guide.fallbackCallbackUrl}
                    </div>
                  </div>
                )}

                {/* Verify Token if applicable */}
                {guide.verifyToken && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Meta Webhook Verify Token:</span>
                      <button
                        onClick={() => handleCopyText(guide.verifyToken!, `token_${guide.id}`)}
                        className="text-teal-400 hover:text-teal-300 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedSnippet === `token_${guide.id}` ? 'Copied Token!' : 'Copy Verify Token'}</span>
                      </button>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-amber-300 select-all">
                      {guide.verifyToken}
                    </div>
                  </div>
                )}

                {/* Step-by-Step Instructions */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Step-by-Step Configuration Steps
                  </span>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2 text-xs text-slate-300 leading-relaxed font-sans">
                    {guide.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro Tips */}
                {guide.tips && guide.tips.length > 0 && (
                  <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-300 flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                    <div>
                      {guide.tips.map((tip, i) => (
                        <p key={i}>{tip}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DEVELOPER API KEYS & REST PLAYGROUND */}
      {activeTab === 'developer_api' && (
        <div className="space-y-8 max-w-4xl">
          {/* Section 1: Tenant REST API Key Management */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  Public Tenant REST API Keys
                </h2>
                <p className="text-xs text-slate-400">
                  Authenticate outbound REST requests to embed Ansury messaging, contact updates, and campaign triggers directly into custom backends.
                </p>
              </div>

              <form onSubmit={handleCreateApiKey} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Key label (e.g., Production ERP)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate Key</span>
                </button>
              </form>
            </div>

            {/* Keys Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Key Label</th>
                    <th className="p-3">Secret Token</th>
                    <th className="p-3">Scope</th>
                    <th className="p-3">Created</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                  {apiKeys.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">
                        No custom API keys generated yet. Use the form above to generate your first key.
                      </td>
                    </tr>
                  ) : (
                    apiKeys.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-200">{k.name}</td>
                        <td className="p-3 font-mono text-teal-400">
                          <span>{k.key.substring(0, 16)}••••••••</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {k.scope}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{k.createdAt}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleCopyText(k.key, k.id)}
                            className="text-slate-400 hover:text-teal-300 p-1"
                            title="Copy full key"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteApiKey(k.id)}
                            className="text-slate-400 hover:text-rose-400 p-1"
                            title="Revoke key"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: REST API Endpoints Quick Reference */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-teal-400" />
              REST API Endpoints Quick Reference
            </h2>

            <div className="space-y-4">
              {/* Endpoint 1: Fetch CRM Contacts */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                      GET
                    </span>
                    <span className="text-slate-200">/api/contacts</span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopyText(
                        `curl -X GET ${origin}/api/contacts \\\n  -H "Authorization: Bearer ansury_live_sec_demo"`,
                        'curl_contacts'
                      )
                    }
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy cURL</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">List all contacts with WhatsApp Coexistence synchronization status.</p>
              </div>

              {/* Endpoint 2: Send Omnichannel Message */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-bold border border-blue-800">
                      POST
                    </span>
                    <span className="text-slate-200">/api/conversations/:id/messages</span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopyText(
                        `curl -X POST ${origin}/api/conversations/conv_01/messages \\\n  -H "Authorization: Bearer ansury_live_sec_demo" \\\n  -H "Content-Type: application/json" \\\n  -d '{"content":"Hello from custom ERP!","senderType":"agent"}'`,
                        'curl_msg'
                      )
                    }
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy cURL</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">Dispatch message across WhatsApp, Live Chat, or Instagram channel.</p>
              </div>

              {/* Endpoint 3: Inbound Generic Webhook */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800">
                      POST
                    </span>
                    <span className="text-slate-200">/api/webhooks/custom</span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopyText(
                        `curl -X POST ${origin}/api/webhooks/custom \\\n  -H "Content-Type: application/json" \\\n  -d '{"customerName":"Sarah Jenkins","email":"sarah@enterprise.com","event":"deal_won"}'`,
                        'curl_webhook'
                      )
                    }
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy cURL</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">Ingest generic webhooks from Zapier, Make, n8n, or backend microservices.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integration Configuration Slide-Over Modal */}
      {activeIntegration && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white">{activeIntegration.name} Configuration</h2>
                  <p className="text-xs text-slate-400">{activeIntegration.category}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalId(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* OAuth Quick Connect Action Banner inside modal */}
            {(activeIntegration.id === 'int_gcal' || activeIntegration.id === 'int_google_leads') && (
              <div className="p-4 rounded-xl bg-blue-950/50 border border-blue-800/60 mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-200 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-400" />
                    Google OAuth 2.0 Direct Authorization
                  </span>
                  <button
                    onClick={() => handleStartOAuth('google')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow"
                  >
                    Launch OAuth Popup
                  </button>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">Authorized Redirect URI:</span>{' '}
                    <code className="bg-slate-950 px-1.5 py-0.5 rounded font-mono text-teal-300">
                      {`${origin}/auth/callback/google`}
                    </code>
                  </div>
                  <button
                    onClick={() => handleCopyText(`${origin}/auth/callback/google`, 'gcal_modal_cb')}
                    className="text-teal-400 hover:text-teal-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            )}

            {activeIntegration.id === 'int_zoho' && (
              <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-800/60 mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    Zoho CRM OAuth 2.0 Direct Authorization
                  </span>
                  <button
                    onClick={() => handleStartOAuth('zoho')}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all shadow"
                  >
                    Launch OAuth Popup
                  </button>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">Authorized Redirect URI:</span>{' '}
                    <code className="bg-slate-950 px-1.5 py-0.5 rounded font-mono text-teal-300">
                      {`${origin}/auth/callback/zoho`}
                    </code>
                  </div>
                  <button
                    onClick={() => handleCopyText(`${origin}/auth/callback/zoho`, 'zoho_modal_cb')}
                    className="text-teal-400 hover:text-teal-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Link to Setup Guide */}
            <div className="mb-4 flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                Need help finding Client ID or Webhook URLs?
              </span>
              <button
                onClick={() => {
                  setActiveModalId(null);
                  setActiveGuideIntegrationId(activeIntegration.id);
                }}
                className="text-teal-400 hover:text-teal-300 font-bold"
              >
                View Setup Guide →
              </button>
            </div>

            {/* Config Fields */}
            <div className="space-y-4 mb-6">
              {Object.keys(configForm).map((key) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type={key.toLowerCase().includes('secret') || key.toLowerCase().includes('pass') || key.toLowerCase().includes('token') ? 'password' : 'text'}
                    value={configForm[key] || ''}
                    onChange={(e) =>
                      setConfigForm({ ...configForm, [key]: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              ))}
            </div>

            {/* Test Connection Output */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs mb-6 flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTestConnection(activeIntegration.id)}
                  disabled={isTesting}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all border border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Testing Ping...' : 'Test Connection'}
                </button>

                {activeIntegration.status === 'connected' && (
                  <button
                    type="button"
                    onClick={() => handleDisconnect(activeIntegration.id)}
                    className="px-3 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold transition-all border border-rose-800/40"
                  >
                    Disconnect
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalId(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveConfig(activeIntegration.id)}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  Save Integration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Guide Modal */}
      {activeGuide && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white">{activeGuide.title}</h2>
                  <p className="text-xs text-slate-400">Step-by-step setup and whitelist guide</p>
                </div>
              </div>
              <button
                onClick={() => setActiveGuideIntegrationId(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* URL to whitelist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>{activeGuide.webhookUrl ? 'Inbound Webhook Endpoint URL:' : 'Authorized Redirect URI:'}</span>
                <button
                  onClick={() => handleCopyText(activeGuide.primaryCallbackUrl, 'modal_guide_cb')}
                  className="text-teal-400 hover:text-teal-300 flex items-center gap-1 font-bold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSnippet === 'modal_guide_cb' ? 'Copied!' : 'Copy URL'}</span>
                </button>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-teal-300 break-all select-all">
                {activeGuide.primaryCallbackUrl}
              </div>
            </div>

            {/* Fallback if any */}
            {activeGuide.fallbackCallbackUrl && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Universal Fallback Redirect URI:</span>
                  <button
                    onClick={() => handleCopyText(activeGuide.fallbackCallbackUrl!, 'modal_guide_fb')}
                    className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Fallback</span>
                  </button>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-slate-400 break-all select-all">
                  {activeGuide.fallbackCallbackUrl}
                </div>
              </div>
            )}

            {/* Verify token if any */}
            {activeGuide.verifyToken && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Meta Verify Token:</span>
                  <button
                    onClick={() => handleCopyText(activeGuide.verifyToken!, 'modal_guide_token')}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Token</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-amber-300 select-all">
                  {activeGuide.verifyToken}
                </div>
              </div>
            )}

            {/* Steps */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Instructions
              </span>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
                {activeGuide.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <a
                href={activeGuide.docUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <span>Open {activeGuide.provider}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const intObj = integrations.find((i) => i.id === activeGuide.id);
                    setActiveGuideIntegrationId(null);
                    if (intObj) openConfigModal(intObj);
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow"
                >
                  Configure Connector Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Custom Connector Modal */}
      {showAddConnectorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white">Add Custom Connector</h2>
                  <p className="text-xs text-slate-400">Connect custom Webhook, REST API, or CRM relay</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddConnectorModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomConnector} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Connector Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HubSpot ERP Sync, Internal Billing Webhook"
                  value={newConnectorName}
                  onChange={(e) => setNewConnectorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={newConnectorCategory}
                    onChange={(e) => setNewConnectorCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="Workflows & Automation">Workflows & Automation</option>
                    <option value="CRM & ERP">CRM & ERP</option>
                    <option value="Productivity & Support">Productivity & Support</option>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="Lead Generation & Ads">Lead Generation & Ads</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Icon Type
                  </label>
                  <select
                    value={newConnectorIcon}
                    onChange={(e) => setNewConnectorIcon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="Webhook">Webhook Relay</option>
                    <option value="Building2">CRM & Business</option>
                    <option value="Workflow">Workflow Pipeline</option>
                    <option value="Globe">REST Web Service</option>
                    <option value="Zap">Lightning Event Trigger</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sync deals, dispatch order updates, trigger bi-directional payloads"
                  value={newConnectorDesc}
                  onChange={(e) => setNewConnectorDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Webhook / Target Endpoint URL
                </label>
                <input
                  type="url"
                  placeholder="https://api.yourdomain.com/v1/webhook"
                  value={newConnectorWebhookUrl}
                  onChange={(e) => setNewConnectorWebhookUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Secret Token / Bearer Key (Optional)
                </label>
                <input
                  type="password"
                  placeholder="sec_live_..."
                  value={newConnectorSecret}
                  onChange={(e) => setNewConnectorSecret(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddConnectorModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save & Connect to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
