'use client';

import React, { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';

interface FirebaseContextValue {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({
  children,
  app,
  firestore,
  auth,
}: {
  children: React.ReactNode;
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}) {
  return (
    <FirebaseContext.Provider value={{ app, firestore, auth }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  // Return the context value instead of throwing if it's within the provider but null
  return context;
}

export function useFirebaseApp() {
  return useFirebase()?.app ?? null;
}

export function useFirestore() {
  return useFirebase()?.firestore ?? null;
}

export function useAuth() {
  return useFirebase()?.auth ?? null;
}
