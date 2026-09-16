import { initializeApp, getApps, cert, type ServiceAccount, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { clientDb } from './config';

let _app: App | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getAdminApp(): App | null {
  if (_app) return _app;
  if (getApps().length) {
    _app = getApps()[0];
    return _app;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey) as ServiceAccount;
    _app = initializeApp({ credential: cert(serviceAccount) });
    return _app;
  } catch {
    return null;
  }
}

export function getAdminAuth(): Auth | null {
  const app = getAdminApp();
  if (!app) return null;
  if (!_auth) _auth = getAuth(app);
  return _auth;
}

export function getAdminDb(): Firestore {
  const app = getAdminApp();
  if (app) {
    if (!_db) _db = getFirestore(app);
    return _db;
  }
  return clientDb as unknown as Firestore;
}

export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    const authInstance = getAdminAuth();
    if (!authInstance) return () => Promise.resolve(null);
    const val = (authInstance as any)[prop];
    return typeof val === 'function' ? val.bind(authInstance) : val;
  }
});

export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    const dbInstance = getAdminDb();
    const val = (dbInstance as any)[prop];
    return typeof val === 'function' ? val.bind(dbInstance) : val;
  }
});
