import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, PhoneAuthProvider, RecaptchaVerifier, signInWithCredential } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "hobby-tracker-f5e4f",
  appId: "1:489068294620:web:ccef1b24f962d8c1025f19",
  apiKey: "AIzaSyBYVIH3IBijmVaPxgc5zg6EQnX_8KTwauo",
  authDomain: "hobby-tracker-f5e4f.firebaseapp.com",
  storageBucket: "hobby-tracker-f5e4f.firebasestorage.app",
  messagingSenderId: "489068294620",
  measurementId: "G-1FPW8T34SP",
  databaseId: "ai-studio-hobbysync-44648ee7-6522-457a-a2e3-95d13a009dec"
};

// Initialize Firebase
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.error("Failed to initialize Firebase App:", e);
}

export const auth = app ? getAuth(app) : null;

// Initialize Firestore with persistent offline caching as per PWA specifications
let db: Firestore | null = null;
if (app) {
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    }, "ai-studio-hobbysync-44648ee7-6522-457a-a2e3-95d13a009dec");
  } catch (e) {
    console.error("Failed to initialize Firestore with persistent local cache:", e);
  }
}

export { db };
