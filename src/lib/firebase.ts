/**
 * Firebase Configuration — Realtime Database
 * Theo hướng dẫn firebase_setup_guide.md:
 * - User dán firebaseConfig từ Firebase Console
 * - Dùng Realtime Database (Singapore region)
 * - Test mode cho 30 ngày đầu
 */

import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getDatabase, Database, ref, set, get, push, remove, onValue, off, DataSnapshot } from 'firebase/database';

// ============================================================
// FIREBASE CONFIG STORAGE
// ============================================================
const FB_CONFIG_KEY = 'hp_math_firebase_config';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Save Firebase config to localStorage
export const saveFirebaseConfig = (config: FirebaseConfig): void => {
  localStorage.setItem(FB_CONFIG_KEY, JSON.stringify(config));
  // Re-initialize when config changes
  _app = null;
  _db = null;
};

// Get stored Firebase config
export const getFirebaseConfig = (): FirebaseConfig | null => {
  const stored = localStorage.getItem(FB_CONFIG_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

// Check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  const config = getFirebaseConfig();
  return !!(config && config.apiKey && config.databaseURL && config.projectId);
};

// ============================================================
// FIREBASE INITIALIZATION
// ============================================================
let _app: FirebaseApp | null = null;
let _db: Database | null = null;

export const getFirebaseApp = (): FirebaseApp | null => {
  if (_app) return _app;

  const config = getFirebaseConfig();
  if (!config) return null;

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      _app = existingApps[0];
    } else {
      _app = initializeApp(config);
    }
    return _app;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
};

export const getFirebaseDb = (): Database | null => {
  if (_db) return _db;

  const app = getFirebaseApp();
  if (!app) return null;

  try {
    _db = getDatabase(app);
    return _db;
  } catch (error) {
    console.error('Firebase Database error:', error);
    return null;
  }
};

// ============================================================
// FIREBASE REALTIME DATABASE HELPERS
// ============================================================

/** Write data to a path */
export const fbSet = async (path: string, data: any): Promise<boolean> => {
  const db = getFirebaseDb();
  if (!db) return false;
  try {
    await set(ref(db, path), data);
    return true;
  } catch (error) {
    console.error(`Firebase write error at ${path}:`, error);
    return false;
  }
};

/** Push a new child to a path */
export const fbPush = async (path: string, data: any): Promise<string | null> => {
  const db = getFirebaseDb();
  if (!db) return null;
  try {
    const newRef = push(ref(db, path));
    await set(newRef, data);
    return newRef.key;
  } catch (error) {
    console.error(`Firebase push error at ${path}:`, error);
    return null;
  }
};

/** Read data from a path */
export const fbGet = async <T = any>(path: string): Promise<T | null> => {
  const db = getFirebaseDb();
  if (!db) return null;
  try {
    const snapshot: DataSnapshot = await get(ref(db, path));
    if (snapshot.exists()) {
      return snapshot.val() as T;
    }
    return null;
  } catch (error) {
    console.error(`Firebase read error at ${path}:`, error);
    return null;
  }
};

/** Delete data at a path */
export const fbRemove = async (path: string): Promise<boolean> => {
  const db = getFirebaseDb();
  if (!db) return false;
  try {
    await remove(ref(db, path));
    return true;
  } catch (error) {
    console.error(`Firebase delete error at ${path}:`, error);
    return false;
  }
};

/** Subscribe to realtime updates at a path */
export const fbOnValue = (
  path: string,
  callback: (data: any) => void,
): (() => void) => {
  const db = getFirebaseDb();
  if (!db) return () => {};

  const dbRef = ref(db, path);
  const handler = (snapshot: DataSnapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  };

  onValue(dbRef, handler);

  // Return unsubscribe function
  return () => off(dbRef, 'value', handler);
};
