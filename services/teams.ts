import { Team } from "@/interface/interfaces";
import axios from "./api";

export async function getTeams(): Promise<Team[]> {
  try {
    const response = await axios.get("/api/teams");
    return response.data;
  } catch (error) {
    console.log("Error in Teams fetch ", error);
    return [];
  }
}
