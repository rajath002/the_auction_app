import { Player } from "@/interface/interfaces";

/**
 * Fisher–Yates shuffle
 */
function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffles players array
 * @param players - Array of all players
 * @returns Shuffled array of players
 */
export function ShufflePlayers(players: Player[]): Player[] {
    return fisherYatesShuffle(players);
}
