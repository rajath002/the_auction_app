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

export async function addTeam(team: Omit<Team, 'id'>): Promise<Team | null> {
  try {
    const response = await axios.post("/api/teams", team);
    return response.data;
  } catch (error) {
    console.error("Error adding team: ", error);
    return null;
  }
}

export async function updateTeam(team: Partial<Team> & { id: number }): Promise<Team | null> {
  try {
    const response = await axios.patch("/api/teams", team);
    return response.data;
  } catch (error) {
    console.error("Error updating team: ", error);
    return null;
  }
}

export async function deleteTeam(id: number): Promise<boolean> {
  try {
    await axios.delete(`/api/teams?id=${id}`);
    return true;
  } catch (error) {
    console.error("Error deleting team: ", error);
    return false;
  }
}
