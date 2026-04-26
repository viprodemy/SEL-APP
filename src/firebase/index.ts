'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase(): {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
} {
  try {
    if (!firebaseConfig.apiKey) {
      console.warn("Firebase API Key is missing. Firebase features will be disabled.");
      return { app: null, firestore: null, auth: null };
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const firestore = getFirestore(app);
    const auth = getAuth(app);

    return { app, firestore, auth };
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    return { app: null, firestore: null, auth: null };
  }
}

export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './client-provider';
