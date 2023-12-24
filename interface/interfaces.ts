export interface Team {
  id: number;
  name: string;
  purse: number;
  owner: string;
  mentor: string;
  iconPlayer: string;
}

export type PlayerStatus = "SOLD" | "UNSOLD" | null;

// Player data model
export interface Player {
  id: number;
  name: string;
  image: string;
  stats: {
    baseValue: number;
    bidValue: number;
    currentTeamId: number | null;
    status: PlayerStatus;
  };
  currentBid: number;
  type: string;
}
