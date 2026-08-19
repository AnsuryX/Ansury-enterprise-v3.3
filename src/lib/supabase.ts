import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';


let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

// Public client (Anon / Publishable)
export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseClient && SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log('✅ Supabase Public Client initialized for URL:', SUPABASE_URL);
    } catch (err) {
      console.warn('⚠️ Supabase public initialization failed:', err);
      supabaseClient = null;
    }
  }
  return supabaseClient;
}

// Admin / Server-side client (Service Role - Bypasses RLS)
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!supabaseAdminClient && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      supabaseAdminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log('✅ Supabase Admin (Service Role) Client connected for live database synchronization.');
    } catch (err) {
      console.warn('⚠️ Supabase admin initialization failed:', err);
      supabaseAdminClient = null;
    }
  }
  return supabaseAdminClient || getSupabaseClient();
}

export const supabaseConfig = {
  url: SUPABASE_URL,
  key: SUPABASE_PUBLISHABLE_KEY,
  serviceKey: SUPABASE_SERVICE_ROLE_KEY,
  isConfigured: Boolean(SUPABASE_URL && (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_PUBLISHABLE_KEY)),
};

// =========================================================================
// SUPABASE DATABASE PERSISTENCE HELPERS
// =========================================================================

// 1. Contacts DB Sync
export async function syncSaveContact(contact: any): Promise<boolean> {
  const sb = getSupabaseAdminClient();
  if (!sb) return false;
  try {
    const { error } = await sb.from('contacts').upsert(
      {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        company: contact.company || null,
        job_title: contact.jobTitle || null,
        location: contact.location || null,
        preferred_channel: contact.preferredChannel || 'whatsapp',
        lifecycle_stage: contact.lifecycleStage || 'lead',
        lead_score: contact.leadScore || 50,
        assigned_agent: contact.assignedAgent || null,
        tags: contact.tags || [],
        notes: contact.notes || null,
        custom_attributes: contact.customAttributes || {},
        wa_business_profile: contact.waBusinessProfile || null,
        avatar: contact.avatar || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) {
      // Also save in universal ansury_store fallback
      try {
        await sb.from('ansury_store').upsert(
          {
            key: `contact_${contact.id}`,
            data: contact,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
      } catch {}
    }
    return !error;
  } catch (err) {
    console.warn('Supabase syncSaveContact fallback:', err);
    return false;
  }
}

export async function syncDeleteContact(id: string): Promise<boolean> {
  const sb = getSupabaseAdminClient();
  if (!sb) return false;
  try {
    await sb.from('contacts').delete().eq('id', id);
    try {
      await sb.from('ansury_store').delete().eq('key', `contact_${id}`);
    } catch {}
    return true;
  } catch {
    return false;
  }
}

export async function syncFetchContacts(): Promise<any[] | null> {
  const sb = getSupabaseAdminClient();
  if (!sb) return null;
  try {
    const { data, error } = await sb.from('contacts').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        phone: d.phone,
        email: d.email,
        company: d.company,
        jobTitle: d.job_title,
        location: d.location,
        preferredChannel: d.preferred_channel || 'whatsapp',
        lifecycleStage: d.lifecycle_stage || 'lead',
        leadScore: d.lead_score || 50,
        assignedAgent: d.assigned_agent,
        tags: d.tags || [],
        notes: d.notes || '',
        customAttributes: d.custom_attributes || {},
        waBusinessProfile: d.wa_business_profile || undefined,
        avatar: d.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        createdAt: d.created_at || new Date().toISOString(),
      }));
    }
    return null;
  } catch {
    return null;
  }
}

// 2. Integrations DB Sync
export async function syncSaveIntegration(integration: any): Promise<boolean> {
  const sb = getSupabaseAdminClient();
  if (!sb) return false;
  try {
    const { error } = await sb.from('integrations').upsert(
      {
        id: integration.id,
        name: integration.name,
        key: integration.key,
        category: integration.category,
        description: integration.description,
        status: integration.status,
        config: integration.config || {},
        last_synced: integration.lastSynced || null,
        events_count: integration.eventsCount || 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) {
      try {
        await sb.from('ansury_store').upsert(
          {
            key: `integration_${integration.id}`,
            data: integration,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
      } catch {}
    }
    return !error;
  } catch {
    return false;
  }
}

export async function syncFetchIntegrations(): Promise<any[] | null> {
  const sb = getSupabaseAdminClient();
  if (!sb) return null;
  try {
    const { data, error } = await sb.from('integrations').select('*');
    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        key: d.key,
        category: d.category,
        description: d.description,
        iconName: d.key === 'calendar' ? 'Calendar' : d.key === 'zoho' ? 'Building2' : 'Boxes',
        status: d.status,
        config: d.config || {},
        lastSynced: d.last_synced,
        eventsCount: d.events_count || 0,
      }));
    }
    return null;
  } catch {
    return null;
  }
}

