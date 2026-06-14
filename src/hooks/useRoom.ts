'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Room } from '@/types/game';

interface UseRoomReturn {
  room: Room | null;
  loading: boolean;
  error: string | null;
}

export function useRoom(roomId: string | null): UseRoomReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const roomRef = doc(db, 'rooms', roomId);

    const unsubscribe = onSnapshot(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setRoom({
            id: snapshot.id,
            code: data.code,
            status: data.status,
            citizenWord: data.citizenWord ?? '',
            spyWord: data.spyWord ?? '',
            currentRound: data.currentRound ?? 1,
            currentSpeakerIndex: data.currentSpeakerIndex ?? 0,
            hostId: data.hostId,
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
            winner: data.winner ?? null,
            eliminatedPlayerId: data.eliminatedPlayerId ?? null,
          } satisfies Room);
        } else {
          setRoom(null);
          setError('Room not found');
        }
        setLoading(false);
      },
      (err: FirestoreError) => {
        console.error('[useRoom] Firestore error:', err);
        setError(err.message);
        setRoom(null);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  return { room, loading, error };
}
