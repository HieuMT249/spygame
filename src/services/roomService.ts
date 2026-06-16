// =============================================================================
// Room Service — High-level orchestration of Firebase + Game Logic
// =============================================================================

import type { GameWinner } from "@/types/game";

import { createRoom, getRoomByCode, getRoomById, updateRoom, deleteRoomField } from "@/lib/firebase/rooms";
import { addPlayer, updatePlayer, getPlayers, deleteAllPlayers } from "@/lib/firebase/players";


import {
  getRoleDistribution,
  assignRoles,
  selectWordPair,
  checkWinCondition,
  generateTurnOrder,
} from "@/services/gameLogic";

import { WORD_PAIRS } from "@/data/wordPairs";
import { getMostVotedPlayer } from "@/utils/helpers";
import { getVotesForRound, clearAllVotes, clearRoundVotes } from "@/lib/firebase/votes";

// ── Create Room ──────────────────────────────────────────────────────────────

export async function createNewRoom(
  hostName: string
): Promise<{ roomCode: string; playerId: string }> {
  const hostId = crypto.randomUUID();
  const code = await createRoom(hostId);

  const room = await getRoomByCode(code);
  if (!room) throw new Error("Không thể tạo phòng.");

  await addPlayer(room.id, {
    id: hostId,
    name: hostName,
    role: null,
    alive: true,
    hasRevealedCard: false,
    speakingOrder: 0,
    joinedAt: Date.now(),
  });

  return { roomCode: code, playerId: hostId };
}

// ── Join Room ────────────────────────────────────────────────────────────────

export async function joinExistingRoom(
  roomCode: string,
  playerName: string
): Promise<{ roomId: string; playerId: string }> {
  const room = await getRoomByCode(roomCode.toUpperCase());

  if (!room) throw new Error("Không tìm thấy phòng với mã này.");
  if (room.status !== "waiting") throw new Error("Phòng đã bắt đầu trò chơi. Không thể tham gia.");

  const playerId = crypto.randomUUID();
  await addPlayer(room.id, {
    id: playerId,
    name: playerName,
    role: null,
    alive: true,
    hasRevealedCard: false,
    speakingOrder: 0,
    joinedAt: Date.now(),
  });

  return { roomId: room.id, playerId };
}

// ── Start Game ───────────────────────────────────────────────────────────────

export async function startGame(roomId: string): Promise<void> {
  const players = await getPlayers(roomId);

  if (players.length < 4) {
    throw new Error(`Cần ít nhất 4 người chơi. Hiện tại có ${players.length} người.`);
  }

  const distribution = getRoleDistribution(players.length);
  const assignments = assignRoles(players, distribution);
  for (const a of assignments) {
    await updatePlayer(roomId, a.playerId, { role: a.role });
  }

  const wordPair = selectWordPair(WORD_PAIRS);
  const turnOrder = generateTurnOrder(players);

  await updateRoom(roomId, {
    status: "revealing",
    citizenWord: wordPair.citizen,
    spyWord: wordPair.spy,
    currentRound: 1,
    currentSpeakerIndex: 0,
    winner: null,
    turnOrder,
  });
  await deleteRoomField(roomId, "eliminatedPlayerId");
}

// ── Process Votes ────────────────────────────────────────────────────────────

export async function processVotes(
  roomId: string,
  round: number
): Promise<{ eliminatedPlayer: string | null; isWhiteHat: boolean }> {
  const votes = await getVotesForRound(roomId, round);
  const players = await getPlayers(roomId);
  const mostVoted = getMostVotedPlayer(votes, players);

  if (!mostVoted) {
    // Hoà phiếu — xóa votes vòng này, UI sẽ thông báo và cho vote lại
    await clearRoundVotes(roomId, round);
    return { eliminatedPlayer: null, isWhiteHat: false };
  }

  await updatePlayer(roomId, mostVoted.id, { alive: false });
  await updateRoom(roomId, {
    eliminatedPlayerId: mostVoted.id,
    status: "result",
  });

  return { eliminatedPlayer: mostVoted.id, isWhiteHat: mostVoted.role === "white" };
}

// ── White-Hat Guess ──────────────────────────────────────────────────────────

export async function handleWhiteHatGuess(
  roomId: string,
  guess: string,
  citizenWord: string
): Promise<boolean> {
  const normalise = (s: string) => s.trim().toLowerCase();
  if (normalise(guess) === normalise(citizenWord)) {
    await updateRoom(roomId, { winner: "white", status: "finished" });
    return true;
  }
  return false;
}

// ── Advance Game After Elimination ──────────────────────────────────────────
// Sau result/whitehat-guess → kiểm tra win condition → voting vòng mới

export async function advanceGameAfterElimination(
  roomId: string
): Promise<GameWinner | null> {
  const players = await getPlayers(roomId);
  const winner = checkWinCondition(players);

  if (winner) {
    await updateRoom(roomId, { winner, status: "finished" });
    return winner;
  }

  const room = await getRoomById(roomId);
  const nextRound = (room?.currentRound ?? 1) + 1;
  const alivePlayers = players.filter((p) => p.alive);
  const turnOrder = generateTurnOrder(alivePlayers);

  await updateRoom(roomId, {
    status: "voting",
    currentRound: nextRound,
    turnOrder,
  });
  await deleteRoomField(roomId, "eliminatedPlayerId");

  return null;
}

// ── Disband Room ─────────────────────────────────────────────────────────────

export async function disbandRoom(roomId: string): Promise<void> {
  await clearAllVotes(roomId);
  await deleteAllPlayers(roomId);
  const { deleteRoom } = await import("@/lib/firebase/rooms");
  await deleteRoom(roomId);
}

// ── Reset Room ───────────────────────────────────────────────────────────────

export async function resetRoom(roomId: string): Promise<void> {
  const players = await getPlayers(roomId);

  for (const player of players) {
    await updatePlayer(roomId, player.id, {
      role: null,
      alive: true,
      hasRevealedCard: false,
      speakingOrder: 0,
    });
  }

  await updateRoom(roomId, {
    status: "waiting",
    citizenWord: "",
    spyWord: "",
    currentRound: 0,
    currentSpeakerIndex: 0,
    winner: null,
    turnOrder: [],
  });
  await deleteRoomField(roomId, "eliminatedPlayerId");
  await clearAllVotes(roomId);
}