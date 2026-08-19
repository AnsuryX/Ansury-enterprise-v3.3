import {
  Contact,
  Conversation,
  Message,
  Integration,
  EnterpriseBrandConfig,
  WhatsAppCoexistenceConfig,
  Inbox,
  AiAgentConfig,
  AiPersona,
  KnowledgeBaseItem,
  WhatsAppTemplate,
  SLAPolicy,
  AutomationRule,
  Macro,
  Agent,
  AuditLog,
  LeadAd,
  UserProfile,
  TenantAccount,
  Product,
  VisualFlow,
  BroadcastCampaign,
  CalendarEvent,
  AiToolExecutionLog,
} from '../types';

export const initialIntegrations: Integration[] = [
  {
    id: 'int_gcal',
    name: 'Google Calendar & Meet',
    key: 'calendar',
    category: 'Productivity & Support',
    description: 'OAuth 2.0 calendar integration for automated meeting booking, Google Meet links, and live event synchronization.',
    iconName: 'Calendar',
    status: 'disconnected',
    config: {
      clientId: '',
      clientSecret: '',
      calendarId: 'primary',
      redirectUri: '/auth/callback/google',
      autoGenerateMeetLink: 'true',
    },
    lastSynced: 'Not connected',
    eventsCount: 0,
  },
  {
    id: 'int_google_leads',
    name: 'Google Ads Lead Form Extensions',
    key: 'google_leads',
    category: 'Lead Generation & Ads',
    description: 'Ingest Google Search, YouTube, and Discovery lead form extensions directly into Ansury CRM via Google OAuth & Webhooks.',
    iconName: 'Globe',
    status: 'disconnected',
    config: {
      developerToken: '',
      googleAdsCustomerId: '',
      autoQualifyWithAI: 'true',
    },
    lastSynced: 'Not connected',
    eventsCount: 0,
  },
  {
    id: 'int_zoho',
    name: 'Zoho CRM & Desk',
    key: 'zoho',
    category: 'CRM & ERP',
    description: 'OAuth 2.0 multi-region Zoho CRM integration with automatic transcript logging, lead creation, and deal pipeline syncing.',
    iconName: 'Building2',
    status: 'disconnected',
    config: {
      region: 'com',
      clientId: '',
      clientSecret: '',
      module: 'Leads',
      syncDeals: 'true',
    },
    lastSynced: 'Not connected',
    eventsCount: 0,
  },
  {
    id: 'int_whatsapp',
    name: 'Meta WhatsApp Cloud API & Coexistence',
    key: 'whatsapp',
    category: 'CRM & ERP',
    description: 'Direct Meta Graph API and WhatsApp Webhook coexistence with WAMID deduplication.',
    iconName: 'Zap',
    status: 'disconnected',
    config: {
      appId: '',
      verifyToken: 'ansury_wa_verify_2026',
      coexistenceMode: 'DUAL_SYNC',
    },
    lastSynced: 'Not connected',
    eventsCount: 0,
  },
  {
    id: 'int_facebook_leads',
    name: 'Meta Facebook & Instagram Lead Ads',
    key: 'facebook_leads',
    category: 'Lead Generation & Ads',
    description: 'Real-time webhook ingestion for Facebook & Instagram Lead Ads with AI qualification, WhatsApp handoff, and attribution.',
    iconName: 'Target',
    status: 'disconnected',
    config: {
      metaAppId: '',
      pageId: '',
      autoInitiateWhatsAppMessage: 'true',
      assignedTeam: 'VIP Sales SDRs',
    },
    lastSynced: 'Not connected',
    eventsCount: 0,
  },
  {
    id: 'int_n8n',
    name: 'n8n & Make / Zapier Relay',
    key: 'n8n',
    category: 'Workflows & Automation',
    description: 'Bi-directional webhook integration for custom enterprise workflows, ERP updates, and automated fulfillment.',
    iconName: 'Workflow',
    status: 'disconnected',
    config: {
      webhookUrl: '',
      apiKey: '',
      eventTypes: 'conversation.created, message.received, lead.qualified, sla.breached',
      retryAttempts: '3',
    },
    lastSynced: 'Not connected',
    eventsCount: 0,
  },
  {
    id: 'int_webhook',
    name: 'Custom Inbound & Outbound Webhooks',
    key: 'webhook',
    category: 'Workflows & Automation',
    description: 'Deliver HTTP JSON payloads with HMAC-SHA256 signatures to any internal enterprise REST endpoint.',
    iconName: 'Webhook',
    status: 'disconnected',
    config: {
      targetUrl: '',
      signingSecret: '',
      method: 'POST',
    },
    lastSynced: 'Not connected',
    eventsCount: 0,
  },
  {
    id: 'int_slack',
    name: 'Slack Enterprise Escalations',
    key: 'slack',
    category: 'Productivity & Support',
    description: 'Push high-priority customer alerts, VIP lead alerts, and SLA breach warnings into designated Slack channels.',
    iconName: 'Slack',
    status: 'disconnected',
    config: {
      webhookUrl: '',
      channel: '#ansury-escalations',
      notifyOnSlaBreach: 'true',
      notifyOnHighIntentLead: 'true',
    },
    lastSynced: 'Not connected',
    eventsCount: 0,
  },
  {
    id: 'int_shopify',
    name: 'Shopify Storefront Connector',
    key: 'shopify',
    category: 'E-Commerce',
    description: 'Sync order history, live tracking, cart recovery prompts, and Meta Commerce catalogs directly inside the chat window.',
    iconName: 'ShoppingBag',
    status: 'disconnected',
    config: {
      shopDomain: '',
      adminAccessToken: '',
      syncProductsDaily: 'true',
    },
    lastSynced: 'Not connected',
    eventsCount: 0,
  },
  {
    id: 'int_smtp',
    name: 'Custom SMTP & IMAP Mailer',
    key: 'smtp',
    category: 'Productivity & Support',
    description: 'Send and receive email support tickets using your company custom SMTP server (SendGrid, AWS SES, Mailgun, Office 365).',
    iconName: 'Mail',
    status: 'disconnected',
    config: {
      host: '',
      port: '587',
      username: '',
      password: '',
      fromEmail: '',
      fromName: 'Ansury Enterprise Support',
      secure: 'true',
    },
    lastSynced: 'Not connected',
    eventsCount: 0,
  },
];

