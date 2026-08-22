import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  User,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Link,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Sparkles,
  CalendarCheck,
  CalendarX,
  MapPin,
  Bot,
  Zap,
  Check,
  Trash2,
} from 'lucide-react';
import { CalendarEvent, BookingSlot } from '../types';

interface CalendarModuleProps {
  onScheduleSuccess?: (event: CalendarEvent) => void;
}

export const CalendarModule: React.FC<CalendarModuleProps> = ({ onScheduleSuccess }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [googleAccount, setGoogleAccount] = useState<string>('Ansury Workspace Sync');
  const [viewMode, setViewMode] = useState<'agenda' | 'week' | 'slots'>('agenda');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ai_booking_agent' | 'google_calendar' | 'inbox_manual'>('all');

  // New Event Modal State
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState<boolean>(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<CalendarEvent | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Form State
  const [summary, setSummary] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('14:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [attendeeName, setAttendeeName] = useState<string>('');
  const [attendeeEmail, setAttendeeEmail] = useState<string>('');
  const [attendeePhone, setAttendeePhone] = useState<string>('');
  const [hostAgent, setHostAgent] = useState<string>('Elena Rostova (Lead Architect)');
  const [colorTag, setColorTag] = useState<'teal' | 'emerald' | 'blue' | 'purple' | 'amber' | 'rose'>('teal');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Available Slots State
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/calendar/events');
      const data = await res.json();
      if (data.success && data.events) {
        setEvents(data.events);
        setIsGoogleConnected(data.connected);
        if (data.googleAccount) setGoogleAccount(data.googleAccount);
      }
    } catch (err) {
      console.error('Failed to fetch calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllEvents = async () => {
    if (!window.confirm('Are you sure you want to clear all appointments from your calendar view?')) return;
    try {
      setLoading(true);
      const res = await fetch('/api/calendar/clear-events', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setEvents([]);
      }
    } catch (err) {
      console.error('Failed to clear events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLiveSync = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/calendar/sync-live', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.events) {
        setEvents(data.events);
        setIsGoogleConnected(data.connected);
      }
    } catch (err) {
      console.error('Live sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (dateStr: string) => {
    try {
      setLoadingSlots(true);
      const res = await fetch(`/api/calendar/slots?date=${dateStr}&durationMinutes=${durationMinutes}`);
      const data = await res.json();
      if (data.success && data.slots) {
        setAvailableSlots(data.slots);
      }
    } catch (err) {
      console.error('Failed to fetch calendar slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (viewMode === 'slots') {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, durationMinutes, viewMode]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary || !startDate || !startTime) return;

    try {
      setIsSubmitting(true);
      const startDateTime = new Date(`${startDate}T${startTime}:00`).toISOString();
      const endDateTime = new Date(new Date(startDateTime).getTime() + durationMinutes * 60 * 1000).toISOString();

      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          description,
          startTime: startDateTime,
          endTime: endDateTime,
          attendeeName,
          attendeeEmail,
          attendeePhone,
          hostAgent,
          colorTag,
          source: 'inbox_manual',
        }),
      });

      const data = await res.json();
      if (data.success && data.event) {
        setEvents((prev) => [data.event, ...prev]);
        setIsNewEventModalOpen(false);
        resetForm();
        if (onScheduleSuccess) onScheduleSuccess(data.event);
      }
    } catch (err) {
      console.error('Failed to create calendar event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/calendar/events/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
        setSelectedEventDetails(null);
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const resetForm = () => {
    setSummary('');
    setDescription('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setStartTime('14:00');
    setDurationMinutes(45);
    setAttendeeName('');
    setAttendeeEmail('');
    setAttendeePhone('');
    setColorTag('teal');
  };

  const handleCopyMeetLink = (linkStr: string) => {
    navigator.clipboard.writeText(linkStr);
    setCopiedLink(linkStr);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleSelectSlotForBooking = (slot: BookingSlot) => {
    const d = new Date(slot.isoString);
    const dateStr = d.toISOString().split('T')[0];
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const timeStr = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;

    setStartDate(dateStr);
    setStartTime(timeStr);
    setSummary('Enterprise Solution Consultation');
    setIsNewEventModalOpen(true);
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.attendeeName && evt.attendeeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (evt.attendeeEmail && evt.attendeeEmail.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      selectedFilter === 'all' ? true : evt.source === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const getEventBadgeColor = (color?: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'blue':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'purple':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'amber':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'rose':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      default:
        return 'bg-teal-500/10 text-teal-300 border-teal-500/30';
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-6 overflow-y-auto min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              Google Workspace Live Sync
            </span>
            {isGoogleConnected ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> OAuth Connected ({googleAccount})
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Local Sync Mode (OAuth Ready)
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Google Calendar & Autonomous AI Booking
          </h1>
          <p className="text-sm text-slate-400">
            Real-time meeting agenda, conflict detection, Google Meet generation, and AI agent appointment scheduling.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleLiveSync}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Live Google Calendar Sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-400' : 'text-slate-400'}`} />
            <span>Sync Google</span>
          </button>

          {events.length > 0 && (
            <button
              onClick={handleClearAllEvents}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-rose-900/40 hover:bg-rose-950/40 text-rose-300 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Clear all appointments from current list"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear All</span>
            </button>
          )}

          <button
            onClick={() => {
              resetForm();
              setIsNewEventModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">{events.length}</div>
            <div className="text-xs text-slate-400">Total Confirmed Events</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">
              {events.filter((e) => e.source === 'ai_booking_agent').length}
            </div>
            <div className="text-xs text-slate-400">AI Autonomous Bookings</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">
              {events.filter((e) => e.meetLink).length}
            </div>
            <div className="text-xs text-slate-400">Google Meet Video Calls</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">0 Conflict</div>
            <div className="text-xs text-slate-400">Autonomous Conflict Guard</div>
          </div>
        </div>
      </div>

      {/* Main Filter & View Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'agenda' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Agenda List ({filteredEvents.length})
            </button>
            <button
              onClick={() => setViewMode('slots')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'slots' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Slot Availability Grid
            </button>
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All Sources' },
              { id: 'ai_booking_agent', label: 'AI Agent' },
              { id: 'inbox_manual', label: 'Inbox Trigger' },
              { id: 'google_calendar', label: 'Google Sync' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedFilter === f.id
                    ? 'bg-slate-800 border-teal-500/50 text-teal-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search meetings, attendees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* VIEW 1: AGENDA LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="space-y-3">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mb-3" />
              <p className="text-sm font-medium">Syncing Google Calendar agenda...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
              <CalendarX className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-200">No scheduled meetings found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
                Schedule a meeting manually or trigger an AI Agent to autonomously book calendar slots during live customer conversations.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleLiveSync}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                  Sync from Google
                </button>
                <button
                  onClick={() => setIsNewEventModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-bold"
                >
                  Schedule First Meeting
                </button>
              </div>
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const startD = new Date(evt.startTime);
              const endD = new Date(evt.endTime);
              const isPast = endD.getTime() < Date.now();

              return (
                <div
                  key={evt.id}
                  className={`p-4 rounded-2xl border bg-slate-900/90 transition-all hover:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isPast ? 'opacity-70 border-slate-800/60' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Date Block */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center shrink-0 w-16">
                      <div className="text-[10px] uppercase font-bold text-teal-400">
                        {startD.toLocaleDateString([], { month: 'short' })}
                      </div>
                      <div className="text-xl font-bold font-mono text-white">
                        {startD.getDate()}
                      </div>
                      <div className="text-[9px] text-slate-500 uppercase">
                        {startD.toLocaleDateString([], { weekday: 'short' })}
                      </div>
                    </div>

                    {/* Main Event Info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white hover:text-teal-300 transition-colors">
                          {evt.summary}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getEventBadgeColor(evt.colorTag)}`}>
                          {evt.status.toUpperCase()}
                        </span>
                        {evt.source === 'ai_booking_agent' && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> AI Autonomous Booked
                          </span>
                        )}
                        {evt.source === 'google_calendar' && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                            Google Cloud OAuth
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-teal-400" />
                          {startD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                          {endD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {evt.attendeeName && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {evt.attendeeName}
                          </span>
                        )}

                        {evt.attendeeEmail && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            {evt.attendeeEmail}
                          </span>
                        )}

                        {evt.hostAgent && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <span className="text-[10px] text-slate-500">Host:</span>
                            {evt.hostAgent}
                          </span>
                        )}
                      </div>

                      {evt.description && (
                        <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Video Meeting Link */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
                    {evt.meetLink && (
                      <div className="flex items-center gap-1">
                        <a
                          href={evt.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Video className="w-3.5 h-3.5 text-teal-400" />
                          Join Meet
                          <ExternalLink className="w-3 h-3 text-teal-400" />
                        </a>
                        <button
                          onClick={() => handleCopyMeetLink(evt.meetLink!)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-all"
                          title="Copy Google Meet Link"
                        >
                          {copiedLink === evt.meetLink ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedEventDetails(evt)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                    >
                      Details
                    </button>

                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-all"
                      title="Cancel Event"
                    >
                      <CalendarX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: SLOT AVAILABILITY & CONFLICT RESOLUTION GRID */}
      {viewMode === 'slots' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Select Calendar Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-teal-300 font-semibold focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Slot Duration
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value={15}>15 Minutes (Rapid Standup)</option>
                  <option value={30}>30 Minutes (Standard Call)</option>
                  <option value={45}>45 Minutes (Enterprise Demo)</option>
                  <option value={60}>60 Minutes (Architecture Deep Dive)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Open Slot</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span>Conflict / Booked</span>
              </div>
            </div>
          </div>

          {loadingSlots ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mb-3" />
              <p className="text-sm">Calculating slot conflicts and availability...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableSlots.map((slot, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    slot.available
                      ? 'bg-slate-900/90 border-slate-800 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/10 cursor-pointer group'
                      : 'bg-rose-950/20 border-rose-900/40 opacity-75'
                  }`}
                  onClick={() => slot.available && handleSelectSlotForBooking(slot)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white font-mono group-hover:text-teal-300">
                      {slot.time}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        slot.available
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {slot.available ? 'AVAILABLE' : 'CONFLICT'}
                    </span>
                  </div>

                  {slot.available ? (
                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                      <span>{durationMinutes} min booking window</span>
                      <span className="text-teal-400 font-bold text-[10px] group-hover:underline">
                        Book Slot →
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-rose-300 truncate">
                      Conflict: {slot.conflictingEvent || 'Booked Meeting'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: SCHEDULE NEW MEETING */}
      {isNewEventModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-teal-400" />
                Schedule Meeting & Generate Meet Link
              </h3>
              <button
                onClick={() => setIsNewEventModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Meeting Title / Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ansury Enterprise Coexistence Walkthrough"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Host Agent
                  </label>
                  <select
                    value={hostAgent}
                    onChange={(e) => setHostAgent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="Elena Rostova (Lead Architect)">Elena Rostova (Lead Architect)</option>
                    <option value="Marcus Vance (Enterprise SDR)">Marcus Vance (Enterprise SDR)</option>
                    <option value="David Miller (Support Lead)">David Miller (Support Lead)</option>
                    <option value="Ansury AI Copilot (Autonomous Bot)">Ansury AI Copilot (Autonomous Bot)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-teal-300">
                  <Video className="w-4 h-4 text-teal-400" />
                  <span>Auto-generate Google Meet Video Call</span>
                </div>
                <span className="text-[10px] bg-teal-500 text-slate-950 font-bold px-2 py-0.5 rounded">
                  ENABLED
                </span>
              </div>

              <div className="space-y-3 pt-1 border-t border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Attendee Contact Information
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      placeholder="Alex Rivera"
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="alex@techflow.io"
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 234-5678"
                    value={attendeePhone}
                    onChange={(e) => setAttendeePhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Agenda / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Meeting agenda notes for customer and host..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CalendarCheck className="w-3.5 h-3.5" />}
                  {isSubmitting ? 'Booking...' : 'Confirm & Sync Google Calendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EVENT DETAILS */}
      {selectedEventDetails && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">{selectedEventDetails.summary}</h3>
              <button
                onClick={() => setSelectedEventDetails(null)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Date & Time:</span>
                <span className="text-white font-semibold">
                  {new Date(selectedEventDetails.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>

              {selectedEventDetails.meetLink && (
                <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/50 space-y-2">
                  <div className="flex items-center justify-between text-teal-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-teal-400" /> Google Meet Video Room
                    </span>
                    <a
                      href={selectedEventDetails.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] underline flex items-center gap-1"
                    >
                      Join <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 flex items-center justify-between">
                    <span className="truncate">{selectedEventDetails.meetLink}</span>
                    <button
                      onClick={() => handleCopyMeetLink(selectedEventDetails.meetLink!)}
                      className="text-teal-400 hover:text-teal-300 ml-2"
                    >
                      {copiedLink === selectedEventDetails.meetLink ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Attendee:</span>
                  <span className="text-slate-200 font-medium">
                    {selectedEventDetails.attendeeName || 'N/A'}
                  </span>
                </div>
                {selectedEventDetails.attendeeEmail && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-200 font-medium">
                      {selectedEventDetails.attendeeEmail}
                    </span>
                  </div>
                )}
                {selectedEventDetails.attendeePhone && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="text-slate-200 font-medium">
                      {selectedEventDetails.attendeePhone}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Host Agent:</span>
                  <span className="text-slate-200 font-medium">
                    {selectedEventDetails.hostAgent}
                  </span>
                </div>
              </div>

              {selectedEventDetails.description && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Notes:</span>
                  <p className="text-slate-300">{selectedEventDetails.description}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => handleDeleteEvent(selectedEventDetails.id)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Delete Event
              </button>
              <button
                onClick={() => setSelectedEventDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
