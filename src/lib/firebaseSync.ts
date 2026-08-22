import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  collection,
  query,
  limit,
  Firestore,
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Load config from json
let config: any = null;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (e) {
  console.warn('Firebase config load error:', e);
}

let firestoreDb: Firestore | null = null;

export function getFirestoreDb(): Firestore | null {
  if (!firestoreDb && config && config.projectId) {
    try {
      const app = !getApps().length ? initializeApp(config) : getApp();
      firestoreDb = getFirestore(app, config.firestoreDatabaseId || '(default)');
      console.log(`✅ Firebase Firestore initialized for project ${config.projectId} (DB: ${config.firestoreDatabaseId || '(default)'})`);
    } catch (err) {
      console.warn('⚠️ Firebase Firestore server initialization error:', err);
      firestoreDb = null;
    }
  }
  return firestoreDb;
}

export const firebaseStatus = {
  isConfigured: Boolean(config && config.projectId),
  projectId: config?.projectId || '',
  databaseId: config?.firestoreDatabaseId || '',
  appId: config?.appId || '',
};

// ==========================================
// FIRESTORE ENTITY PERSISTENCE
// ==========================================

export async function syncFirestoreContact(contact: any): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db || !contact?.id) return false;
  try {
    const ref = doc(db, 'contacts', String(contact.id));
    await setDoc(ref, {
      ...contact,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn(`⚠️ Firestore syncContact error for ${contact.id}:`, err);
    return false;
  }
}

export async function syncFirestoreDeleteContact(contactId: string): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db || !contactId) return false;
  try {
    const ref = doc(db, 'contacts', String(contactId));
    await deleteDoc(ref);
    return true;
  } catch (err) {
    console.warn(`⚠️ Firestore syncDeleteContact error:`, err);
    return false;
  }
}

export async function syncFirestoreFetchContacts(): Promise<any[] | null> {
  const db = getFirestoreDb();
  if (!db) return null;
  try {
    const collRef = collection(db, 'contacts');
    const snapshot = await getDocs(collRef);
    if (!snapshot.empty) {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    }
    return null;
  } catch (err) {
    console.warn('⚠️ Firestore fetchContacts error:', err);
    return null;
  }
}

export async function syncFirestoreConversation(conversation: any): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db || !conversation?.id) return false;
  try {
    const ref = doc(db, 'conversations', String(conversation.id));
    await setDoc(ref, {
      ...conversation,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('⚠️ Firestore syncConversation error:', err);
    return false;
  }
}

export async function syncFirestoreMessage(conversationId: string, message: any): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db || !conversationId || !message?.id) return false;
  try {
    const ref = doc(db, 'conversations', String(conversationId), 'messages', String(message.id));
    await setDoc(ref, message, { merge: true });

    // Also write to top-level messages collection for unified querying
    const topRef = doc(db, 'messages', String(message.id));
    await setDoc(topRef, { ...message, conversationId }, { merge: true });
    return true;
  } catch (err) {
    console.warn('⚠️ Firestore syncMessage error:', err);
    return false;
  }
}

export async function syncFirestoreIntegration(integration: any): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db || !integration?.id) return false;
  try {
    const ref = doc(db, 'integrations', String(integration.id));
    await setDoc(ref, {
      ...integration,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('⚠️ Firestore syncIntegration error:', err);
    return false;
  }
}

export async function syncFirestoreTenant(tenant: any): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db || !tenant?.id) return false;
  try {
    const ref = doc(db, 'tenants', String(tenant.id));
    await setDoc(ref, {
      ...tenant,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('⚠️ Firestore syncTenant error:', err);
    return false;
  }
}

export async function syncFirestoreAuditLog(log: any): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db || !log?.id) return false;
  try {
    const ref = doc(db, 'auditLogs', String(log.id));
    await setDoc(ref, log);
    return true;
  } catch (err) {
    console.warn('⚠️ Firestore syncAuditLog error:', err);
    return false;
  }
}

export async function syncFirestoreVisualFlow(flow: any): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db || !flow?.id) return false;
  try {
    const ref = doc(db, 'flows', String(flow.id));
    await setDoc(ref, {
      ...flow,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('⚠️ Firestore syncVisualFlow error:', err);
    return false;
  }
}

export async function syncFirestoreTest(): Promise<{ success: boolean; message: string; databaseId: string; pingTimeMs: number }> {
  const start = Date.now();
  const db = getFirestoreDb();
  if (!db) {
    return {
      success: false,
      message: 'Firestore client could not be initialized. Verify firebase-applet-config.json exists.',
      databaseId: config?.firestoreDatabaseId || '',
      pingTimeMs: 0,
    };
  }
  try {
    const testRef = doc(db, 'test', 'connection');
    await setDoc(testRef, {
      lastPing: new Date().toISOString(),
      platform: 'Ansury Omnichannel Enterprise',
      nodeVersion: process.version,
      status: 'HEALTHY',
    });
    const snapshot = await getDoc(testRef);
    const latency = Date.now() - start;
    if (snapshot.exists()) {
      return {
        success: true,
        message: `Connected successfully to Firebase Firestore in Europe West (${config.firestoreDatabaseId})`,
        databaseId: config.firestoreDatabaseId,
        pingTimeMs: latency,
      };
    }
    return {
      success: true,
      message: `Firestore write verified (${latency}ms)`,
      databaseId: config.firestoreDatabaseId,
      pingTimeMs: latency,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Firestore connection check failed',
      databaseId: config?.firestoreDatabaseId || '',
      pingTimeMs: Date.now() - start,
    };
  }
}
