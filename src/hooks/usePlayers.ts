'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Player } from '@/types/game';

interface UsePlayersReturn {
  players: Player[];
  loading: boolean;
  error: string | null;
}

export function usePlayers(roomId: string | null): UsePlayersReturn {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setPlayers([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const playersRef = collection(db, 'rooms', roomId, 'players');
    const playersQuery = query(playersRef, orderBy('speakingOrder', 'asc'));

    const unsubscribe = onSnapshot(
      playersQuery,
      (snapshot) => {
        const playersList: Player[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            role: data.role ?? null,
            alive: data.alive ?? true,
            hasRevealedCard: data.hasRevealedCard ?? false,
            speakingOrder: data.speakingOrder ?? 0,
            joinedAt: data.joinedAt?.toDate?.() ?? new Date(),
          } satisfies Player;
        });

        setPlayers(playersList);
        setLoading(false);
      },
      (err: FirestoreError) => {
        console.error('[usePlayers] Firestore error:', err);
        setError(err.message);
        setPlayers([]);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  return { players, loading, error };
}
