import fs from 'fs';
import path from 'path';
import {
  syncSaveFullState,
  syncFetchFullState,
  syncSaveIntegration,
  syncFetchIntegrations,
  syncSaveCalendarEvent,
  syncFetchCalendarEvents,
  syncSaveContact,
  syncFetchContacts,
  syncSaveOAuthTokens,
  syncFetchOAuthTokens,
} from './supabase.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE_PATH = path.join(DATA_DIR, 'ansury_state.json');

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Storage directory initialization note:', e);
}

let saveTimeout: NodeJS.Timeout | null = null;

export interface PlatformState {
  brandConfig: any;
  coexistenceConfig: any;
  inboxes: any[];
  contacts: any[];
  conversations: any[];
  messagesMap: Record<string, any[]>;
  templates: any[];
  slaPolicies: any[];
  automations: any[];
  macros: any[];
  agents: any[];
  auditLogs: any[];
  integrations: any[];
  aiAgentConfig: any;
  aiPersonas: any[];
  knowledgeBase: any[];
  products: any[];
  broadcasts: any[];
  flows: any[];
  leads: any[];
  calendarEvents: any[];
  aiToolLogs: any[];
  oauthTokens: Record<string, any>;
  lastPersisted?: string;
}

/**
 * Loads platform state with resilient fallback:
 * 1. Checks local JSON disk persistence (`data/ansury_state.json`).
 * 2. Hydrates & merges with Supabase cloud database.
 * 3. Falls back to default template models if new fields are added.
 */
export async function loadPersistedState(defaults: PlatformState): Promise<PlatformState> {
  let state: PlatformState = { ...defaults };

  // 1. Try loading from local file
  try {
    if (fs.existsSync(STATE_FILE_PATH)) {
      const fileData = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (parsed && typeof parsed === 'object') {
        state = {
          ...state,
          ...parsed,
          // Ensure arrays and objects are properly merged without overriding empty user data
          integrations: Array.isArray(parsed.integrations) ? parsed.integrations : state.integrations,
          contacts: Array.isArray(parsed.contacts) ? parsed.contacts : state.contacts,
          conversations: Array.isArray(parsed.conversations) ? parsed.conversations : state.conversations,
          calendarEvents: Array.isArray(parsed.calendarEvents) ? parsed.calendarEvents : state.calendarEvents,
          messagesMap: parsed.messagesMap && typeof parsed.messagesMap === 'object' ? parsed.messagesMap : state.messagesMap,
          oauthTokens: parsed.oauthTokens || state.oauthTokens,
        };
        console.log('✅ Loaded persistent state from disk (data/ansury_state.json).');
      }
    }
  } catch (err) {
    console.warn('⚠️ Local state file read skipped:', err);
  }

  // 2. Hydrate from Supabase Cloud DB
  try {
    const [cloudIntegrations, cloudEvents, cloudContacts, cloudOAuth, fullCloudState] = await Promise.all([
      syncFetchIntegrations().catch(() => null),
      syncFetchCalendarEvents().catch(() => null),
      syncFetchContacts().catch(() => null),
      syncFetchOAuthTokens().catch(() => null),
      syncFetchFullState().catch(() => null),
    ]);

    if (fullCloudState && typeof fullCloudState === 'object') {
      state = { ...state, ...fullCloudState };
    }
    if (cloudIntegrations && cloudIntegrations.length > 0) {
      state.integrations = cloudIntegrations;
    }
    if (cloudEvents && cloudEvents.length > 0) {
      state.calendarEvents = cloudEvents;
    }
    if (cloudContacts && cloudContacts.length > 0) {
      state.contacts = cloudContacts;
    }
    if (cloudOAuth && typeof cloudOAuth === 'object') {
      state.oauthTokens = { ...state.oauthTokens, ...cloudOAuth };
    }
    console.log('✅ Supabase cloud database sync complete.');
  } catch (err) {
    console.warn('Supabase cloud hydration note:', err);
  }

  return state;
}

/**
 * Persists current platform state to local disk and Supabase cloud store
 */
export function persistState(state: PlatformState) {
  // Update timestamp
  state.lastPersisted = new Date().toISOString();

  // Debounced file write
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.warn('State file write warning:', e);
    }

    // Mirror to Supabase asynchronously
    syncSaveFullState(state).catch(() => {});
    if (state.oauthTokens) {
      syncSaveOAuthTokens(state.oauthTokens).catch(() => {});
    }
  }, 300);
}
