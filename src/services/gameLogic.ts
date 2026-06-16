// =============================================================================
// Game Logic — Pure functions that drive the game rules
// =============================================================================

import type { Player, PlayerRole, GameWinner, WordPair } from "@/types/game";
import { getAlivePlayers, getAlivePlayersByRole } from "@/utils/helpers";

// ── Types ────────────────────────────────────────────────────────────────────

export interface RoleDistribution {
  spies: number;
  whiteHats: number;
}

export interface RoleAssignment {
  playerId: string;
  role: PlayerRole;
}

// ── Role distribution ────────────────────────────────────────────────────────

/**
 * Determine how many spies and white-hat players there should be based on the
 * total player count.
 *
 * | Players | Spies | White Hats |
 * |---------|-------|------------|
 * | 4 – 6   |   1   |     1      |
 * | 7 – 9   |   2   |     1      |
 * | 10+     |   3   |     1      |
 */
export function getRoleDistribution(playerCount: number): RoleDistribution {
  if (playerCount < 4) {
    throw new Error(
      `Cần ít nhất 4 người chơi để bắt đầu. Hiện tại có ${playerCount} người.`
    );
  }

  if (playerCount <= 6) {
    return { spies: 1, whiteHats: 1 };
  }
  if (playerCount <= 9) {
    return { spies: 2, whiteHats: 1 };
  }
  return { spies: 3, whiteHats: 1 };
}

// ── Role assignment ──────────────────────────────────────────────────────────

/**
 * Fisher–Yates shuffle (in-place) — returns a new shuffled copy.
 */
function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Assign roles to every player according to the given distribution.
 * Players are shuffled before assignment so roles are randomised.
 */
export function assignRoles(
  players: Player[],
  distribution: RoleDistribution
): RoleAssignment[] {
  const shuffled = shuffle(players);

  const assignments: RoleAssignment[] = [];
  let index = 0;

  // Assign spy roles
  for (let i = 0; i < distribution.spies; i++) {
    assignments.push({ playerId: shuffled[index].id, role: "spy" });
    index++;
  }

  // Assign white-hat roles
  for (let i = 0; i < distribution.whiteHats; i++) {
    assignments.push({ playerId: shuffled[index].id, role: "white" });
    index++;
  }

  // Remaining players are citizens
  while (index < shuffled.length) {
    assignments.push({ playerId: shuffled[index].id, role: "citizen" });
    index++;
  }

  return assignments;
}

/**
 * Generate a random turn order for alive players.
 * Returns an array of player IDs in random sequence.
 */
export function generateTurnOrder(players: Player[]): string[] {
  return shuffle(players.filter(p => p.alive)).map(p => p.id);
}

// ── Speaking order ───────────────────────────────────────────────────────────

/**
 * Generate a random speaking order for the given players.
 * Returns an array of player IDs in the speaking sequence.
 */
export function generateSpeakingOrder(players: Player[]): string[] {
  const shuffled = shuffle(players);
  return shuffled.map((p) => p.id);
}

// ── Word selection ───────────────────────────────────────────────────────────

/**
 * Pick a random word pair from the available list.
 */
export function selectWordPair(wordPairs: WordPair[]): WordPair {
  if (wordPairs.length === 0) {
    throw new Error("Danh sách từ trống. Không thể chọn cặp từ.");
  }
  const index = Math.floor(Math.random() * wordPairs.length);
  return wordPairs[index];
}

// ── Win-condition check ──────────────────────────────────────────────────────

/**
 * Evaluate whether the game has reached a terminal state.
 *
 * Rules:
 * - **Citizens win** when all spies have been eliminated (white hat may be
 *   alive or dead — doesn't matter).
 * - **Spies win** when the number of alive citizens (including white hat)
 *   is less than or equal to the number of alive spies.
 * - **White hat wins** if they guess the citizen word correctly (handled
 *   separately via `handleWhiteHatGuess`).
 * - Returns `null` if the game should continue.
 */
export function checkWinCondition(players: Player[]): GameWinner | null {
  const aliveSpies = getAlivePlayersByRole(players, "spy");
  const aliveCitizens = getAlivePlayersByRole(players, "citizen");
  const aliveWhiteHats = getAlivePlayersByRole(players, "white");

  // All spies eliminated → citizens win
  if (aliveSpies.length === 0) {
    return "citizen";
  }

  // Non-spy alive count (citizens + white hats) ≤ alive spies → spies win
  const nonSpyAlive = aliveCitizens.length + aliveWhiteHats.length;
  if (nonSpyAlive <= aliveSpies.length) {
    return "spy";
  }

  // Game continues
  return null;
}