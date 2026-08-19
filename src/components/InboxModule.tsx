import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Sparkles,
  Zap,
  Tag,
  Clock,
  ShieldCheck,
  CheckCheck,
  Smartphone,
  Lock,
  User,
  Building,
  Globe,
  Share2,
  FileText,
  Bot,
  ChevronRight,
  AlertTriangle,
  ShoppingBag,
  ShoppingCart,
  CheckCircle2,
  Package,
  Smile,
  Mic,
  Square,
  Play,
  Pause,
  Volume2,
  Image as ImageIcon,
  Building2,
  RefreshCw,
  Users,
  Trash2,
  Calendar,
  PanelRightClose,
  PanelRightOpen,
  ExternalLink,
  CalendarCheck,
} from 'lucide-react';
import {

  Conversation,
  Message,
  Contact,
  Macro,
  WhatsAppTemplate,
  Product,
  CartItem,
} from '../types';

interface InboxModuleProps {
  conversations: Conversation[];
  activeConvId: string;
  setActiveConvId: (id: string) => void;
  messages: Message[];
  onSendMessage: (
    convId: string,
    content: string,
    isPrivateNote?: boolean,
    templateName?: string,
    productMeta?: { product: Product; action?: 'view' | 'add_to_cart' | 'order_placed' },
    orderMeta?: { orderId: string; items: CartItem[]; totalAmount: number; currency: string; status: 'pending' | 'confirmed' | 'shipped' }
  ) => void;
  macros: Macro[];
  templates: WhatsAppTemplate[];
  products?: Product[];
  onTriggerAiCopilot: (
    action: string,
    text: string,
    history: Message[]
  ) => Promise<string>;
  onUpdateConversationStatus: (id: string, status: Conversation['status']) => void;
  onDeleteConversation?: (id: string) => void;
}

