'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useRoom } from '@/hooks/useRoom';
import { usePlayers } from '@/hooks/usePlayers';
import { useVotes } from '@/hooks/useVotes';
import { useGameActions } from '@/hooks/useGameActions';
import type { Room, Player, Vote } from '@/types/game';

// ---------------------------------------------------------------------------
// Context value type
// ---------------------------------------------------------------------------

interface GameContextValue {
  // Room state
  room: Room | null;
  roomLoading: boolean;
  roomError: string | null;

  // Players state
  players: Player[];
  playersLoading: boolean;
  playersError: string | null;

  // Votes state (current round)
  votes: Vote[];
  votesLoading: boolean;
  votesError: string | null;

  // Current player
  currentPlayerId: string | null;
  currentPlayer: Player | null;
  setCurrentPlayerId: (id: string) => void;

  // Game actions
  revealCard: () => Promise<void>;
  nextSpeaker: () => Promise<void>;
  castVote: (targetId: string) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const GameContext = createContext<GameContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface GameProviderProps {
  roomId: string;
  children: ReactNode;
}

export function GameProvider({ roomId, children }: GameProviderProps) {
  // ---- Room data ----------------------------------------------------------
  const {
    room,
    loading: roomLoading,
    error: roomError,
  } = useRoom(roomId);

  // ---- Players data -------------------------------------------------------
  const {
    players,
    loading: playersLoading,
    error: playersError,
  } = usePlayers(roomId);

  // ---- Current player ID from localStorage --------------------------------
  const storageKey = room ? `spy-game-player-${room.code}` : null;

  const [currentPlayerId, setCurrentPlayerIdState] = useState<string | null>(
    () => {
      if (typeof window === 'undefined') return null;
      if (!storageKey) return null;
      return localStorage.getItem(storageKey);
    }
  );

  // Re-sync from localStorage when the storageKey (room code) changes
  useEffect(() => {
    if (typeof window === 'undefined' || !storageKey) return;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setCurrentPlayerIdState(stored);
    }
  }, [storageKey]);

  const setCurrentPlayerId = (id: string) => {
    setCurrentPlayerIdState(id);
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, id);
    }
  };

  // ---- Derive current player from players list ----------------------------
  const currentPlayer = useMemo(() => {
    if (!currentPlayerId) return null;
    return players.find((p) => p.id === currentPlayerId) ?? null;
  }, [players, currentPlayerId]);

  // ---- Votes data (current round) -----------------------------------------
  const currentRound = room?.currentRound ?? 1;

  const {
    votes,
    loading: votesLoading,
    error: votesError,
  } = useVotes(roomId, currentRound);

  // ---- Game actions -------------------------------------------------------
  const { revealCard, nextSpeaker, castVote } = useGameActions({
    roomId,
    currentPlayerId,
    room,
    players,
  });

  // ---- Assemble context value ---------------------------------------------
  const value = useMemo<GameContextValue>(
    () => ({
      room,
      roomLoading,
      roomError,
      players,
      playersLoading,
      playersError,
      votes,
      votesLoading,
      votesError,
      currentPlayerId,
      currentPlayer,
      setCurrentPlayerId,
      revealCard,
      nextSpeaker,
      castVote,
    }),
    [
      room,
      roomLoading,
      roomError,
      players,
      playersLoading,
      playersError,
      votes,
      votesLoading,
      votesError,
      currentPlayerId,
      currentPlayer,
      // setCurrentPlayerId is stable (defined in component body but only changes with storageKey)
      revealCard,
      nextSpeaker,
      castVote,
    ]
  );

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a <GameProvider>');
  }
  return context;
}
