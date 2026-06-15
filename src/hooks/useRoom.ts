import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Room } from '@/types/game';

export const useRoom = (roomId: string | undefined) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const roomRef = doc(db, 'rooms', roomId);
    
    const unsubscribe = onSnapshot(
      roomRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setRoom(docSnap.data() as Room);
        } else {
          setRoom(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to room:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  return { room, loading, error };
};
