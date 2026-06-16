"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Room, Player } from '@/types/game';
import { useRoom } from '@/hooks/useRoom';
import { usePlayers } from '@/hooks/usePlayers';
import { getRoomByCode } from '@/lib/firebase/rooms';

interface GameContextType {
  room: Room | null;
  players: Player[];
  currentPlayerId: string | null;
  setCurrentPlayerId: (id: string | null) => void;
  loading: boolean;
  error: Error | null;
  isHost: boolean;
  currentPlayer: Player | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ 
  children,
  roomCode 
}: { 
  children: React.ReactNode;
  roomCode: string;
}) => {
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Get room ID from code
  useEffect(() => {
    const fetchRoomId = async () => {
      try {
        const r = await getRoomByCode(roomCode);
        if (r) {
          setRoomId(r.id);
        }
      } catch (e) {
        console.error("Error fetching room ID:", e);
      } finally {
        setInitialLoading(false);
      }
    };
    if (roomCode) {
      fetchRoomId();
    }
  }, [roomCode]);

  // Read current player ID from local storage (or setup)
  useEffect(() => {
    const storedId = localStorage.getItem(`spy_game_player_${roomCode}`);
    if (storedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPlayerId(storedId);
    }
  }, [roomCode]);

  useEffect(() => {
    if (currentPlayerId) {
      localStorage.setItem(`spy_game_player_${roomCode}`, currentPlayerId);
    }
  }, [currentPlayerId, roomCode]);

  const { room, loading: roomLoading, error: roomError } = useRoom(roomId);
  const { players, loading: playersLoading, error: playersError } = usePlayers(roomId);

  const isHost = room?.hostId === currentPlayerId;
  const currentPlayer = players.find(p => p.id === currentPlayerId) || null;

  return (
    <GameContext.Provider value={{
      room,
      players,
      currentPlayerId,
      setCurrentPlayerId,
      loading: initialLoading || roomLoading || playersLoading,
      error: roomError || playersError,
      isHost,
      currentPlayer
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
