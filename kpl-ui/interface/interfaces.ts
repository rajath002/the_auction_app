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
  vID: string;
  name: string;
  image: string;
  phone: number;
  email: string;
  stats: {
    baseValue: number;
    bidValue: number;
    currentTeamId: number | null;
    status: PlayerStatus;
  };
  currentBid: number;
  type: string;
  category: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  teams: Team[];
  players: Player[];
  status: string;
  isDeleted: boolean;
}