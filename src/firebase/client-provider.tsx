'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [instances, setInstances] = useState<{
    app: FirebaseApp | null;
    firestore: Firestore | null;
    auth: Auth | null;
  } | null>(null);

  useEffect(() => {
    const { app, firestore, auth } = initializeFirebase();
    setInstances({ app, firestore, auth });
  }, []);

  // Show nothing until initialization attempt finishes
  if (!instances) return null;

  return (
    <FirebaseProvider
      app={instances.app}
      firestore={instances.firestore}
      auth={instances.auth}
    >
      {children}
    </FirebaseProvider>
  );
}
