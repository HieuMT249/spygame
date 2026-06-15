import { createRoom as fbCreateRoom, getRoomByCode } from '@/lib/firebase/rooms';
import { addPlayer } from '@/lib/firebase/players';
import { Player } from '@/types/game';
import { toast } from 'sonner';

export const useGameActions = () => {
  const createRoom = async (hostName: string): Promise<{ code: string, roomId: string, playerId: string }> => {
    const hostId = crypto.randomUUID();
    const code = await fbCreateRoom(hostId);
    
    // Immediately after creating, we need to know the roomId.
    // In our current fbCreateRoom, it sets doc and returns code, but we don't know the roomId it generated unless we change it.
    // Let's get the room by code to find its ID.
    const room = await getRoomByCode(code);
    if (!room) throw new Error("Failed to create room");

    const hostPlayer: Player = {
      id: hostId,
      name: hostName,
      role: null,
      alive: true,
      hasRevealedCard: false,
      speakingOrder: 0,
      joinedAt: Date.now(),
    };

    await addPlayer(room.id, hostPlayer);

    return { code, roomId: room.id, playerId: hostId };
  };

  const joinRoom = async (code: string, playerName: string): Promise<{ roomId: string, playerId: string }> => {
    const room = await getRoomByCode(code.toUpperCase());
    if (!room) {
      throw new Error("Không tìm thấy phòng");
    }

    if (room.status !== "waiting") {
      throw new Error("Phòng đã bắt đầu chơi");
    }

    const playerId = crypto.randomUUID();
    const player: Player = {
      id: playerId,
      name: playerName,
      role: null,
      alive: true,
      hasRevealedCard: false,
      speakingOrder: 0,
      joinedAt: Date.now(),
    };

    await addPlayer(room.id, player);

    return { roomId: room.id, playerId };
  };

  return { createRoom, joinRoom };
};
