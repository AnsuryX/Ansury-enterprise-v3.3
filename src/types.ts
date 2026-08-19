export type ChannelType =
  | 'whatsapp'
  | 'livechat'
  | 'email'
  | 'instagram'
  | 'messenger'
  | 'telegram'
  | 'line'
  | 'sms'
  | 'facebook_lead'
  | 'google_lead';

export type ConversationStatus = 'open' | 'pending' | 'snoozed' | 'resolved';

export type ConversationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Integration {
  id: string;
  name: string;
  key: 'whatsapp' | 'calendar' | 'zoho' | 'smtp' | 'n8n' | 'webhook' | 'slack' | 'shopify' | 'facebook_leads' | 'google_leads' | string;
  category: 'CRM & ERP' | 'Workflows & Automation' | 'Productivity & Support' | 'E-Commerce' | 'Lead Generation & Ads' | string;
  description: string;
  iconName: string;
  status: 'connected' | 'disconnected' | 'testing';
  config: Record<string, string>;
  lastSynced?: string;
  eventsCount?: number;
}

export interface AiAgentConfig {
  provider: 'openai' | 'gemini' | 'anthropic' | 'byok_custom';
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  autoHandoverOnNegativeSentiment: boolean;
  handoverAssignee: string;
  systemPrompt: string;
}

export interface AiPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  tone: string;
  greeting: string;
  systemPrompt: string;
  isActive: boolean;
  kbGroundingEnabled: boolean;
}

export interface KnowledgeBaseItem {
  id: string;
  title: string;
  category: 'FAQs' | 'Product Guides' | 'Return & Refunds' | 'Technical Specs' | 'Pricing & SLAs';
  content: string;
  fileType: 'text' | 'pdf' | 'url';
  fileUrl?: string;
  tokenCount: number;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  company?: string;
  jobTitle?: string;
  location?: string;
  preferredChannel?: ChannelType | string;
  lifecycleStage?: 'lead' | 'prospect' | 'customer' | 'vip' | 'partner' | string;
  leadScore?: number;
  assignedAgent?: string;
  tags: string[];
  notes?: string;
  createdAt?: string;
  customAttributes: Record<string, string>;
  waBusinessProfile?: {
    verifiedName: string;
    accountType: 'BUSINESS' | 'ENTERPRISE';
    coexistenceActive: boolean;
    lastAppSync: string;
    waId: string;
  };
}

export interface WhatsAppTemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phoneNumber?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  headerType?: 'TEXT' | 'IMAGE' | 'DOCUMENT';
  headerText?: string;
  bodyText: string;
  footerText?: string;
  buttons?: WhatsAppTemplateButton[];
  updatedAt: string;
}