export const InboxModule: React.FC<InboxModuleProps> = ({
  conversations,
  activeConvId,
  setActiveConvId,
  messages,
  onSendMessage,
  macros,
  templates,
  products = [],
  onTriggerAiCopilot,
  onUpdateConversationStatus,
  onDeleteConversation,
}) => {
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('open');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [messageInput, setMessageInput] = useState<string>('');
  const [isPrivateNote, setIsPrivateNote] = useState<boolean>(false);
  const [showMacroMenu, setShowMacroMenu] = useState<boolean>(false);
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [showCatalogPicker, setShowCatalogPicker] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // New Rich Feature States
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showMediaPicker, setShowMediaPicker] = useState<boolean>(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [audioTimer, setAudioTimer] = useState<number>(0);
  const recordingTimerRef = useRef<any>(null);

  // Zoho CRM State
  const [zohoDealStage, setZohoDealStage] = useState<string>('Qualified Lead');
  const [isZohoSyncing, setIsZohoSyncing] = useState<boolean>(false);
  const [zohoSyncMessage, setZohoSyncMessage] = useState<string | null>(null);

  // Agent Collision Detection State
  const [activeViewers, setActiveViewers] = useState<
    { agentId: string; agentName: string; avatar: string; isTyping: boolean }[]
  >([
    {
      agentId: 'agent_02',
      agentName: 'David Miller',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      isTyping: true,
    },
  ]);

  // Collapsible Contact Card Panel State
  const [isContactPanelOpen, setIsContactPanelOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('ansury_contact_panel_open');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleContactPanel = () => {
    setIsContactPanelOpen((prev) => {
      const nextVal = !prev;
      localStorage.setItem('ansury_contact_panel_open', String(nextVal));
      return nextVal;
    });
  };

  // Inline Google Calendar Booking Modal States
  const [showInlineBookingModal, setShowInlineBookingModal] = useState<boolean>(false);
  const [bookingSummary, setBookingSummary] = useState<string>('Enterprise Consultation');
  const [bookingDate, setBookingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState<string>('14:00');
  const [bookingDuration, setBookingDuration] = useState<number>(45);
  const [bookingAttendeeName, setBookingAttendeeName] = useState<string>('');
  const [bookingAttendeeEmail, setBookingAttendeeEmail] = useState<string>('');
  const [bookingAttendeePhone, setBookingAttendeePhone] = useState<string>('');
  const [bookingHostAgent, setBookingHostAgent] = useState<string>('Elena Rostova (Lead Architect)');
  const [bookingSlots, setBookingSlots] = useState<any[]>([]);
  const [loadingBookingSlots, setLoadingBookingSlots] = useState<boolean>(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);

  // Fetch slots for selected date in inline booking modal
  const fetchInlineBookingSlots = async (dateStr: string, dur: number) => {
    try {
      setLoadingBookingSlots(true);
      const res = await fetch(`/api/calendar/slots?date=${dateStr}&durationMinutes=${dur}`);
      const data = await res.json();
      if (data.success && data.slots) {
        setBookingSlots(data.slots);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBookingSlots(false);
    }
  };

  useEffect(() => {
    if (showInlineBookingModal) {
      fetchInlineBookingSlots(bookingDate, bookingDuration);
    }
  }, [showInlineBookingModal, bookingDate, bookingDuration]);

  // Confirm Inline Booking and dispatch confirmation message into thread
  const handleConfirmInlineBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv) return;
    try {
      setIsSubmittingBooking(true);
      const startDateTime = new Date(`${bookingDate}T${bookingTime}:00`).toISOString();
      const endDateTime = new Date(new Date(startDateTime).getTime() + bookingDuration * 60 * 1000).toISOString();

      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: bookingSummary,
          startTime: startDateTime,
          endTime: endDateTime,
          attendeeName: bookingAttendeeName || activeConv.contact.name,
          attendeeEmail: bookingAttendeeEmail || activeConv.contact.email,
          attendeePhone: bookingAttendeePhone || activeConv.contact.phone,
          hostAgent: bookingHostAgent,
          conversationId: activeConv.id,
          source: 'inbox_manual',
        }),
      });

      const data = await res.json();
      if (data.success && data.event) {
        setShowInlineBookingModal(false);
        const meetText = `📅 **Google Calendar Meeting Confirmed!**\n\n📌 **${data.event.summary}**\n🕒 **${new Date(data.event.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}**\n💻 **Google Meet:** [Join Video Room](${data.event.meetLink || 'https://meet.google.com'})\n👤 **Host:** ${data.event.hostAgent}\n\nA calendar invitation and Google Meet link have been synced to your email.`;
        
        onSendMessage(activeConv.id, meetText);
      }
    } catch (err) {
      console.error('Failed to book meeting from inbox:', err);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // AI Copilot, Multi-Persona & Knowledge Base RAG Grounding States


  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('persona_01');
  const [personas, setPersonas] = useState<any[]>([]);
  const [kbItems, setKbItems] = useState<any[]>([]);
  const [useKbGrounding, setUseKbGrounding] = useState<boolean>(true);
  const [aiCitations, setAiCitations] = useState<string[]>([]);
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState<boolean>(false);

  // Fetch Personas & Knowledge Base Grounding Articles
  useEffect(() => {
    fetch('/api/ai-agents/personas')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.personas) setPersonas(d.personas);
      })
      .catch(() => {});

    fetch('/api/ai-agents/kb')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.kb) setKbItems(d.kb);
      })
      .catch(() => {});
  }, []);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  // Poll Collision Presence
  useEffect(() => {
    if (!activeConv) return;
    const checkCollision = async () => {
      try {
        const res = await fetch('/api/presence/collision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: activeConv.id,
            agentId: 'agent_01',
            agentName: 'Sarah Jenkins',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
            isTyping: messageInput.length > 0,
          }),
        });
        const data = await res.json();
        if (data.success && data.activeViewers) {
          setActiveViewers(data.activeViewers.filter((a: any) => a.agentId !== 'agent_01'));
        }
      } catch (e) {
        // Fallback
      }
    };
    checkCollision();
    const interval = setInterval(checkCollision, 8000);
    return () => clearInterval(interval);
  }, [activeConv?.id, messageInput]);

  const popularEmojis = ['😊', '👍', '🔥', '🎉', '💼', '📊', '⚡', '💬', '🛍️', '✅', '❤️', '🚀', '⭐', '📞', '🙏', '🎯', '🤝', '💯'];

  const handleAddEmoji = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const startVoiceRecording = () => {
    setIsRecordingAudio(true);
    setAudioTimer(0);
    recordingTimerRef.current = setInterval(() => {
      setAudioTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopAndSendVoiceNote = () => {
    if (!activeConv) return;
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecordingAudio(false);

    const text = `🎙️ Audio Voice Note (${audioTimer}s)`;
    onSendMessage(
      activeConv.id,
      text,
      isPrivateNote,
      undefined,
      undefined,
      undefined
    );
    setAudioTimer(0);
  };

  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecordingAudio(false);
    setAudioTimer(0);
  };

  const handleSelectMediaFile = (type: 'image' | 'file' | 'audio' | 'video') => {
    if (!activeConv) return;
    let url = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80';
    let name = 'ansury_enterprise_proposal.png';

    if (type === 'file') {
      url = 'https://ansury.com/docs/ansury_sla_agreement_2026.pdf';
      name = 'ansury_sla_agreement_2026.pdf';
    } else if (type === 'audio') {
      url = 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg';
      name = 'voice_message_recording.ogg';
    } else if (type === 'video') {
      url = 'https://www.w3schools.com/html/mov_bbb.mp4';
      name = 'product_demo_preview.mp4';
    }

    const contentStr = `📎 Attached ${type.toUpperCase()}: ${name}`;
    
    // Send message with attachments
    fetch(`/api/conversations/${activeConv.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: contentStr,
        senderType: 'agent',
        senderName: 'Sarah Jenkins',
        isPrivateNote,
        channel: activeConv.channel,
        attachments: [{ type, url, name, size: '2.4 MB' }],
      }),
    })
      .then((r) => r.json())
      .then(() => {
        onSendMessage(activeConv.id, contentStr, isPrivateNote);
        setShowMediaPicker(false);
      });
  };

  const handleZohoSync = async () => {
    if (!activeConv) return;
    setIsZohoSyncing(true);
    setZohoSyncMessage(null);

    try {
      const res = await fetch('/api/integrations/zoho/sync-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: activeConv.contact.id,
          conversationId: activeConv.id,
          dealStage: zohoDealStage,
          tags: ['Zoho Synced', zohoDealStage],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setZohoSyncMessage(`Synced! Deal ID: ${data.zohoRecordId}`);
      }
    } catch (e) {
      setZohoSyncMessage('Zoho sync error');
    } finally {
      setIsZohoSyncing(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesChannel =
      filterChannel === 'all' || c.channel === filterChannel;
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesSearch =
      c.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesStatus && matchesSearch;
  });

  const handleSend = () => {
    if (!messageInput.trim() || !activeConv) return;
    onSendMessage(activeConv.id, messageInput.trim(), isPrivateNote);
    setMessageInput('');
    setAiSuggestion(null);
  };

  const handleSendProductCard = (product: Product) => {
    if (!activeConv) return;
    const text = `🛍️ Meta Catalog Product Card: ${product.name} - $${product.price.toFixed(2)}`;
    onSendMessage(
      activeConv.id,
      text,
      false,
      undefined,
      { product, action: 'view' }
    );
    setShowCatalogPicker(false);
  };

  const handlePlaceOrder = (product: Product) => {
    if (!activeConv) return;
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const items: CartItem[] = [{ product, quantity: 1 }];
    const totalAmount = product.price;

    const text = `🎉 Order Confirmed #${orderId}: 1x ${product.name} ($${totalAmount.toFixed(2)} USD). Ready for fulfillment.`;
    onSendMessage(
      activeConv.id,
      text,
      false,
      undefined,
      undefined,
      {
        orderId,
        items,
        totalAmount,
        currency: 'USD',
        status: 'confirmed',
      }
    );
  };

  const handleApplyMacro = (macro: Macro) => {
    setMessageInput(macro.content);
    setShowMacroMenu(false);
  };

  const handleSendTemplate = (tpl: WhatsAppTemplate) => {
    if (!activeConv) return;
    const templateText = `[WhatsApp Template: ${tpl.name}] ${tpl.bodyText}`;
    onSendMessage(activeConv.id, templateText, false, tpl.name);
    setShowTemplateModal(false);
  };

  const handleAiCopilotAction = async (action: string) => {
    if (!activeConv) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          text: messageInput || activeConv.lastMessage,
          conversationHistory: messages,
          personaId: selectedPersonaId,
          useKbGrounding,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setAiSuggestion(data.result);
        if (data.citations) setAiCitations(data.citations);
        if (action !== 'summarize') {
          setMessageInput(data.result);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAnalyzeSentiment = async () => {
    if (!activeConv) return;
    setIsAnalyzingSentiment(true);
    try {
      const res = await fetch(`/api/conversations/${activeConv.id}/analyze-sentiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success && data.conversation) {
        activeConv.sentiment = data.conversation.sentiment;
        activeConv.leadScore = data.conversation.leadScore;
        activeConv.intentLabel = data.conversation.intentLabel;
        activeConv.aiAnalysisReason = data.conversation.aiAnalysisReason;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingSentiment(false);
    }
  };

  return (
    <div className="flex flex-1 h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* COLUMN 1: Conversation List & Filters */}
      <div className="w-80 border-r border-slate-800 bg-slate-900 flex flex-col shrink-0">
        {/* Search & Main Filter Controls */}
        <div className="p-3 border-b border-slate-800 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search chats, contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 text-xs text-slate-200 placeholder-slate-500 pl-9 pr-3 py-2 rounded-lg border border-slate-700/60 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            {['open', 'pending', 'snoozed', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium whitespace-nowrap transition-all ${
                  filterStatus === st
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="font-medium text-slate-300">
              {filteredConversations.length} Conversations
            </span>
            <div className="flex items-center space-x-1">
              <Filter className="w-3 h-3 text-slate-500" />
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value)}
                className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-[11px]"
              >
                <option value="all">All Inboxes & Channels</option>
                <option value="whatsapp">WhatsApp Coexistence</option>
                <option value="livechat">Ansury Live Chat</option>
                <option value="email">VIP Email</option>
                <option value="instagram">Instagram Direct</option>
                <option value="messenger">Facebook Messenger</option>
                <option value="telegram">Telegram Bot</option>
                <option value="line">LINE Official</option>
                <option value="sms">Twilio SMS</option>
              </select>
            </div>
          </div>
        </div>

        {/* Conversation Items Stream */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === activeConvId;
            return (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`p-3 cursor-pointer transition-all hover:bg-slate-800/40 relative ${
                  isSelected ? 'bg-slate-800/80 border-l-4 border-teal-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={conv.contact.avatar}
                        alt={conv.contact.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700"
                      />
                      {conv.channel === 'whatsapp' && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-0.5 rounded-full text-slate-950" title="WhatsApp">
                          <Smartphone className="w-2.5 h-2.5" />
                        </div>
                      )}
                      {conv.channel === 'instagram' && (
                        <div className="absolute -bottom-1 -right-1 bg-pink-500 p-0.5 rounded-full text-white" title="Instagram Direct">
                          <Share2 className="w-2.5 h-2.5" />
                        </div>
                      )}
                      {conv.channel === 'telegram' && (
                        <div className="absolute -bottom-1 -right-1 bg-sky-500 p-0.5 rounded-full text-white" title="Telegram">
                          <Send className="w-2.5 h-2.5" />
                        </div>
                      )}
                      {conv.channel === 'messenger' && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-600 p-0.5 rounded-full text-white" title="Facebook Messenger">
                          <MessageSquare className="w-2.5 h-2.5" />
                        </div>
                      )}
                      {conv.channel === 'email' && (
                        <div className="absolute -bottom-1 -right-1 bg-indigo-500 p-0.5 rounded-full text-white" title="VIP Email">
                          <FileText className="w-2.5 h-2.5" />
                        </div>
                      )}
                      {conv.channel === 'sms' && (
                        <div className="absolute -bottom-1 -right-1 bg-amber-500 p-0.5 rounded-full text-slate-950" title="Twilio SMS">
                          <Smartphone className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1">
                        {conv.contact.name}
                        {conv.coexistenceSynced && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" title="Meta Coexistence Active" />
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {conv.contact.company || conv.inboxName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500">
                      {conv.lastMessageTimestamp}
                    </span>
                    {conv.unreadCount > 0 && (
                      <div className="bg-teal-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full mt-1 ml-auto w-max">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 truncate line-clamp-1 mb-1.5">
                  {conv.lastMessage}
                </p>

                {/* Autonomous Lead Scoring & Real-Time Sentiment Badges */}
                {conv.intentLabel && (
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {conv.intentLabel}
                    </span>
                    {typeof conv.leadScore === 'number' && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        Score {conv.leadScore}/100
                      </span>
                    )}
                  </div>
                )}

                {/* Badges: SLA countdown & Coexistence Status */}
                <div className="flex items-center justify-between text-[10px]">
                  <span
                    className={`px-1.5 py-0.5 rounded font-medium flex items-center gap-1 ${
                      conv.slaStatus === 'warning'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : conv.slaStatus === 'breached'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    SLA: {conv.slaDueInMinutes}m left
                  </span>

                  {conv.channel === 'whatsapp' && (
                    <span className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40 text-[9px] font-semibold">
                      Coexistence Synced
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COLUMN 2: Main Active Chat Thread & Rich Composer */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-slate-950 min-w-0">
          {/* Active Chat Header */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <img
                src={activeConv.contact.avatar}
                alt={activeConv.contact.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/30"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-slate-100 text-sm">
                    {activeConv.contact.name}
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                    activeConv.channel === 'instagram'
                      ? 'bg-gradient-to-r from-purple-900 via-pink-900 to-rose-900 text-pink-200 border-pink-700/50'
                      : activeConv.channel === 'messenger'
                      ? 'bg-blue-950 text-blue-300 border-blue-800'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {activeConv.channel === 'instagram' ? '📷 Instagram DM' : activeConv.channel === 'messenger' ? '⚡ FB Messenger' : activeConv.channel.toUpperCase()}
                  </span>
                  {activeConv.coexistenceSynced && (
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                      <Smartphone className="w-3 h-3" />
                      Meta Dual Coexistence
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {activeConv.contact.phone} • {activeConv.contact.email}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Co-Agents Live Presence (Agent Collision Detection) */}
              {activeViewers.length > 0 && (
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-200 text-xs">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-semibold hidden sm:inline">Active Co-Agents:</span>
                  <div className="flex -space-x-1">
                    {activeViewers.map((viewer) => (
                      <div key={viewer.agentId} className="relative group">
                        <img
                          src={viewer.avatar}
                          alt={viewer.agentName}
                          className="w-6 h-6 rounded-full object-cover ring-2 ring-amber-500"
                          title={`${viewer.agentName} ${viewer.isTyping ? '(Typing...)' : '(Viewing)'}`}
                        />
                        {viewer.isTyping && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <select
                value={activeConv.status}
                onChange={(e) =>
                  onUpdateConversationStatus(
                    activeConv.id,
                    e.target.value as Conversation['status']
                  )
                }
                className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="snoozed">Snoozed</option>
                <option value="resolved">Resolved</option>
              </select>

              {/* Book Meeting Action Button */}
              <button
                onClick={() => {
                  setBookingSummary(`Consultation with ${activeConv.contact.name}`);
                  setBookingAttendeeName(activeConv.contact.name);
                  setBookingAttendeeEmail(activeConv.contact.email || '');
                  setBookingAttendeePhone(activeConv.contact.phone || '');
                  setShowInlineBookingModal(true);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20 transition-all"
                title="Book Google Calendar Meeting with Customer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Book Meeting</span>
              </button>

              <button
                onClick={handleAnalyzeSentiment}
                disabled={isAnalyzingSentiment}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/40 hover:bg-amber-500/30 transition-all disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 text-amber-400 ${isAnalyzingSentiment ? 'animate-spin' : ''}`} />
                <span>{isAnalyzingSentiment ? 'Analyzing...' : 'AI Audit'}</span>
              </button>

              <button
                onClick={() => handleAiCopilotAction('summarize')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-600/20 text-teal-300 text-xs font-semibold border border-teal-500/40 hover:bg-teal-600/30 transition-all hidden md:flex"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Summary</span>
              </button>

              {/* Collapsible Contact 360 Toggle Button */}
              <button
                onClick={toggleContactPanel}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isContactPanelOpen
                    ? 'bg-slate-800 border-slate-700 text-teal-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={isContactPanelOpen ? 'Collapse Contact Profile Panel (Expand Chat)' : 'Expand Contact Profile Panel'}
              >
                {isContactPanelOpen ? (
                  <PanelRightClose className="w-4 h-4 text-teal-400" />
                ) : (
                  <PanelRightOpen className="w-4 h-4 text-teal-400" />
                )}
                <span className="hidden lg:inline">{isContactPanelOpen ? 'Hide 360°' : 'Show 360°'}</span>
              </button>

              {onDeleteConversation && (
                <button
                  onClick={() => {
                    if (confirm(`Delete conversation with ${activeConv.contact.name}?`)) {
                      onDeleteConversation(activeConv.id);
                    }
                  }}
                  title="Delete Conversation Thread"
                  className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-800/40 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

            </div>
          </div>

          {/* Agent Collision Warning Banner */}
          {activeViewers.some((v) => v.isTyping) && (
            <div className="mx-3 mt-3 px-3.5 py-2 rounded-xl bg-amber-950/80 border border-amber-700/80 text-amber-200 text-xs flex items-center justify-between shadow-lg animate-pulse">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Agent Collision Warning:</strong> {activeViewers.map((v) => v.agentName).join(', ')} is currently inspecting this conversation and typing a response.
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded border border-amber-600/40 shrink-0">
                Live Lock Active
              </span>
            </div>
          )}

          {/* Autonomous Lead Scoring & Sentiment Summary Bar */}
          {activeConv.intentLabel && (
            <div className="mx-3 mt-3 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {activeConv.intentLabel}
                </span>
                {typeof activeConv.leadScore === 'number' && (
                  <span className="font-mono font-bold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    Lead Score: {activeConv.leadScore}/100
                  </span>
                )}
                <span className="text-slate-400 text-[11px] hidden md:inline">
                  {activeConv.aiAnalysisReason}
                </span>
              </div>
            </div>
          )}

          {/* AI Copilot Suggestion Box */}
          {aiSuggestion && (
            <div className="m-3 p-3 rounded-lg bg-teal-950/80 border border-teal-800 text-xs relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-teal-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Ansury AI Copilot Intelligence
                </span>
                <button
                  onClick={() => setAiSuggestion(null)}
                  className="text-slate-400 hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              </div>
              <p className="text-slate-200 leading-relaxed whitespace-pre-line mb-2">
                {aiSuggestion}
              </p>
              {aiCitations.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1.5 border-t border-teal-800/80 text-[10px] text-teal-300 flex-wrap">
                  <span className="font-semibold text-teal-400">Grounded Citations:</span>
                  {aiCitations.map((cite, idx) => (
                    <span key={idx} className="bg-teal-900/60 text-teal-200 px-1.5 py-0.5 rounded border border-teal-700/60">
                      📄 {cite}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isUser = msg.senderType === 'user';
              const isPrivate = msg.isPrivateNote;

              if (isPrivate) {
                return (
                  <div
                    key={msg.id}
                    className="mx-auto max-w-lg p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1 text-[11px] font-semibold text-amber-400">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Internal Agent Note by{' '}
                        {msg.senderName}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-md rounded-xl p-3 text-xs leading-relaxed shadow-md ${
                      isUser
                        ? 'bg-slate-800 text-slate-100 border border-slate-700/80'
                        : 'bg-teal-700 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1 opacity-80 text-[10px]">
                      <span className="font-medium">{msg.senderName}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Rich Meta Commerce Product Card Attachment */}
                    {msg.productMeta && (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 shadow-lg">
                        <div className="flex gap-3">
                          <img
                            src={msg.productMeta.product.imageUrl}
                            alt={msg.productMeta.product.name}
                            className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-700"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-white truncate">
                              {msg.productMeta.product.name}
                            </h4>
                            <p className="text-[11px] text-emerald-400 font-extrabold font-mono mt-0.5">
                              ${msg.productMeta.product.price.toFixed(2)} USD
                            </p>
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                              {msg.productMeta.product.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[9px] font-mono text-slate-400 uppercase">
                            SKU: {msg.productMeta.product.sku}
                          </span>
                          <button
                            onClick={() => handlePlaceOrder(msg.productMeta!.product)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-md transition-all"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            Buy Now / Order in Chat
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Rich Order Confirmation Card */}
                    {msg.orderMeta && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-100 shadow-xl">
                        <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2 mb-2">
                          <span className="text-[10px] font-bold uppercase text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Order Confirmed #{msg.orderMeta.orderId}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                            {msg.orderMeta.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs">
                          {msg.orderMeta.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-[11px]">
                              <span className="text-emerald-200">
                                {it.quantity}x {it.product.name}
                              </span>
                              <span className="font-mono text-emerald-400 font-bold">
                                ${(it.product.price * it.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-2 pt-2 border-t border-emerald-800/80 flex justify-between items-center text-xs font-bold">
                          <span>Total Paid:</span>
                          <span className="text-emerald-300 font-mono text-sm">
                            ${msg.orderMeta.totalAmount.toFixed(2)} {msg.orderMeta.currency}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Meta Coexistence Telemetry Badge */}
                    {msg.whatsappMeta && (
                      <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] text-emerald-200/90 font-medium">
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-2.5 h-2.5" />
                          {msg.whatsappMeta.sourceApp}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCheck className="w-3 h-3 text-emerald-300" />
                          Synced
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Composer & Action Controls */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/90 shrink-0 space-y-2">
            {/* Multi-Persona & Knowledge Base RAG Control Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-teal-400 flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-teal-400" />
                  Active Persona:
                </span>
                <select
                  value={selectedPersonaId}
                  onChange={(e) => setSelectedPersonaId(e.target.value)}
                  className="bg-slate-900 text-slate-200 border border-slate-700/80 rounded-lg px-2 py-1 focus:outline-none text-xs"
                >
                  {personas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.tone})
                    </option>
                  ))}
                  {personas.length === 0 && (
                    <option value="persona_01">Sales SDR Bot (Consultative)</option>
                  )}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setUseKbGrounding(!useKbGrounding)}
                  className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all text-xs border ${
                    useKbGrounding
                      ? 'bg-teal-950 text-teal-300 border-teal-700'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Enable Knowledge Base RAG Grounding"
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${useKbGrounding ? 'text-teal-400' : 'text-slate-500'}`} />
                  <span>{useKbGrounding ? `RAG Grounding (${kbItems.length} Docs)` : 'Grounding Off'}</span>
                </button>
              </div>
            </div>

            {/* Toolbar row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPrivateNote(!isPrivateNote)}
                  className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                    isPrivateNote
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  {isPrivateNote ? 'Private Note Active' : 'Private Note'}
                </button>

                <button
                  onClick={() => setShowMacroMenu(!showMacroMenu)}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  Macros
                </button>

                <button
                  onClick={() => setShowCatalogPicker(!showCatalogPicker)}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 flex items-center gap-1"
                >
                  <ShoppingBag className="w-3 h-3 text-emerald-400" />
                  Send Product Card
                </button>

                {activeConv.channel === 'whatsapp' && (
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 text-xs font-medium border border-emerald-800/60 hover:bg-emerald-900 flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    Meta Templates
                  </button>
                )}
              </div>

              {/* AI Rephrase & Draft Buttons */}
              <div className="flex items-center space-x-1">
                <button
                  disabled={aiLoading}
                  onClick={() => handleAiCopilotAction('draft_reply')}
                  className="px-2 py-1 rounded bg-teal-950 text-teal-300 text-xs hover:bg-teal-900 border border-teal-800/60 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-teal-400" />
                  AI Draft
                </button>
                <button
                  disabled={aiLoading || !messageInput}
                  onClick={() => handleAiCopilotAction('rephrase')}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 flex items-center gap-1 disabled:opacity-50"
                >
                  Polish Reply
                </button>
              </div>
            </div>

            {/* Macro Dropdown Menu */}
            {showMacroMenu && (
              <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 shadow-xl max-h-48 overflow-y-auto space-y-1">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-2 py-0.5">
                  Insert Quick Macro
                </p>
                {macros.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleApplyMacro(m)}
                    className="w-full text-left p-2 rounded hover:bg-slate-700/80 text-xs"
                  >
                    <span className="font-semibold text-teal-300 mr-2">
                      {m.shortcut}
                    </span>
                    <span className="text-slate-300">{m.title}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Product Catalog Picker Popover */}
            {showCatalogPicker && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl max-h-60 overflow-y-auto space-y-2">
                <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 px-1 flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3" /> Select Product from Meta Catalog
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {products.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => handleSendProductCard(prod)}
                      className="text-left p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center gap-2 transition-all group"
                    >
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-10 h-10 rounded-md object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs text-white truncate group-hover:text-emerald-300">
                          {prod.name}
                        </div>
                        <div className="text-[11px] text-emerald-400 font-bold font-mono">
                          ${prod.price.toFixed(2)} USD
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Emoji Quick Picker Popover */}
            {showEmojiPicker && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl">
                <p className="text-[10px] uppercase font-bold text-amber-400 mb-2 flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-amber-400" /> Choose Emoji Accent
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleAddEmoji(emoji)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-base transition-all scale-100 hover:scale-125"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Multi-Media Attachment Popover */}
            {showMediaPicker && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl space-y-2">
                <p className="text-[10px] uppercase font-bold text-teal-400 flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5 text-teal-400" /> Send Multi-Media & Attachments
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleSelectMediaFile('image')}
                    className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4 text-pink-400" />
                    <span>Image / Graphic</span>
                  </button>
                  <button
                    onClick={() => handleSelectMediaFile('file')}
                    className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>PDF / SLA Document</span>
                  </button>
                  <button
                    onClick={() => handleSelectMediaFile('audio')}
                    className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 flex items-center gap-2"
                  >
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>Audio / Voice Track</span>
                  </button>
                  <button
                    onClick={() => handleSelectMediaFile('video')}
                    className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 flex items-center gap-2"
                  >
                    <Video className="w-4 h-4 text-emerald-400" />
                    <span>Video Recording</span>
                  </button>
                </div>
              </div>
            )}

            {/* Live Audio Recording UI Bar OR Standard Textarea */}
            {isRecordingAudio ? (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-between shadow-2xl animate-pulse">
                <div className="flex items-center space-x-3">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-mono font-bold text-rose-200 text-xs">
                    Recording Voice Note: 00:{audioTimer < 10 ? `0${audioTimer}` : audioTimer}
                  </span>
                  <div className="flex items-center space-x-0.5">
                    {[16, 24, 12, 32, 20, 28, 14, 30].map((h, idx) => (
                      <span
                        key={idx}
                        className="w-1 bg-rose-400 rounded-full animate-bounce"
                        style={{ height: `${h}px`, animationDelay: `${idx * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={cancelVoiceRecording}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Discard
                  </button>
                  <button
                    onClick={stopAndSendVoiceNote}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Voice Note
                  </button>
                </div>
              </div>
            ) : (
              /* Input textarea & toolbar icons */
              <div className="relative flex items-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2.5 rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400 transition-all shrink-0"
                  title="Emoji Picker"
                >
                  <Smile className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowMediaPicker(!showMediaPicker)}
                  className="p-2.5 rounded-lg bg-slate-800 text-slate-400 hover:text-teal-400 transition-all shrink-0"
                  title="Send Attachments"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className="p-2.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition-all shrink-0"
                  title="Record Voice Note"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <textarea
                  rows={2}
                  placeholder={
                    isPrivateNote
                      ? 'Write an internal private note for team members...'
                      : 'Type a message, insert emojis, or use /for macros...'
                  }
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className={`flex-1 bg-slate-800 text-xs text-slate-100 placeholder-slate-500 p-2.5 rounded-lg border focus:outline-none resize-none ${
                    isPrivateNote
                      ? 'border-amber-500/80 bg-amber-950/20'
                      : 'border-slate-700 focus:border-teal-500'
                  }`}
                />

                <button
                  onClick={handleSend}
                  className="p-3 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-all shadow-md shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          Select a conversation
        </div>
      )}

      {/* COLUMN 3: Contact CRM & Meta Coexistence Attributes Sidebar */}
      {activeConv && isContactPanelOpen && (
        <div className="w-72 border-l border-slate-800 bg-slate-900 overflow-y-auto p-4 shrink-0 space-y-5 text-xs transition-all animate-in slide-in-from-right duration-200">
          {/* Panel Header with Collapse Toggle */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-400" />
              360° Contact Profile
            </span>
            <button
              onClick={toggleContactPanel}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
              title="Collapse Contact Panel"
            >
              <PanelRightClose className="w-4 h-4 text-teal-400" />
            </button>
          </div>

          {/* Profile overview */}
          <div className="text-center pb-3 border-b border-slate-800">

            <img
              src={activeConv.contact.avatar}
              alt={activeConv.contact.name}
              className="w-16 h-16 rounded-full object-cover mx-auto ring-2 ring-teal-500/40 mb-2"
            />
            <h3 className="font-bold text-slate-100 text-sm">
              {activeConv.contact.name}
            </h3>
            <p className="text-slate-400 text-[11px]">
              {activeConv.contact.company || 'Enterprise Client'}
            </p>
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {activeConv.contact.tags.map((t) => (
                <span
                  key={t}
                  className="bg-slate-800 text-teal-300 text-[10px] px-2 py-0.5 rounded-full border border-slate-700"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* WhatsApp Coexistence Status Card */}
          {activeConv.contact.waBusinessProfile && (
            <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-800/60 space-y-1.5">
              <div className="flex items-center justify-between text-emerald-300 font-semibold text-[11px]">
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  Meta WhatsApp Business
                </span>
                <span className="text-[9px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                  COEXISTENCE
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Account: {activeConv.contact.waBusinessProfile.verifiedName}
              </p>
              <p className="text-slate-400 text-[10px]">
                Last App Sync: {activeConv.contact.waBusinessProfile.lastAppSync}
              </p>
            </div>
          )}

          {/* Custom Attributes */}
          <div>
            <h4 className="font-semibold text-slate-300 mb-2 uppercase text-[10px] tracking-wider">
              Custom Attributes
            </h4>
            <div className="space-y-2 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              {Object.entries(activeConv.contact.customAttributes).map(
                ([k, v]) => (
                  <div key={k} className="flex justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">{k}:</span>
                    <span className="text-slate-200 font-semibold">{v}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Zoho CRM Connector Section */}
          <div>
            <h4 className="font-semibold text-slate-300 mb-2 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              Zoho CRM Enterprise Sync
            </h4>
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                  Zoho Sales Deal Stage
                </label>
                <select
                  value={zohoDealStage}
                  onChange={(e) => setZohoDealStage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-amber-300 focus:outline-none"
                >
                  <option value="Unqualified Lead">Unqualified Lead</option>
                  <option value="Qualified Lead">Qualified Lead</option>
                  <option value="Demo Scheduled">Demo Scheduled</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                </select>
              </div>

              <button
                onClick={handleZohoSync}
                disabled={isZohoSyncing}
                className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isZohoSyncing ? 'animate-spin' : ''}`} />
                {isZohoSyncing ? 'Syncing to Zoho...' : 'Sync & Log Transcript to Zoho'}
              </button>

              {zohoSyncMessage && (
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-300">
                  {zohoSyncMessage}
                </div>
              )}
            </div>
          </div>

          {/* SLA Tracking */}
          <div>
            <h4 className="font-semibold text-slate-300 mb-2 uppercase text-[10px] tracking-wider">
              SLA Policy Compliance
            </h4>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Team:</span>
                <span className="text-slate-200 font-medium">
                  {activeConv.teamName || 'Enterprise Escalations'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Due In:</span>
                <span className="text-amber-400 font-bold">
                  {activeConv.slaDueInMinutes} minutes
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Select Meta WhatsApp Template */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Select Approved WhatsApp Template
              </h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-3 rounded-lg bg-slate-800/70 border border-slate-700 hover:border-emerald-500/50 transition-all space-y-2 cursor-pointer"
                  onClick={() => handleSendTemplate(tpl)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-300 text-xs">
                      {tpl.name}
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold">
                      {tpl.status}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {tpl.bodyText}
                  </p>
                  {tpl.buttons && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {tpl.buttons.map((btn, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-700 text-slate-200 px-2 py-0.5 rounded border border-slate-600"
                        >
                          🔘 {btn.text}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Inline Google Calendar Meeting Scheduling */}
      {showInlineBookingModal && activeConv && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-400" />
                Schedule Google Calendar Meeting with {activeConv.contact.name}
              </h3>
              <button
                onClick={() => setShowInlineBookingModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmInlineBooking} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Meeting Topic / Title *
                </label>
                <input
                  type="text"
                  required
                  value={bookingSummary}
                  onChange={(e) => setBookingSummary(e.target.value)}
                  placeholder="e.g. Ansury Enterprise Coexistence Walkthrough"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-teal-300 font-semibold focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Duration
                  </label>
                  <select
                    value={bookingDuration}
                    onChange={(e) => setBookingDuration(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes (Recommended)</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Slot Availability Quick Select */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-300">
                    Select Available Start Time Slot *
                  </label>
                  <span className="text-[10px] text-slate-500">Live Conflict Checked</span>
                </div>

                {loadingBookingSlots ? (
                  <div className="p-3 text-center text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                    <span>Checking open slots...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                    {bookingSlots.map((slot, idx) => {
                      const isSelected = bookingTime === slot.time;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setBookingTime(slot.time)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-mono font-bold transition-all ${
                            isSelected
                              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                              : slot.available
                              ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800'
                              : 'bg-rose-950/30 text-rose-500/60 line-through cursor-not-allowed border border-rose-900/20'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-300">
                  <Video className="w-4 h-4 text-teal-400" />
                  <span>Google Meet Video Call Link</span>
                </div>
                <span className="text-[10px] bg-teal-500 text-slate-950 font-bold px-2 py-0.5 rounded">
                  AUTO-SYNC
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={bookingAttendeeEmail}
                    onChange={(e) => setBookingAttendeeEmail(e.target.value)}
                    placeholder="alex@techflow.io"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Host Agent
                  </label>
                  <select
                    value={bookingHostAgent}
                    onChange={(e) => setBookingHostAgent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value="Elena Rostova (Lead Architect)">Elena Rostova (Lead Architect)</option>
                    <option value="Marcus Vance (Enterprise SDR)">Marcus Vance (Enterprise SDR)</option>
                    <option value="David Miller (Support Lead)">David Miller (Support Lead)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInlineBookingModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg shadow-teal-500/20"
                >
                  {isSubmittingBooking ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CalendarCheck className="w-3.5 h-3.5" />
                  )}
                  {isSubmittingBooking ? 'Scheduling...' : 'Schedule & Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

