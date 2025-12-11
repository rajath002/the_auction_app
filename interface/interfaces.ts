export interface Team {
  id: number;
  name: string;
  purse: number;
  owner: string;
  mentor: string;
  iconPlayer: string;
  image?: string;
}

export type PlayerStatus = "SOLD" | "UNSOLD" | "AVAILABLE" | "In-Progress";

// Player data model
export interface Player {
  id: number;
  name: string;
  image: string;
    baseValue: number;
    bidValue: number;
    currentTeamId: number | null;
    status: PlayerStatus;
  currentBid: number;
  type: string;
  category: string;
  role?: string;
}
