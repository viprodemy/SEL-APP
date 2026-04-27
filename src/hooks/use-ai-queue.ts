'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export type QueueStatus = 'waiting' | 'processing' | 'completed' | 'failed';

export function useAIQueue() {
  const db = useFirestore();
  const [requestId, setRequestId] = useState<string | null>(null);
  const [status, setStatus] = useState<QueueStatus | 'idle'>('idle');
  const [position, setPosition] = useState<number>(0);
  const [activeCount, setActiveCount] = useState<number>(0);

  useEffect(() => {
    if (!db || !requestId) return;

    const requestRef = doc(db, 'ai_queue', requestId);
    const unsubscribeStatus = onSnapshot(requestRef, (snapshot) => {
      if (snapshot.exists()) {
        setStatus(snapshot.data().status as QueueStatus);
      } else {
        setStatus('idle');
        setRequestId(null);
      }
    });

    const queueQuery = query(
      collection(db, 'ai_queue'), 
      where('status', 'in', ['waiting', 'processing']),
      orderBy('createdAt', 'asc')
    );

    const unsubscribeQueue = onSnapshot(queueQuery, (snapshot) => {
      const docs = snapshot.docs;
      const myIndex = docs.findIndex(d => d.id === requestId);
      
      const currentActiveCount = docs.filter(d => d.data().status === 'processing').length;
      setActiveCount(currentActiveCount);

      // Calculate position in the entire active/waiting list
      if (myIndex !== -1) {
        setPosition(myIndex + 1);
        
        const myDocData = docs[myIndex].data();
        if (myDocData.status === 'waiting') {
           // Find my index among waiting docs
           const waitingDocs = docs.filter(d => d.data().status === 'waiting');
           const myWaitingIndex = waitingDocs.findIndex(d => d.id === requestId);
           
           // Concurrent limit is 10
           if (currentActiveCount < 10) {
             // If I'm one of the ones that can fill the remaining spots
             if (myWaitingIndex !== -1 && (currentActiveCount + myWaitingIndex < 10)) {
               updateDoc(requestRef, { 
                 status: 'processing',
                 updatedAt: serverTimestamp()
               });
             }
           }
        }
      } else {
        setPosition(0);
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeQueue();
    };
  }, [db, requestId]);

  // Cleanup on unmount if still active
  useEffect(() => {
    return () => {
      if (requestId && (status === 'waiting' || status === 'processing')) {
        // We can't use updateDoc here easily in cleanup if it's async
        // but it's a good practice to try to leave gracefully
      }
    };
  }, [requestId, status]);

  const joinQueue = async (studentName: string) => {
    if (!db) {
       console.warn("Firestore not initialized, bypassing queue.");
       setStatus('processing');
       return 'bypass-id';
    }
    try {
      const docRef = await addDoc(collection(db, 'ai_queue'), {
        studentName,
        status: 'waiting',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setRequestId(docRef.id);
      setStatus('waiting');
      return docRef.id;
    } catch (err) {
      console.error("Failed to join queue:", err);
      setStatus('processing'); // Fail-safe: let them proceed
      return 'fail-safe-id';
    }
  };

  const completeRequest = async () => {
    if (!requestId || requestId.startsWith('bypass') || requestId.startsWith('fail-safe')) {
      setStatus('idle');
      setRequestId(null);
      return;
    }
    if (!db) return;
    try {
      await updateDoc(doc(db, 'ai_queue', requestId), {
        status: 'completed',
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Complete request failed:", err);
    }
    setRequestId(null);
    setStatus('idle');
  };

  const failRequest = async (error?: any) => {
    if (!requestId || requestId.startsWith('bypass') || requestId.startsWith('fail-safe')) {
      setStatus('idle');
      setRequestId(null);
      return;
    }
    if (!db) return;
    try {
      await updateDoc(doc(db, 'ai_queue', requestId), {
        status: 'failed',
        error: error?.message || String(error),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Fail request failed:", err);
    }
    setRequestId(null);
    setStatus('idle');
  };

  return {
    joinQueue,
    completeRequest,
    failRequest,
    status,
    position,
    activeCount,
    isWaiting: status === 'waiting',
    isProcessing: status === 'processing'
  };
}
