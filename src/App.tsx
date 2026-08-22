import React, { useState, useEffect } from 'react';
import { Navigation, ActiveTab } from './components/Navigation';
import { InboxModule } from './components/InboxModule';
import { WhatsAppCoexistenceModule } from './components/WhatsAppCoexistenceModule';
import { IntegrationsModule } from './components/IntegrationsModule';
import { AiAgentsModule } from './components/AiAgentsModule';
import { CRMModule } from './components/CRMModule';
import { AutomationModule } from './components/AutomationModule';
import { SLAEngineModule } from './components/SLAEngineModule';
import { TemplatesModule } from './components/TemplatesModule';
import { ChatWidgetCustomizer } from './components/ChatWidgetCustomizer';
import { AnalyticsModule } from './components/AnalyticsModule';
import { SettingsModule } from './components/SettingsModule';
import { MetaCommerceModule } from './components/MetaCommerceModule';
import { BroadcastsModule } from './components/BroadcastsModule';
import { VisualFlowBuilderModule } from './components/VisualFlowBuilderModule';
import { UserProfileModal } from './components/UserProfileModal';
import { LoginScreen } from './components/LoginScreen';
import { SuperAdminPanelModule } from './components/SuperAdminPanelModule';
import { CalendarModule } from './components/CalendarModule';
import { AiPlaygroundModule } from './components/AiPlaygroundModule';
import { DatabaseHubModule } from './components/DatabaseHubModule';

