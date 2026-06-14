// =============================================================================
// Helper Utilities — Pure functions used across the app
// =============================================================================

import type { Player, PlayerRole, Vote } from "@/types/game";

// ── Player lookups ───────────────────────────────────────────────────────────

/** Find a player by their ID. Returns `undefined` if not found. */
export function getPlayerById(
  players: Player[],
  id: string
): Player | undefined {
  return players.find((p) => p.id === id);
}

/** Return only the players that are still alive. */
export function getAlivePlayers(players: Player[]): Player[] {
  return players.filter((p) => p.alive);
}

/** Return alive players that match a specific role. */
export function getAlivePlayersByRole(
  players: Player[],
  role: PlayerRole
): Player[] {
  return players.filter((p) => p.alive && p.role === role);
}

// ── Vote helpers ─────────────────────────────────────────────────────────────

/** Count how many votes a specific player received. */
export function countVotesForPlayer(votes: Vote[], playerId: string): number {
  return votes.filter((v) => v.targetId === playerId).length;
}

/**
 * Determine the alive player with the most votes.
 * In case of a tie, one of the tied players is chosen at random.
 * Returns `undefined` if there are no votes or no alive players.
 */
export function getMostVotedPlayer(
  votes: Vote[],
  players: Player[]
): Player | undefined {
  const alive = getAlivePlayers(players);
  if (alive.length === 0 || votes.length === 0) return undefined;

  // Build a map: playerId → vote count
  const voteCounts = new Map<string, number>();
  for (const vote of votes) {
    voteCounts.set(vote.targetId, (voteCounts.get(vote.targetId) ?? 0) + 1);
  }

  // Find the maximum vote count among alive players
  let maxVotes = 0;
  for (const player of alive) {
    const count = voteCounts.get(player.id) ?? 0;
    if (count > maxVotes) {
      maxVotes = count;
    }
  }

  if (maxVotes === 0) return undefined;

  // Collect all alive players tied at the max
  const topPlayers = alive.filter(
    (p) => (voteCounts.get(p.id) ?? 0) === maxVotes
  );

  // Break ties randomly
  const randomIndex = Math.floor(Math.random() * topPlayers.length);
  return topPlayers[randomIndex];
}

// ── Display helpers ──────────────────────────────────────────────────────────

/** Map a role to its Vietnamese display name. */
export function formatRole(role: PlayerRole | null): string {
  switch (role) {
    case "citizen":
      return "Dân thường";
    case "spy":
      return "Gián điệp";
    case "white":
      return "Mũ trắng";
    default:
      return "Chưa xác định";
  }
}

/** CSS colour classes keyed by role (Tailwind-friendly). */
export function getRoleColor(role: PlayerRole | null): string {
  switch (role) {
    case "citizen":
      return "text-blue-600 bg-blue-100";
    case "spy":
      return "text-red-600 bg-red-100";
    case "white":
      return "text-gray-700 bg-gray-100";
    default:
      return "text-gray-400 bg-gray-50";
  }
}

/** Emoji icon for each role. */
export function getRoleIcon(role: PlayerRole | null): string {
  switch (role) {
    case "citizen":
      return "👤";
    case "spy":
      return "🕵️";
    case "white":
      return "🎩";
    default:
      return "❓";
  }
}
