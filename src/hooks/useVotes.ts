'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Vote } from '@/types/game';

interface UseVotesReturn {
  votes: Vote[];
  loading: boolean;
  error: string | null;
}

export function useVotes(roomId: string | null, round: number): UseVotesReturn {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setVotes([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const votesRef = collection(db, 'rooms', roomId, 'votes');
    const votesQuery = query(votesRef, where('round', '==', round));

    const unsubscribe = onSnapshot(
      votesQuery,
      (snapshot) => {
        const votesList: Vote[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            voterId: data.voterId,
            targetId: data.targetId,
            round: data.round,
          } as Vote;
        });

        setVotes(votesList);
        setLoading(false);
      },
      (err: FirestoreError) => {
        console.error('[useVotes] Firestore error:', err);
        setError(err.message);
        setVotes([]);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [roomId, round]);

  return { votes, loading, error };
}
