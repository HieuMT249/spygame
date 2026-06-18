import { createNewRoom, joinExistingRoom } from '@/services/roomService';

export const useGameActions = () => {
  const createRoom = async (hostName: string): Promise<{ code: string; roomId: string; playerId: string }> => {
    const { roomCode, playerId } = await createNewRoom(hostName);
    return { code: roomCode, roomId: '', playerId };
  };

  const joinRoom = async (code: string, playerName: string): Promise<{ roomId: string; playerId: string }> => {
    return await joinExistingRoom(code, playerName);
  };

  return { createRoom, joinRoom };
};