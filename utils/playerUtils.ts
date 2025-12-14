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
  const lastPositionNames: string[] = (process.env.NEXT_PUBLIC_SP || "")
    .split(",")
    .map((name) => name.trim().toUpperCase())
    .filter(Boolean);

  const firstPositionNames: string[] = (process.env.NEXT_PUBLIC_FSP || "")
    .split(",")
    .map((name) => name.trim().toUpperCase())
    .filter(Boolean);

  // If no special players provided → normal Fisher–Yates shuffle
  if (lastPositionNames.length === 0 && firstPositionNames.length === 0) {
    return fisherYatesShuffle(players);
  }

  const firstPositionCount = 30;
  const positionCount = 30;

  // Separate players into three groups
  const firstPositionPlayers = players.filter((p: Player) =>
    firstPositionNames.includes(p.name?.toUpperCase())
  );

  const lastPositionPlayers = players.filter((p: Player) =>
    lastPositionNames.includes(p.name?.toUpperCase()) &&
    !firstPositionNames.includes(p.name?.toUpperCase()) // Don't duplicate if in both lists
  );

  const otherPlayers = players.filter(
    (p: Player) =>
      !firstPositionNames.includes(p.name?.toUpperCase()) &&
      !lastPositionNames.includes(p.name?.toUpperCase())
  );

  // Shuffle the "others"
  const shuffledOthers = fisherYatesShuffle(otherPlayers);

  // Prepare first positions array
  const firstPositions: (Player | null)[] = new Array(firstPositionCount).fill(null);

  // Shuffle first-position players
  const shuffledFirstPosition = fisherYatesShuffle(firstPositionPlayers);

  // Generate random positions for first players using Fisher–Yates
  const firstAvailablePositions = Array.from({ length: firstPositionCount }, (_, i) => i);
  const shuffledFirstAvailablePositions = fisherYatesShuffle(firstAvailablePositions);

  // Place first-position players in random first positions
  shuffledFirstPosition.forEach((player, idx) => {
    firstPositions[shuffledFirstAvailablePositions[idx]] = player;
  });

  // Fill remaining first positions with random "other players"
  const remainingFirstSlots = firstPositionCount - firstPositionPlayers.length;
  const othersForFirst = shuffledOthers.splice(-remainingFirstSlots);

  let firstFillIndex = 0;
  for (let i = 0; i < firstPositionCount; i++) {
    if (firstPositions[i] === null) {
      firstPositions[i] = othersForFirst[firstFillIndex++];
    }
  }

  // Prepare last positions array
  const lastPositions: (Player | null)[] = new Array(positionCount).fill(null);

  // Shuffle last-position players
  const shuffledLastPosition = fisherYatesShuffle(lastPositionPlayers);

  // Generate random positions for last players using Fisher–Yates
  const lastAvailablePositions = Array.from({ length: positionCount }, (_, i) => i);
  const shuffledLastAvailablePositions = fisherYatesShuffle(lastAvailablePositions);

  // Place last-position players in random last positions
  shuffledLastPosition.forEach((player, idx) => {
    lastPositions[shuffledLastAvailablePositions[idx]] = player;
  });

  // Fill remaining last positions with random "other players"
  const remainingLastSlots = positionCount - lastPositionPlayers.length;
  const othersForLast = shuffledOthers.splice(-remainingLastSlots);

  let lastFillIndex = 0;
  for (let i = 0; i < positionCount; i++) {
    if (lastPositions[i] === null) {
      lastPositions[i] = othersForLast[lastFillIndex++];
    }
  }

  const finalResult = [
    ...(firstPositions as Player[]),
    ...shuffledOthers,
    ...(lastPositions as Player[])
  ];

  return finalResult;
}
