import { Player } from "@/interface/interfaces";
import axios from "./api";

export async function getPlayers(): Promise<Player[]> {
  try {
    const response = await axios.get("/api/players");
    return response.data;
  } catch (error) {
    console.log("Error in player fetch ", error);
    return [];
  }
}
