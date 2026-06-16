export type PlayerRole = "citizen" | "spy" | "white";

export type GameStatus =
  | "waiting"
  | "revealing"
  | "discussion"
  | "voting"
  | "result"
  | "whitehat-guess"
  | "finished";

export type GameWinner = "citizen" | "spy" | "white";

export interface WordPair {
  citizen: string;
  spy: string;
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole | null;
  alive: boolean;
  hasRevealedCard: boolean;
  speakingOrder: number;
  joinedAt: number; // Timestamp milliseconds
  avatarUrl?: string;
}

export interface Room {
  id: string;
  code: string;
  status: GameStatus;
  citizenWord: string;
  spyWord: string;
  currentRound: number;
  currentSpeakerIndex: number;
  hostId: string;
  createdAt: number;
  winner: GameWinner | null;
  eliminatedPlayerId?: string;
  turnOrder: string[]; // mảng playerId theo thứ tự random mỗi vòng
}

export interface Vote {
  voterId: string;
  targetId: string;
  round: number;
}