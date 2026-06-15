import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Player } from '@/types/game';

export const usePlayers = (roomId: string | undefined) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomId) {
      setPlayers([]);
      setLoading(false);
      return;
    }

    const playersRef = collection(db, 'rooms', roomId, 'players');
    // We order by joinedAt so Lobby list is stable
    const q = query(playersRef, orderBy('joinedAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const playersData = snapshot.docs.map(doc => doc.data() as Player);
        setPlayers(playersData);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to players:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  return { players, loading, error };
};