export interface WhatsAppCoexistenceConfig {
  wabaId: string;
  appId: string;
  appSecret: string;
  techProviderToken: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  coexistenceStatus: 'CONNECTED' | 'PARTIAL_SYNC' | 'DISCONNECTED';
  syncMode: 'DUAL_COEXISTENCE' | 'API_PRIMARY' | 'APP_PRIMARY';
  deduplicationWindowSec: number;
  webhookUrl: string;
  webhookVerifyToken: string;
  embeddedSignupCompleted: boolean;
  metaPartnerName: string;
  lastWebhookPing: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  imageUrl: string;
  category: string;
  sku: string;
  stockQuantity: number;
  metaCatalogId: string;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface BroadcastCampaign {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  audienceTag: string;
  totalAudience: number;
  scheduledAt: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  stats: {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    unsubscribed: number;
    conversions: number;
  };
  createdAt: string;
}

export interface FlowTrigger {
  type: 'keyword' | 'conversation_created' | 'order_placed' | 'sla_breach' | 'abandoned_cart' | 'tag_added' | 'inactivity';
  config: Record<string, string>;
}

export interface FlowNode {
  id: string;
  type: 'trigger' | 'send_message' | 'send_product_catalog' | 'ai_copilot_handover' | 'condition_branch' | 'add_tag' | 'assign_agent' | 'delay' | 'webhook_n8n' | 'crm_deal_create';
  title: string;
  description: string;
  config: Record<string, any>;
  nextNodes: string[];
}

export interface FlowExecutionStep {
  stepId: string;
  nodeId: string;
  nodeTitle: string;
  nodeType: FlowNode['type'];
  status: 'COMPLETED' | 'BRANCH_TRUE' | 'BRANCH_FALSE' | 'DISPATCHED_N8N' | 'FAILED';
  inputPayload: Record<string, any>;
  outputPayload: Record<string, any>;
  latencyMs: number;
  timestamp: string;
}

export interface FlowExecutionTrace {
  id: string;
  flowId: string;
  flowName: string;
  contactName: string;
  contactPhone: string;
  channel: ChannelType;
  startedAt: string;
  completedAt?: string;
  status: 'SUCCESS' | 'RUNNING' | 'ERROR';
  steps: FlowExecutionStep[];
}

export interface VisualFlow {
  id: string;
  name: string;
  description: string;
  trigger: FlowTrigger;
  nodes: FlowNode[];
  isActive: boolean;
  executionCount: number;
  lastTriggered: string;
  recentTraces?: FlowExecutionTrace[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: 'user' | 'agent' | 'system' | 'bot' | 'contact';
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  channel: ChannelType;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isPrivateNote?: boolean;
  attachments?: {
    type: 'image' | 'file' | 'audio' | 'video';
    url: string;
    name: string;
    size?: string;
  }[];
  productMeta?: {
    product: Product;
    action?: 'view' | 'add_to_cart' | 'order_placed';
  };
  orderMeta?: {
    orderId: string;
    items: CartItem[];
    totalAmount: number;
    currency: string;
    status: 'pending' | 'confirmed' | 'shipped';
  };
  whatsappMeta?: {
    messageId?: string;
    wamid?: string;
    coexistenceSynced?: boolean;
    sourceApp?: 'WhatsApp Business App' | 'Ansury Tech Provider API';
    sourceDevice?: string;
    messageType?: string;
    templateName?: string;
    interactiveType?: 'button_reply' | 'list_reply';
  };
}

export interface Conversation {
  id: string;
  contact: Contact;
  inboxId?: string;
  inboxName?: string;
  channel: ChannelType;
  status: ConversationStatus;
  priority: ConversationPriority;
  assignedAgent?: string;
  assigneeId?: string;
  assigneeName?: string;
  teamId?: string;
  teamName?: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  tags: string[];
  slaStatus?: 'healthy' | 'warning' | 'breached';
  slaDueInMinutes?: number;
  slaExpiresAt?: string;
  wabaSessionStatus?: 'ACTIVE_WINDOW' | 'TEMPLATE_REQUIRED';
  sessionWindowExpiresAt?: string;
  coexistenceSynced: boolean;
  createdAt?: string;
  updatedAt?: string;
  sentiment?: 'positive' | 'neutral' | 'frustrated' | 'urgent' | 'high_intent';
  leadScore?: number;
  intentLabel?: string;
  aiAnalysisReason?: string;
  assignedPersonaId?: string;
  activeCoAgents?: {
    agentName: string;
    agentAvatar?: string;
    isTyping: boolean;
    lastActive: string;
  }[];
}

export interface Inbox {
  id: string;
  name: string;
  channel: ChannelType;
  status: 'active' | 'inactive';
  coexistenceEnabled?: boolean;
  phoneNumber?: string;
  wabaId?: string;
  avatar?: string;
  greetingMessage?: string;
  widgetColor?: string;
}

export interface SLAPolicy {
  id: string;
  name: string;
  description: string;
  firstResponseTimeMins: number;
  resolutionTimeMins: number;
  priorityFilter: ConversationPriority[];
  escalationTeam: string;
  enabled: boolean;
  breachCountThisMonth: number;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  event: 'conversation_created' | 'message_created' | 'sla_approaching';
  conditions: {
    field: string;
    operator: 'contains' | 'equals' | 'starts_with' | 'is';
    value: string;
  }[];
  actions: {
    type: 'assign_team' | 'add_label' | 'send_whatsapp_template' | 'trigger_ai_copilot';
    targetValue: string;
  }[];
  enabled: boolean;
  executionCount: number;
}

export interface Macro {
  id: string;
  title: string;
  shortcut: string;
  content: string;
  category: 'support' | 'sales' | 'billing' | 'whatsapp';
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'agent';
  status: 'online' | 'busy' | 'offline';
  avatar: string;
  teams: string[];
  activeConversations: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  ip: string;
}

export interface EnterpriseBrandConfig {
  brandName: string;
  primaryColor: string;
  logoUrl?: string;
  customDomain: string;
  whiteLabelEnabled: boolean;
  supportEmail: string;
}

export interface LeadAd {
  id: string;
  source: 'facebook_lead_ad' | 'google_ads_lead_form';
  campaignName: string;
  adSetName?: string;
  formName: string;
  leadName: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  budgetRange?: string;
  qualificationStatus: 'unqualified' | 'ai_qualifying' | 'qualified' | 'closed_won' | 'disqualified';
  aiQualificationScore: number;
  aiSummary?: string;
  formFields: Record<string, string>;
  createdAt: string;
  conversationId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Super Admin & Platform Owner' | 'Admin & System Owner' | 'Senior Supervisor' | 'Support Specialist' | 'Sales SDR' | string;
  avatar: string;
  bio: string;
  timezone: string;
  language: string;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  desktopNotifications: boolean;
  whatsappEscalationAlerts: boolean;
  activeSessionsCount: number;
  lastLogin: string;
  status?: 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED' | 'SUSPENDED';
  tenantId?: string;
}

export type TenantStatus = 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED' | 'SUSPENDED';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendeeName?: string;
  attendeeEmail?: string;
  attendeePhone?: string;
  hostAgent?: string;
  location?: string;
  meetLink?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  conversationId?: string;
  contactId?: string;
  source: 'google_calendar' | 'ai_booking_agent' | 'inbox_manual' | 'crm_schedule';
  colorTag?: 'teal' | 'emerald' | 'blue' | 'purple' | 'amber' | 'rose';
  createdAt?: string;
}

export interface BookingSlot {
  time: string;
  isoString: string;
  available: boolean;
  conflictingEvent?: string;
}

export interface AiToolExecutionLog {
  id: string;
  timestamp: string;
  toolName: 'google_calendar_schedule' | 'google_calendar_check_availability' | 'crm_lead_update' | 'n8n_trigger' | 'whatsapp_template_dispatch' | 'rag_knowledge_search';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  latencyMs: number;
  inputPayload: Record<string, any>;
  outputPayload: Record<string, any>;
  summary: string;
}

export interface AiPlaygroundMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  toolCall?: {
    name: string;
    arguments: Record<string, any>;
    result?: any;
    executionMs?: number;
  };
  groundingSources?: string[];
  tokenEstimate?: number;
}

export interface TenantAccount {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  status: TenantStatus;
  plan: 'Free Trial' | 'Growth SaaS' | 'Enterprise Ultra' | 'Custom VIP';
  requestedAt: string;
  approvedAt?: string;
  maxAgents: number;
  monthlyMessageQuota: number;
  notes?: string;
}

