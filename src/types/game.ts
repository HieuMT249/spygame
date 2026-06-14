// =============================================================================
// Game Types & Interfaces — "Ai Là Gián Điệp"
// =============================================================================

/** Possible states a game room can be in. */
export type GameStatus =
  | "waiting"
  | "revealing"
  | "discussion"
  | "voting"
  | "result"
  | "whitehat-guess"
  | "finished";

/** Roles that can be assigned to players. */
export type PlayerRole = "citizen" | "spy" | "white";

/** Who won the game (null = game still in progress). */
export type GameWinner = "citizen" | "spy" | "white" | null;

/** A pair of words: one for citizens, one for the spy. */
export interface WordPair {
  citizen: string;
  spy: string;
}

/** Represents a game room. */
export interface Room {
  id: string;
  code: string;
  status: GameStatus;
  citizenWord: string;
  spyWord: string;
  currentRound: number;
  currentSpeakerIndex: number;
  hostId: string;
  createdAt: Date;
  winner: GameWinner;
  eliminatedPlayerId: string | null;
}

/** Represents a player in a room. */
export interface Player {
  id: string;
  name: string;
  role: PlayerRole | null;
  alive: boolean;
  hasRevealedCard: boolean;
  speakingOrder: number;
  joinedAt: Date;
}

/** Represents a single vote cast during a round. */
export interface Vote {
  id: string;
  voterId: string;
  targetId: string;
  round: number;
}

/** Shape of the React context that drives all game state & actions. */
export interface GameContextType {
  // ── State ──────────────────────────────────────────────────────────────
  room: Room | null;
  players: Player[];
  currentPlayer: Player | null;
  votes: Vote[];
  loading: boolean;
  error: string | null;

  // ── Room actions ───────────────────────────────────────────────────────
  createRoom: (hostName: string) => Promise<void>;
  joinRoom: (roomCode: string, playerName: string) => Promise<void>;
  startGame: () => Promise<void>;
  resetRoom: () => Promise<void>;

  // ── Gameplay actions ───────────────────────────────────────────────────
  revealCard: () => Promise<void>;
  advanceSpeaker: () => Promise<void>;
  startVoting: () => Promise<void>;
  castVote: (targetId: string) => Promise<void>;
  submitWhiteHatGuess: (guess: string) => Promise<boolean>;

  // ── Utility actions ────────────────────────────────────────────────────
  clearError: () => void;
}
