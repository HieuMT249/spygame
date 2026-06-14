'use client';

import { useCallback } from 'react';
import { updateRoomData } from '@/lib/firebase/rooms';
import { updatePlayerData } from '@/lib/firebase/players';
import { addVote, hasPlayerVoted } from '@/lib/firebase/votes';
import type { Room, Player, GameStatus } from '@/types/game';

interface UseGameActionsParams {
  roomId: string | null;
  currentPlayerId: string | null;
  room: Room | null;
  players: Player[];
}

interface UseGameActionsReturn {
  revealCard: () => Promise<void>;
  nextSpeaker: () => Promise<void>;
  castVote: (targetId: string) => Promise<void>;
}

export function useGameActions({
  roomId,
  currentPlayerId,
  room,
  players,
}: UseGameActionsParams): UseGameActionsReturn {
  const revealCard = useCallback(async () => {
    if (!roomId || !currentPlayerId) {
      throw new Error('Missing roomId or currentPlayerId');
    }

    await updatePlayerData(roomId, currentPlayerId, {
      hasRevealedCard: true,
    });
  }, [roomId, currentPlayerId]);

  const nextSpeaker = useCallback(async () => {
    if (!roomId || !room) {
      throw new Error('Missing roomId or room data');
    }

    const alivePlayers = players
      .filter((p) => p.alive)
      .sort((a, b) => a.speakingOrder - b.speakingOrder);

    if (alivePlayers.length === 0) {
      return;
    }

    const nextIndex = room.currentSpeakerIndex + 1;

    if (nextIndex >= alivePlayers.length) {
      // All speakers have spoken — transition to voting phase
      await updateRoomData(roomId, {
        status: 'voting' as GameStatus,
        currentSpeakerIndex: 0,
      });
    } else {
      // Advance to next speaker
      await updateRoomData(roomId, {
        currentSpeakerIndex: nextIndex,
      });
    }
  }, [roomId, room, players]);

  const castVote = useCallback(
    async (targetId: string) => {
      if (!roomId || !currentPlayerId || !room) {
        throw new Error('Missing roomId, currentPlayerId, or room data');
      }

      // Check if the player has already voted this round
      const alreadyVoted = await hasPlayerVoted(
        roomId,
        currentPlayerId,
        room.currentRound
      );

      if (alreadyVoted) {
        throw new Error('You have already voted this round');
      }

      await addVote(roomId, {
        voterId: currentPlayerId,
        targetId,
        round: room.currentRound,
      });
    },
    [roomId, currentPlayerId, room]
  );

  return { revealCard, nextSpeaker, castVote };
}
