import { Player } from "@/interface/interfaces";
import axios from "./api";

type GetPlayersResponse = {
  success: boolean;
  data: Player[];
  count: number;
}

export async function getPlayers(): Promise<GetPlayersResponse> {
  try {
    const response = await axios.get("/api/players");
    return response.data;
  } catch (error) {
    console.log("Error in player fetch ", error);
    return { success: false, data: [], count: 0 };
  }
}


export async function createPlayer(playerData: Partial<Player>): Promise<Player | null> {
  try {
    const response = await axios.post("/api/v2/players", playerData);
    return response.data;
  } catch (error) {
    console.error("Error creating player:", error);
    return null;
  }
}