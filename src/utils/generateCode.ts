// =============================================================================
// Room Code Generator
// =============================================================================

/**
 * Characters used for room codes.
 * Excludes visually ambiguous characters: 0, O, 1, I, L.
 */
const ALLOWED_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

const CODE_LENGTH = 6;

/**
 * Generate a random room code consisting of 6 uppercase alphanumeric
 * characters (excluding confusing look-alikes such as 0/O, 1/I/L).
 */
export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    const index = Math.floor(Math.random() * ALLOWED_CHARS.length);
    code += ALLOWED_CHARS[index];
  }
  return code;
}