export const initialContacts: Contact[] = [];
export const initialConversations: Conversation[] = [];
export const initialMessages: Record<string, Message[]> = {};
export const initialCalendarEvents: CalendarEvent[] = [];
export const initialAiToolLogs: AiToolExecutionLog[] = [];
export const initialLeads: LeadAd[] = [];
export const initialBroadcasts: BroadcastCampaign[] = [];
export const initialProducts: Product[] = [];
export const initialVisualFlows: VisualFlow[] = [];

export const initialBrandConfig: EnterpriseBrandConfig = {
  brandName: 'Ansury Enterprise',
  primaryColor: '#0d9488',
  logoUrl: '',
  customDomain: 'chat.ansury.com',
  whiteLabelEnabled: true,
  supportEmail: 'support@ansury.com',
};

export const initialCoexistenceConfig: WhatsAppCoexistenceConfig = {
  appId: '',
  appSecret: '',
  techProviderToken: '',
  phoneNumberId: '',
  wabaId: '',
  displayPhoneNumber: '',
  coexistenceStatus: 'DISCONNECTED',
  syncMode: 'DUAL_COEXISTENCE',
  deduplicationWindowSec: 300,
  webhookUrl: '/api/webhooks/whatsapp',
  webhookVerifyToken: 'ansury_wa_verify_2026',
  embeddedSignupCompleted: false,
  metaPartnerName: 'Ansury Enterprise Cloud',
  lastWebhookPing: 'Not connected',
};

export const initialInboxes: Inbox[] = [
  {
    id: 'inbox_wa_primary',
    name: 'WhatsApp Business',
    channel: 'whatsapp',
    phoneNumber: '',
    status: 'inactive',
    wabaId: '',
  },
  {
    id: 'inbox_email_support',
    name: 'Enterprise Support Desk',
    channel: 'email',
    status: 'inactive',
  },
];

export const initialAiAgentConfig: AiAgentConfig = {
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-2.5-flash',
  temperature: 0.2,
  maxTokens: 1024,
  autoHandoverOnNegativeSentiment: true,
  handoverAssignee: '',
  systemPrompt:
    'You are an autonomous enterprise AI Co-Agent on the Ansury platform. Deliver precise, polite, and concise solutions. Comply with security SLAs and escalate whenever human intervention is required.',
};

export const initialAiPersonas: AiPersona[] = [];
export const initialKnowledgeBase: KnowledgeBaseItem[] = [];
export const initialTemplates: WhatsAppTemplate[] = [];
export const initialSLAPolicies: SLAPolicy[] = [];
export const initialAutomations: AutomationRule[] = [];
export const initialMacros: Macro[] = [];
export const initialAgents: Agent[] = [];
export const initialAuditLogs: AuditLog[] = [];

export const initialUserProfile: UserProfile = {
  id: 'usr_owner_01',
  name: 'Admin User',
  email: 'admin@ansury.com',
  phone: '',
  role: 'Super Admin & Platform Owner',
  avatar: '',
  bio: 'Platform Owner',
  timezone: 'UTC',
  language: 'English',
  twoFactorEnabled: true,
  emailNotifications: true,
  desktopNotifications: true,
  whatsappEscalationAlerts: false,
  activeSessionsCount: 1,
  lastLogin: 'Just now',
  status: 'APPROVED',
};

export const initialTenants: TenantAccount[] = [
  {
    id: 'tenant_main',
    name: 'Admin User',
    email: 'admin@ansury.com',
    company: 'Ansury Enterprise HQ',
    role: 'Super Admin',
    status: 'APPROVED',
    plan: 'Enterprise Ultra',
    requestedAt: new Date().toISOString().substring(0, 10),
    approvedAt: new Date().toISOString().substring(0, 10),
    maxAgents: 50,
    monthlyMessageQuota: 1000000,
    notes: 'Default primary enterprise tenant',
  },
];



