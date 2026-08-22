import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Bind to the custom firestoreDatabaseId from configuration
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validates connection to Firestore backend
 */
export async function testFirestoreConnection(): Promise<{ success: boolean; message: string; databaseId: string }> {
  try {
    // Attempt write and read on /test/connection
    const testRef = doc(db, 'test', 'connection');
    await setDoc(testRef, {
      lastPing: new Date().toISOString(),
      platform: 'Ansury Omnichannel Enterprise',
      status: 'ONLINE',
    });
    const snapshot = await getDocFromServer(testRef);
    if (snapshot.exists()) {
      return {
        success: true,
        message: `Successfully connected to Firebase Firestore (${firebaseConfig.firestoreDatabaseId})`,
        databaseId: firebaseConfig.firestoreDatabaseId,
      };
    }
    return {
      success: true,
      message: 'Firestore connection established (Document written).',
      databaseId: firebaseConfig.firestoreDatabaseId,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Firestore connection failed',
      databaseId: firebaseConfig.firestoreDatabaseId,
    };
  }
}

export { firebaseConfig };
