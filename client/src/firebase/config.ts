// MandiMate Firebase Configuration & Offline Firestore Setup
// Implements Cloud Firestore with persistent offline caching

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  type Firestore 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let app: FirebaseApp = {} as FirebaseApp;
let db: Firestore = {} as Firestore;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Enable persistent local cache for zero-latency offline farmer access
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch {
      db = getFirestore(app);
    }
  } catch (e) {
    console.warn("[Firebase] Initializing fallback client:", e);
    app = {} as FirebaseApp;
    db = {} as Firestore;
  }
}

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);
}

export function getFirebaseConfig() {
  return {
    provider: "Google Firebase (Spark Free Plan)",
    projectId: firebaseConfig.projectId || "Not configured (Local/Offline mode)",
    features: ["Cloud Firestore", "Firebase Hosting", "Firebase AI Logic / Gemini", "Offline Cache"],
    isConfigured: isFirebaseConfigured()
  };
}

export { app, db };
