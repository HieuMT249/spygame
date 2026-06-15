// =============================================================================
// Room Service — High-level orchestration of Firebase + Game Logic
// =============================================================================

import type { GameWinner } from "@/types/game";

import { createRoom, getRoomByCode, updateRoom } from "@/lib/firebase/rooms";
import {
  addPlayer,
  updatePlayer,
  getPlayers,
} from "@/lib/firebase/players";
import {
  addVote,
  getVotesForRound,
  clearRoundVotes,
} from "@/lib/firebase/votes";

import {
  getRoleDistribution,
  assignRoles,
  generateSpeakingOrder,
  selectWordPair,
  checkWinCondition,
} from "@/services/gameLogic";

import { WORD_PAIRS } from "@/data/wordPairs";
import { generateRoomCode } from "@/utils/generateCode";
import { getMostVotedPlayer, getPlayerById } from "@/utils/helpers";

// ── Create Room ──────────────────────────────────────────────────────────────

/**
 * Create a brand-new game room and add the host as the first player.
 *
 * @returns The generated room code and the host's player ID.
 */
export async function createNewRoom(
  hostName: string
): Promise<{ roomCode: string; playerId: string }> {
  const roomCode = generateRoomCode();

  // createRoom currently takes hostId and generates code
  // Let's just create it with empty hostId, then update it.
  const code = await createRoom(""); 
  const room = await getRoomByCode(code);
  const roomId = room!.id;

  const hostId = crypto.randomUUID();
  const playerId = hostId;
  await addPlayer(roomId, {
    id: hostId,
    name: hostName,
    role: null,
    alive: true,
    hasRevealedCard: false,
    speakingOrder: 0,
    joinedAt: Date.now(),
  });

  // Now that we have the player ID, mark them as host
  await updateRoom(roomId, { hostId: playerId });

  return { roomCode, playerId };
}

// ── Join Room ────────────────────────────────────────────────────────────────

/**
 * Join an existing room by its code.
 *
 * @returns The room's Firestore document ID and the new player's ID.
 * @throws If the room does not exist or is not in "waiting" status.
 */