// 3. Calendar Events DB Sync
export async function syncSaveCalendarEvent(evt: any): Promise<boolean> {
  const sb = getSupabaseAdminClient();
  if (!sb) return false;
  try {
    const { error } = await sb.from('calendar_events').upsert(
      {
        id: evt.id,
        summary: evt.summary,
        description: evt.description || null,
        start_time: evt.startTime,
        end_time: evt.endTime,
        attendee_name: evt.attendeeName,
        attendee_email: evt.attendeeEmail || null,
        attendee_phone: evt.attendeePhone || null,
        host_agent: evt.hostAgent || null,
        location: evt.location || 'Google Meet',
        meet_link: evt.meetLink || null,
        status: evt.status || 'confirmed',
        conversation_id: evt.conversationId || null,
        source: evt.source || 'inbox_manual',
        color_tag: evt.colorTag || 'teal',
        created_at: evt.createdAt || new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) {
      try {
        await sb.from('ansury_store').upsert(
          {
            key: `event_${evt.id}`,
            data: evt,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
      } catch {}
    }
    return !error;
  } catch {
    return false;
  }
}

export async function syncDeleteCalendarEvent(id: string): Promise<boolean> {
  const sb = getSupabaseAdminClient();
  if (!sb) return false;
  try {
    await sb.from('calendar_events').delete().eq('id', id);
    try {
      await sb.from('ansury_store').delete().eq('key', `event_${id}`);
    } catch {}
    return true;
  } catch {
    return false;
  }
}

export async function syncFetchCalendarEvents(): Promise<any[] | null> {
  const sb = getSupabaseAdminClient();
  if (!sb) return null;
  try {
    const { data, error } = await sb.from('calendar_events').select('*').order('start_time', { ascending: true });
    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        summary: d.summary,
        description: d.description,
        startTime: d.start_time,
        endTime: d.end_time,
        attendeeName: d.attendee_name,
        attendeeEmail: d.attendee_email,
        attendeePhone: d.attendee_phone,
        hostAgent: d.host_agent,
        location: d.location,
        meetLink: d.meet_link,
        status: d.status,
        conversationId: d.conversation_id,
        source: d.source,
        colorTag: d.color_tag,
        createdAt: d.created_at,
      }));
    }
    return null;
  } catch {
    return null;
  }
}

// 4. OAuth Tokens Sync
export async function syncSaveOAuthTokens(tokens: any): Promise<boolean> {
  const sb = getSupabaseAdminClient();
  if (!sb) return false;
  try {
    const { error } = await sb.from('ansury_store').upsert(
      {
        key: 'system_oauth_tokens',
        data: tokens,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
    return !error;
  } catch {
    return false;
  }
}

export async function syncFetchOAuthTokens(): Promise<any | null> {
  const sb = getSupabaseAdminClient();
  if (!sb) return null;
  try {
    const { data, error } = await sb.from('ansury_store').select('data').eq('key', 'system_oauth_tokens').single();
    if (!error && data?.data) {
      return data.data;
    }
    return null;
  } catch {
    return null;
  }
}

// 5. Full Enterprise State Backup / Mirror
export async function syncSaveFullState(state: any): Promise<boolean> {
  const sb = getSupabaseAdminClient();
  if (!sb) return false;
  try {
    const { error } = await sb.from('ansury_store').upsert(
      {
        key: 'full_platform_state',
        data: state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
    return !error;
  } catch {
    return false;
  }
}

export async function syncFetchFullState(): Promise<any | null> {
  const sb = getSupabaseAdminClient();
  if (!sb) return null;
  try {
    const { data, error } = await sb.from('ansury_store').select('data').eq('key', 'full_platform_state').single();
    if (!error && data?.data) {
      return data.data;
    }
    return null;
  } catch {
    return null;
  }
}
