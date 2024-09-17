import { Player } from "@/interface/interfaces";
import axios from "./api";
import playerData from "@/data/players.json";

export async function getPlayers(): Promise<Player[]> {
  try {
    const response = await axios.get("/api/players");
    return response.data;
    // return new Promise((resolve) => {
    //   resolve(playerData as any[]);
    // });
  } catch (error) {
    console.log("Error in player fetch ", error);
    return [];
  }
}

/**
 * @deprecated
 */
export async function downloadPlayersExcelSheet(apiLink: string): Promise<boolean> {
  try {
    const fileLink =  process.env.NEXT_PUBLIC_URL + "/player_data_template.xlsx";
    const response = await axios.get(apiLink,  { responseType: 'blob' });
    // return new Promise((resolve) => {
    //   resolve(playerData as any[]);
    // });
    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-excel.xlsx'; // Set the downloaded file name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.log("Error in player fetch ", error);
    return false;
  }
}

export async function uploadPlayersExcelSheet(payload: string[][]): Promise<boolean> {
  try {
    await axios.post("/api/players/upload", payload);
    return true;
  } catch (error) {
    console.log("Error in player fetch ", error);
    return false;
  }
}