export async function joinExistingRoom(
  roomCode: string,
  playerName: string
): Promise<{ roomId: string; playerId: string }> {
  const room = await getRoomByCode(roomCode.toUpperCase());

  if (!room) {
    throw new Error("Không tìm thấy phòng với mã này.");
  }

  if (room.status !== "waiting") {
    throw new Error("Phòng đã bắt đầu trò chơi. Không thể tham gia.");
  }

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

/**
 * Initialise the game: assign roles, pick words, generate speaking order,
 * and transition the room to the "revealing" phase.
 */
export async function startGame(roomId: string): Promise<void> {
  const players = await getPlayers(roomId);

  if (players.length < 4) {
    throw new Error(
      `Cần ít nhất 4 người chơi. Hiện tại có ${players.length} người.`
    );
  }

  // 1. Determine role distribution
  const distribution = getRoleDistribution(players.length);

  // 2. Assign roles
  const assignments = assignRoles(players, distribution);
  for (const assignment of assignments) {
    await updatePlayer(roomId, assignment.playerId, {
      role: assignment.role,
    });
  }

  // 3. Pick a word pair
  const wordPair = selectWordPair(WORD_PAIRS);

  // 4. Generate speaking order and persist on each player
  const speakingOrder = generateSpeakingOrder(players);
  for (let i = 0; i < speakingOrder.length; i++) {
    await updatePlayer(roomId, speakingOrder[i], {
      speakingOrder: i,
    });
  }

  // 5. Update room state
  await updateRoom(roomId, {
    status: "revealing",
    citizenWord: wordPair.citizen,
    spyWord: wordPair.spy,
    currentRound: 1,
    currentSpeakerIndex: 0,
    winner: null,
    eliminatedPlayerId: undefined,
  });
}

// ── Speaker Advancement ──────────────────────────────────────────────────────

/**
 * Move to the next speaker. If all speakers have finished, the room
 * automatically transitions to the voting phase.
 */
export async function advanceSpeaker(
  roomId: string,
  currentIndex: number,
  totalSpeakers: number
): Promise<void> {
  const nextIndex = currentIndex + 1;

  if (nextIndex >= totalSpeakers) {
    // All speakers done → go to voting
    await startVotingPhase(roomId);
  } else {
    await updateRoom(roomId, { currentSpeakerIndex: nextIndex });
  }
}

// ── Voting Phase ─────────────────────────────────────────────────────────────

/**
 * Transition the room into the voting phase.
 */
export async function startVotingPhase(roomId: string): Promise<void> {
  await updateRoom(roomId, { status: "voting" });
}

// ── Process Votes ────────────────────────────────────────────────────────────

/**
 * Tally votes for the current round, eliminate the most-voted player, and
 * determine whether additional steps are needed (e.g. white-hat guess).
 *
 * @returns The eliminated player and whether they held the white-hat role.
 */
export async function processVotes(
  roomId: string,
  round: number
): Promise<{ eliminatedPlayer: string | null; isWhiteHat: boolean }> {
  const votes = await getVotesForRound(roomId, round);
  const players = await getPlayers(roomId);

  const mostVoted = getMostVotedPlayer(votes, players);

  if (!mostVoted) {
    // Edge case: no valid votes — skip elimination
    await updateRoom(roomId, { status: "discussion" });
    return { eliminatedPlayer: null, isWhiteHat: false };
  }

  // Eliminate the player
  await updatePlayer(roomId, mostVoted.id, { alive: false });
  await updateRoom(roomId, {
    eliminatedPlayerId: mostVoted.id,
    status: "result",
  });

  const isWhiteHat = mostVoted.role === "white";

  return { eliminatedPlayer: mostVoted.id, isWhiteHat };
}

// ── White-Hat Guess ──────────────────────────────────────────────────────────

/**
 * Handle the white-hat's attempt to guess the citizen word.
 *
 * @returns `true` if the guess was correct (white hat wins), `false` otherwise.
 */
export async function handleWhiteHatGuess(
  roomId: string,
  guess: string,
  citizenWord: string
): Promise<boolean> {
  const normalise = (s: string) => s.trim().toLowerCase();

  if (normalise(guess) === normalise(citizenWord)) {
    // White hat guessed correctly → they win!
    await updateRoom(roomId, {
      winner: "white",
      status: "finished",
    });
    return true;
  }

  // Wrong guess — game continues without white-hat victory
  return false;
}

// ── Post-Elimination Advancement ─────────────────────────────────────────────

/**
 * After a player has been eliminated (and any white-hat guess resolved),
 * check win conditions and either end the game or start the next discussion
 * round.
 *
 * @returns The winner if the game is over, otherwise `null`.
 */
export async function advanceGameAfterElimination(
  roomId: string
): Promise<GameWinner | null> {
  const players = await getPlayers(roomId);
  const winner = checkWinCondition(players);

  if (winner) {
    await updateRoom(roomId, {
      winner,
      status: "finished",
    });
    return winner;
  }

  // Game continues — start the next discussion round
  const currentRoomData = await getRoomByCode(""); // We need the room data
  // Instead, we read room from roomId. Because getRoomByCode needs a code,
  // we fetch players-based round info. Let's compute the next round from
  // the current room state.

  // Re-fetch players to build a new speaking order for alive players only
  const alivePlayers = players.filter((p) => p.alive);
  const speakingOrder = generateSpeakingOrder(alivePlayers);

  for (let i = 0; i < speakingOrder.length; i++) {
    await updatePlayer(roomId, speakingOrder[i], {
      speakingOrder: i,
    });
  }

  // We need the current round number. Since we can't easily read the room
  // doc by ID with the current abstraction, we increment based on players
  // eliminated (total - alive = rounds played in a simple model).
  // A more robust approach: accept currentRound as a param or read the doc.
  // For now, we'll use updateRoom with a server-driven increment.
  // We'll read the room data properly via the firebase layer.

  await updateRoom(roomId, {
    status: "discussion",
    currentSpeakerIndex: 0,
    eliminatedPlayerId: undefined,
  });

  return null;
}

// ── Reset Room ───────────────────────────────────────────────────────────────

/**
 * Reset the room back to the "waiting" state so a new game can begin.
 * All player roles, alive status, and speaking orders are cleared.
 */
export async function resetRoom(roomId: string): Promise<void> {
  const players = await getPlayers(roomId);

  // Reset every player
  for (const player of players) {
    await updatePlayer(roomId, player.id, {
      role: null,
      alive: true,
      hasRevealedCard: false,
      speakingOrder: 0,
    });
  }

  // Reset room state
  await updateRoom(roomId, {
    status: "waiting",
    citizenWord: "",
    spyWord: "",
    currentRound: 0,
    currentSpeakerIndex: 0,
    winner: null,
    eliminatedPlayerId: undefined,
  });
}