import {
  Conversation,
  Message,
  Contact,
  WhatsAppCoexistenceConfig,
  WhatsAppTemplate,
  SLAPolicy,
  AutomationRule,
  Macro,
  EnterpriseBrandConfig,
  AuditLog,
  Integration,
  AiAgentConfig,
  AiPersona,
  KnowledgeBaseItem,
  Product,
  BroadcastCampaign,
  VisualFlow,
  CartItem,
  UserProfile,
} from './types';
import {
  initialBrandConfig,
  initialCoexistenceConfig,
  initialConversations,
  initialMessages,
  initialContacts,
  initialTemplates,
  initialSLAPolicies,
  initialAutomations,
  initialMacros,
  initialAuditLogs,
  initialIntegrations,
  initialAiAgentConfig,
  initialAiPersonas,
  initialKnowledgeBase,
  initialProducts,
  initialBroadcasts,
  initialVisualFlows,
  initialUserProfile,
} from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('inbox');
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('ansury_auth_token'));
  });
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  // State loaded from server / local initial fallback
  const [brand, setBrand] = useState<EnterpriseBrandConfig>(initialBrandConfig);
  const [coexistenceConfig, setCoexistenceConfig] = useState<WhatsAppCoexistenceConfig>(initialCoexistenceConfig);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConvId, setActiveConvId] = useState<string>(initialConversations[0]?.id || '');
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(initialMessages);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(initialTemplates);
  const [slas, setSlas] = useState<SLAPolicy[]>(initialSLAPolicies);
  const [automations, setAutomations] = useState<AutomationRule[]>(initialAutomations);
  const [macros, setMacros] = useState<Macro[]>(initialMacros);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [aiConfig, setAiConfig] = useState<AiAgentConfig>(initialAiAgentConfig);
  const [aiPersonas, setAiPersonas] = useState<AiPersona[]>(initialAiPersonas);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>(initialKnowledgeBase);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [broadcasts, setBroadcasts] = useState<BroadcastCampaign[]>(initialBroadcasts);
  const [flows, setFlows] = useState<VisualFlow[]>(initialVisualFlows);

  // Validate authentication session on mount
  useEffect(() => {
    const token = localStorage.getItem('ansury_auth_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.user) {
            setUserProfile(data.user);
            setIsAuthenticated(true);
            setIsLoggedOut(false);
          } else {
            // Invalid or expired token
            localStorage.removeItem('ansury_auth_token');
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          // If server fails or offline, leave cached state
        });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Load backend state on mount
  useEffect(() => {
    fetch('/api/brand')
      .then((r) => r.json())
      .then((d) => d.success && setBrand(d.brand))
      .catch(() => {});

    fetch('/api/conversations')
      .then((r) => r.json())
      .then((d) => d.success && setConversations(d.conversations))
      .catch(() => {});

    fetch('/api/contacts')
      .then((r) => r.json())
      .then((d) => d.success && setContacts(d.contacts))
      .catch(() => {});

    fetch('/api/whatsapp/config')
      .then((r) => r.json())
      .then((d) => d.success && setCoexistenceConfig(d.config))
      .catch(() => {});

    fetch('/api/whatsapp/templates')
      .then((r) => r.json())
      .then((d) => d.success && setTemplates(d.templates))
      .catch(() => {});

    fetch('/api/integrations')
      .then((r) => r.json())
      .then((d) => d.success && setIntegrations(d.integrations))
      .catch(() => {});

    fetch('/api/ai-agents/config')
      .then((r) => r.json())
      .then((d) => d.success && setAiConfig(d.config))
      .catch(() => {});

    fetch('/api/ai-agents/personas')
      .then((r) => r.json())
      .then((d) => d.success && setAiPersonas(d.personas))
      .catch(() => {});

    fetch('/api/ai-agents/kb')
      .then((r) => r.json())
      .then((d) => d.success && setKnowledgeBase(d.kb))
      .catch(() => {});

    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => d.success && setProducts(d.products))
      .catch(() => {});

    fetch('/api/broadcasts')
      .then((r) => r.json())
      .then((d) => d.success && setBroadcasts(d.broadcasts))
      .catch(() => {});

    fetch('/api/flows')
      .then((r) => r.json())
      .then((d) => d.success && setFlows(d.flows))
      .catch(() => {});
  }, []);

  // Fetch active conversation messages
  useEffect(() => {
    if (!activeConvId) return;
    fetch(`/api/conversations/${activeConvId}/messages`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.messages) {
          setMessagesMap((prev) => ({ ...prev, [activeConvId]: d.messages }));
        }
      })
      .catch(() => {});
  }, [activeConvId]);

  // Handle send message
  const handleSendMessage = async (
    convId: string,
    content: string,
    isPrivateNote?: boolean,
    templateName?: string,
    productMeta?: { product: Product; action?: 'view' | 'add_to_cart' | 'order_placed' },
    orderMeta?: { orderId: string; items: CartItem[]; totalAmount: number; currency: string; status: 'pending' | 'confirmed' | 'shipped' }
  ) => {
    const activeConv = conversations.find((c) => c.id === convId);
    const channel = activeConv ? activeConv.channel : 'whatsapp';

    try {
      const res = await fetch(`/api/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          senderType: isPrivateNote ? 'agent' : 'agent',
          senderName: 'Sarah Jenkins (Admin)',
          isPrivateNote,
          channel,
          templateName,
          productMeta,
          orderMeta,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessagesMap((prev) => ({
          ...prev,
          [convId]: [...(prev[convId] || []), data.message],
        }));

        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  lastMessage: isPrivateNote ? `[Private Note] ${content}` : content,
                  lastMessageTimestamp: 'Just now',
                  unreadCount: 0,
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Product Catalog Handlers
  const handleAddProduct = (prod: Product) => {
    setProducts((prev) => [prod, ...prev]);
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prod),
    }).catch(console.error);
  };

  const handleUpdateProduct = (prod: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === prod.id ? prod : p)));
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prod),
    }).catch(console.error);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(console.error);
  };

  // Broadcast Handlers
  const handleAddBroadcast = (bcast: BroadcastCampaign) => {
    setBroadcasts((prev) => [bcast, ...prev]);
    fetch('/api/broadcasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bcast),
    }).catch(console.error);
  };

  const handleRunBroadcast = (id: string) => {
    setBroadcasts((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: 'completed',
              stats: {
                ...b.stats,
                sent: b.totalAudience,
                delivered: Math.floor(b.totalAudience * 0.99),
                read: Math.floor(b.totalAudience * 0.88),
                clicked: Math.floor(b.totalAudience * 0.35),
              },
            }
          : b
      )
    );
    fetch(`/api/broadcasts/${id}/run`, { method: 'POST' }).catch(console.error);
  };

  // Visual Flow Handlers
  const handleAddFlow = (flow: VisualFlow) => {
    setFlows((prev) => [flow, ...prev]);
    fetch('/api/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flow),
    }).catch(console.error);
  };

  const handleUpdateFlow = (flow: VisualFlow) => {
    setFlows((prev) => prev.map((f) => (f.id === flow.id ? flow : f)));
    fetch('/api/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flow),
    }).catch(console.error);
  };

  const handleDeleteFlow = (id: string) => {
    setFlows((prev) => prev.filter((f) => f.id !== id));
    fetch(`/api/flows/${id}`, { method: 'DELETE' }).catch(console.error);
  };

  // Handle AI Copilot trigger
  const handleTriggerAiCopilot = async (
    action: string,
    text: string,
    history: Message[]
  ) => {
    const res = await fetch('/api/ai/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        text,
        conversationHistory: history,
      }),
    });
    const data = await res.json();
    return data.result || 'AI response failed';
  };

  // Handle WhatsApp Mobile Simulator Webhook trigger
  const handleSendSimulatorWebhook = async (
    text: string,
    senderName: string,
    senderPhone: string
  ) => {
    const res = await fetch('/api/webhooks/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        senderName,
        senderPhone,
        sourceApp: 'WhatsApp Business Mobile App',
      }),
    });

    const data = await res.json();
    if (data.success) {
      // Refresh conversations & messages
      const convRes = await fetch('/api/conversations');
      const convData = await convRes.json();
      if (convData.success) {
        setConversations(convData.conversations);
        if (data.conversationId) {
          setActiveConvId(data.conversationId);
          const msgRes = await fetch(`/api/conversations/${data.conversationId}/messages`);
          const msgData = await msgRes.json();
          if (msgData.success) {
            setMessagesMap((prev) => ({
              ...prev,
              [data.conversationId]: msgData.messages,
            }));
          }
        }
      }
    }
    return data;
  };

  // Update WhatsApp config
  const handleUpdateCoexistenceConfig = async (
    updated: Partial<WhatsAppCoexistenceConfig>
  ) => {
    const res = await fetch('/api/whatsapp/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    const data = await res.json();
    if (data.success) {
      setCoexistenceConfig(data.config);
    }
  };

  // Add Contact
  const handleAddContact = async (contact: Partial<Contact>) => {
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    });
    const data = await res.json();
    if (data.success && data.contact) {
      setContacts((prev) => [data.contact, ...prev]);
    }
  };

  // Add Integration
  const handleAddIntegration = async (newInt: Partial<Integration>) => {
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInt),
      });
      const data = await res.json();
      if (data.success && data.integration) {
        setIntegrations((prev) => [data.integration, ...prev]);
      }
    } catch (err) {
      console.error('Error creating integration:', err);
    }
  };

  // Update Contact
  const handleUpdateContact = async (id: string, updated: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && data.contact) {
        setContacts((prev) => prev.map((c) => (c.id === id ? data.contact : c)));
      }
    } catch (err) {
      console.error('Error updating contact:', err);
    }
  };

  // Start direct conversation from CRM Contact card
  const handleStartConversation = async (contact: Contact) => {
    const existingConv = conversations.find(
      (c) => c.contact.id === contact.id || c.contact.phone === contact.phone
    );

    if (existingConv) {
      setActiveConvId(existingConv.id);
      setActiveTab('inbox');
    } else {
      const newConv: Conversation = {
        id: `conv_${Date.now()}`,
        contact,
        inboxId: contact.preferredChannel === 'livechat' ? 'inbox_chat_01' : 'inbox_wa_01',
        inboxName: contact.preferredChannel === 'livechat' ? 'Web Live Chat' : 'WhatsApp Business (Meta Coexistence)',
        channel: (contact.preferredChannel as any) || 'whatsapp',
        status: 'open',
        priority: contact.lifecycleStage === 'vip' ? 'urgent' : 'medium',
        lastMessage: `Conversation initiated with ${contact.name}`,
        lastMessageTimestamp: 'Just now',
        unreadCount: 0,
        tags: contact.tags || ['Outbound'],
        slaStatus: 'healthy',
        slaDueInMinutes: 60,
        coexistenceSynced: Boolean(contact.waBusinessProfile?.coexistenceActive),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      setActiveTab('inbox');

      fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConv),
      }).catch(console.error);
    }
  };

  // Create Template
  const handleCreateTemplate = async (tpl: Partial<WhatsAppTemplate>) => {
    const res = await fetch('/api/whatsapp/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tpl),
    });
    const data = await res.json();
    if (data.success) {
      setTemplates((prev) => [data.template, ...prev]);
    }
  };

  // Update Brand
  const handleUpdateBrand = async (updated: Partial<EnterpriseBrandConfig>) => {
    const res = await fetch('/api/brand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    const data = await res.json();
    if (data.success) {
      setBrand(data.brand);
    }
  };

  // Update Conversation Status
  const handleUpdateConversationStatus = async (
    id: string,
    status: Conversation['status']
  ) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    fetch(`/api/conversations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(console.error);
  };

  // Integration Update Handler
  const handleUpdateIntegration = (id: string, updated: Partial<Integration>) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updated } : i))
    );
  };

  // AI Persona Handlers
  const handleUpdatePersona = (persona: AiPersona) => {
    setAiPersonas((prev) => {
      const idx = prev.findIndex((p) => p.id === persona.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = persona;
        return next;
      }
      return [persona, ...prev];
    });
  };

  const handleDeletePersona = async (id: string) => {
    setAiPersonas((prev) => prev.filter((p) => p.id !== id));
    fetch(`/api/ai-agents/personas/${id}`, { method: 'DELETE' }).catch(console.error);
  };

  // Conversation & Contact Deletion Handlers
  const handleDeleteConversation = async (id: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      if (activeConvId === id) {
        setActiveConvId(updated[0]?.id || '');
      }
      return updated;
    });
    setMessagesMap((prev) => {
      const nextMap = { ...prev };
      delete nextMap[id];
      return nextMap;
    });
    fetch(`/api/conversations/${id}`, { method: 'DELETE' }).catch(console.error);
  };

  const handleDeleteContact = async (id: string) => {
    const target = contacts.find((c) => c.id === id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (target) {
      const linkedConvIds = conversations
        .filter((c) => c.contact.id === id || c.contact.phone === target.phone)
        .map((c) => c.id);
      setConversations((prev) => prev.filter((c) => !linkedConvIds.includes(c.id)));
      if (linkedConvIds.includes(activeConvId)) {
        const remaining = conversations.filter((c) => !linkedConvIds.includes(c.id));
        setActiveConvId(remaining[0]?.id || '');
      }
    }
    fetch(`/api/contacts/${id}`, { method: 'DELETE' }).catch(console.error);
  };

  const handleDeleteBroadcast = async (id: string) => {
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
    fetch(`/api/broadcasts/${id}`, { method: 'DELETE' }).catch(console.error);
  };

  const handleDeleteTemplate = async (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    fetch(`/api/whatsapp/templates/${id}`, { method: 'DELETE' }).catch(console.error);
  };

  const handleDeleteIntegration = async (id: string) => {
    setIntegrations((prev) => prev.filter((i) => i.id !== id));
    fetch(`/api/integrations/${id}`, { method: 'DELETE' }).catch(console.error);
  };

  // Demo Data Management Handlers
  const handleClearDemoData = async (category?: string) => {
    try {
      const res = await fetch('/api/demo/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts || []);
        setConversations(data.conversations || []);
        setActiveConvId('');
        setMessagesMap({});
        if (data.broadcasts) setBroadcasts(data.broadcasts);
        if (data.flows) setFlows(data.flows);
        if (data.products) setProducts(data.products);
      }
    } catch (e) {
      console.error('Error clearing demo data:', e);
    }
  };

  const handleResetDemoData = async () => {
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts || []);
        setConversations(data.conversations || []);
        setActiveConvId(data.conversations?.[0]?.id || '');
        if (data.templates) setTemplates(data.templates);
        if (data.integrations) setIntegrations(data.integrations);
        if (data.products) setProducts(data.products);
        if (data.broadcasts) setBroadcasts(data.broadcasts);
        if (data.flows) setFlows(data.flows);
      }
    } catch (e) {
      console.error('Error resetting demo data:', e);
    }
  };

  // KB Handlers
  const handleUpdateKb = (item: KnowledgeBaseItem) => {
    setKnowledgeBase((prev) => {
      const idx = prev.findIndex((k) => k.id === item.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = item;
        return next;
      }
      return [item, ...prev];
    });
  };

  const handleDeleteKb = async (id: string) => {
    setKnowledgeBase((prev) => prev.filter((k) => k.id !== id));
    fetch(`/api/ai-agents/kb/${id}`, { method: 'DELETE' }).catch(console.error);
  };

  const unreadCountTotal = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('ansury_auth_token');
    localStorage.removeItem('ansury_user_profile');
    setIsAuthenticated(false);
    setIsLoggedOut(true);
  };

  if (!isAuthenticated || isLoggedOut) {
    return (
      <LoginScreen
        brandName={brand.brandName || 'Ansury'}
        onLoginSuccess={(user) => {
          setUserProfile(user);
          setIsAuthenticated(true);
          setIsLoggedOut(false);
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-100">
      {/* Primary Sidebar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        brand={brand}
        unreadCount={unreadCountTotal}
        coexistenceStatus={coexistenceConfig.coexistenceStatus}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Profile & Account Settings Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={(updated) => setUserProfile(updated)}
        onLogout={() => {
          setIsProfileModalOpen(false);
          handleLogout();
        }}
      />

      {/* Main Module Content View */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'super_admin' && (
          <SuperAdminPanelModule currentAdminEmail={userProfile.email} />
        )}

        {activeTab === 'inbox' && (

          <InboxModule
            conversations={conversations}
            activeConvId={activeConvId}
            setActiveConvId={setActiveConvId}
            messages={messagesMap[activeConvId] || []}
            onSendMessage={handleSendMessage}
            macros={macros}
            templates={templates}
            products={products}
            onTriggerAiCopilot={handleTriggerAiCopilot}
            onUpdateConversationStatus={handleUpdateConversationStatus}
            onDeleteConversation={handleDeleteConversation}
          />
        )}

        {activeTab === 'calendar' && (
          <div className="flex-1 w-full h-full overflow-y-auto min-h-0">
            <CalendarModule />
          </div>
        )}

        {activeTab === 'ai_playground' && (
          <div className="flex-1 w-full h-full overflow-y-auto min-h-0">
            <AiPlaygroundModule
              config={aiConfig}
              personas={aiPersonas}
              knowledgeBase={knowledgeBase}
            />
          </div>
        )}

        {activeTab === 'whatsapp_coexistence' && (
          <div className="flex-1 w-full h-full overflow-y-auto min-h-0">
            <WhatsAppCoexistenceModule
              config={coexistenceConfig}
              onUpdateConfig={handleUpdateCoexistenceConfig}
              onSendSimulatorWebhook={handleSendSimulatorWebhook}
            />
          </div>
        )}

        {activeTab === 'meta_commerce' && (
          <div className="flex-1 w-full h-full overflow-y-auto min-h-0">
            <MetaCommerceModule
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          </div>
        )}

        {activeTab === 'broadcasts' && (
          <div className="flex-1 w-full h-full overflow-y-auto min-h-0">
            <BroadcastsModule
              broadcasts={broadcasts}
              templates={templates}
              onAddBroadcast={handleAddBroadcast}
              onRunBroadcast={handleRunBroadcast}
              onDeleteBroadcast={handleDeleteBroadcast}
            />
          </div>
        )}

        {activeTab === 'flow_builder' && (
          <div className="flex-1 w-full h-full overflow-y-auto min-h-0">
            <VisualFlowBuilderModule
              flows={flows}
              personas={aiPersonas}
              onAddFlow={handleAddFlow}
              onUpdateFlow={handleUpdateFlow}
              onDeleteFlow={handleDeleteFlow}
            />
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="flex-1 w-full h-full overflow-y-auto min-h-0">
            <IntegrationsModule
              integrations={integrations}
              onAddIntegration={handleAddIntegration}
              onUpdateIntegration={handleUpdateIntegration}
              onDeleteIntegration={handleDeleteIntegration}
            />
          </div>
        )}

        {activeTab === 'database' && (
          <div className="flex-1 w-full h-full overflow-y-auto min-h-0 p-6">
            <DatabaseHubModule
              contacts={contacts}
              onRefreshData={() => {
                fetch('/api/contacts')
                  .then((r) => r.json())
                  .then((d) => d.success && setContacts(d.contacts))
                  .catch(() => {});
              }}
            />
          </div>
        )}

        {activeTab === 'ai_agents' && (
          <div className="flex-1 w-full h-full overflow-y-auto min-h-0">
            <AiAgentsModule
              config={aiConfig}
              personas={aiPersonas}
              knowledgeBase={knowledgeBase}
              onUpdateConfig={(cfg) => setAiConfig((prev) => ({ ...prev, ...cfg }))}
              onUpdatePersona={handleUpdatePersona}
              onDeletePersona={handleDeletePersona}
              onUpdateKb={handleUpdateKb}
              onDeleteKb={handleDeleteKb}
            />
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="flex-1 w-full h-full overflow-y-auto min-h-0">
            <CRMModule
              contacts={contacts}
              onAddContact={handleAddContact}
              onUpdateContact={handleUpdateContact}
              onDeleteContact={handleDeleteContact}
              onStartConversation={handleStartConversation}
            />
          </div>
        )}

        {activeTab === 'automations' && (
          <div className="flex-1 w-full h-full overflow-y-auto min-h-0">
            <AutomationModule automations={automations} />
          </div>
        )}

        {activeTab === 'slas' && (
          <div className="flex-1 w-full h-full overflow-y-auto min-h-0">
            <SLAEngineModule slas={slas} />
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="flex-1 w-full h-full overflow-y-auto min-h-0">
            <TemplatesModule
              templates={templates}
              onCreateTemplate={handleCreateTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            />
          </div>
        )}

        {activeTab === 'widget_customizer' && (
          <div className="flex-1 w-full h-full overflow-y-auto min-h-0">
            <ChatWidgetCustomizer brand={brand} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="flex-1 w-full h-full overflow-y-auto min-h-0">
            <AnalyticsModule />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 w-full h-full overflow-y-auto min-h-0">
            <SettingsModule
              brand={brand}
              onUpdateBrand={handleUpdateBrand}
              auditLogs={auditLogs}
              onClearDemoData={handleClearDemoData}
              onResetDemoData={handleResetDemoData}
            />
          </div>
        )}
      </main>
    </div>
  );
}
