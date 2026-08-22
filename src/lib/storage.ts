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
import {
  syncFirestoreFetchContacts,
  syncFirestoreContact,
  syncFirestoreIntegration,
  syncFirestoreTenant,
  syncFirestoreVisualFlow,
} from './firebaseSync.js';

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
  tenants?: any[];
  users?: any[];
  sessions?: any[];
  lastPersisted?: string;
}

/**
 * Loads platform state with resilient fallback:
 * 1. Checks local JSON disk persistence (`data/ansury_state.json`).
 * 2. Hydrates & merges with Firebase Firestore and Supabase cloud database.
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
          integrations: Array.isArray(parsed.integrations) ? parsed.integrations : state.integrations,
          contacts: Array.isArray(parsed.contacts) ? parsed.contacts : state.contacts,
          conversations: Array.isArray(parsed.conversations) ? parsed.conversations : state.conversations,
          calendarEvents: Array.isArray(parsed.calendarEvents) ? parsed.calendarEvents : state.calendarEvents,
          messagesMap: parsed.messagesMap && typeof parsed.messagesMap === 'object' ? parsed.messagesMap : state.messagesMap,
          oauthTokens: parsed.oauthTokens || state.oauthTokens,
          tenants: Array.isArray(parsed.tenants) ? parsed.tenants : state.tenants,
          users: Array.isArray(parsed.users) ? parsed.users : state.users,
          sessions: Array.isArray(parsed.sessions) ? parsed.sessions : state.sessions,
        };
        console.log('✅ Loaded persistent state from disk (data/ansury_state.json).');
      }
    }
  } catch (err) {
    console.warn('⚠️ Local state file read skipped:', err);
  }

  // 2. Hydrate from Firebase Firestore
  try {
    const firestoreContacts = await syncFirestoreFetchContacts().catch(() => null);
    if (firestoreContacts && firestoreContacts.length > 0) {
      console.log(`🔥 Hydrated ${firestoreContacts.length} contacts from Firebase Firestore.`);
      // Merge unique by ID
      const existingIds = new Set(state.contacts.map((c) => c.id));
      for (const fc of firestoreContacts) {
        if (!existingIds.has(fc.id)) {
          state.contacts.unshift(fc);
          existingIds.add(fc.id);
        }
      }
    }
  } catch (err) {
    console.warn('Firestore cloud hydration note:', err);
  }

  // 3. Hydrate from Supabase Cloud DB
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
    console.log('✅ Supabase cloud database sync check complete.');
  } catch (err) {
    console.warn('Supabase cloud hydration note:', err);
  }

  return state;
}

/**
 * Persists current platform state to local disk, Firebase Firestore, and Supabase cloud store
 */
export function persistState(state: PlatformState) {
  state.lastPersisted = new Date().toISOString();

  // Debounced file write & cloud mirroring
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

    // Mirror contacts to Firestore in background
    if (Array.isArray(state.contacts)) {
      state.contacts.slice(0, 50).forEach((c) => {
        syncFirestoreContact(c).catch(() => {});
      });
    }

    // Mirror to Supabase asynchronously
    syncSaveFullState(state).catch(() => {});
    if (state.oauthTokens) {
      syncSaveOAuthTokens(state.oauthTokens).catch(() => {});
    }
  }, 300);
}
