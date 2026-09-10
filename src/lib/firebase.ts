/**
 * Firebase Configuration — Realtime Database + Authentication
 * Project: hai-phong-math-olympiad
 * Region: asia-southeast1 (Singapore)
 */

import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getDatabase, Database, ref, set, get, push, remove, onValue, off, DataSnapshot } from 'firebase/database';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';

// ============================================================
// FIREBASE CONFIG — HARDCODED (từ config.txt)
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyC6X-coi_FVXedNEYROQpxhCDfLRBiXr1g",
  authDomain: "hai-phong-math-olympiad.firebaseapp.com",
  databaseURL: "https://hai-phong-math-olympiad-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hai-phong-math-olympiad",
  storageBucket: "hai-phong-math-olympiad.firebasestorage.app",
  messagingSenderId: "226482259543",
  appId: "1:226482259543:web:757a34192400ed6cb1c512"
};

// ============================================================
// FIREBASE INITIALIZATION
// ============================================================
let _app: FirebaseApp | null = null;
let _db: Database | null = null;
let _auth: Auth | null = null;

export const getFirebaseApp = (): FirebaseApp => {
  if (_app) return _app;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    _app = existingApps[0];
  } else {
    _app = initializeApp(firebaseConfig);
  }
  return _app;
};

export const getFirebaseDb = (): Database => {
  if (_db) return _db;
  _db = getDatabase(getFirebaseApp());
  return _db;
};

export const getFirebaseAuth = (): Auth => {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  return _auth;
};

// Always configured now (hardcoded)
export const isFirebaseConfigured = (): boolean => true;

// Legacy compat — no longer needed but keep for SettingsModal
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const saveFirebaseConfig = (_config: FirebaseConfig): void => {
  // Config is hardcoded, no-op
};

export const getFirebaseConfig = (): FirebaseConfig => {
  return firebaseConfig;
};

// ============================================================
// FIREBASE AUTH HELPERS
// ============================================================

export const fbSignIn = async (email: string, password: string): Promise<User> => {
  const auth = getFirebaseAuth();
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const fbSignUp = async (email: string, password: string, displayName: string): Promise<User> => {
  const auth = getFirebaseAuth();
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  return result.user;
};

export const fbUpdateProfile = async (user: User, profile: { displayName?: string }): Promise<void> => {
  await updateProfile(user, profile);
};

export const fbSignOut = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  await signOut(auth);
};

export const fbOnAuthChanged = (callback: (user: User | null) => void): (() => void) => {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = (): User | null => {
  const auth = getFirebaseAuth();
  return auth.currentUser;
};

// ============================================================
// FIREBASE REALTIME DATABASE HELPERS
// ============================================================

/** 
 * Loại bỏ các key có giá trị undefined trong object/array 
 * để ngăn Firebase SDK ném lỗi "value argument contains undefined"
 */
export const cleanUndefined = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined).filter((v) => v !== undefined);
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefined(value);
      }
    }
    return cleaned;
  }
  return obj;
};

/** Write data to a path */
export const fbSet = async (path: string, data: any): Promise<boolean> => {
  const db = getFirebaseDb();
  try {
    const sanitized = cleanUndefined(data);
    await set(ref(db, path), sanitized);
    return true;
  } catch (error) {
    console.error(`Firebase write error at ${path}:`, error);
    return false;
  }
};

/** Push a new child to a path */
export const fbPush = async (path: string, data: any): Promise<string | null> => {
  const db = getFirebaseDb();
  try {
    const sanitized = cleanUndefined(data);
    const newRef = push(ref(db, path));
    await set(newRef, sanitized);
    return newRef.key;
  } catch (error) {
    console.error(`Firebase push error at ${path}:`, error);
    return null;
  }
};

/** Read data from a path */
export const fbGet = async <T = any>(path: string): Promise<T | null> => {
  const db = getFirebaseDb();
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
  const dbRef = ref(db, path);
  const handler = (snapshot: DataSnapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  };

  const unsubscribe = onValue(
    dbRef,
    handler,
    (error) => {
      console.warn(`Firebase onValue listener error at ${path}:`, error);
    }
  );

  return unsubscribe;
};
