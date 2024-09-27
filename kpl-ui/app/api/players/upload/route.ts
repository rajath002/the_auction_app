import { Player } from "@/interface/interfaces";
import { insertMultiplePlayers } from "@/utils/database/database";
import { ReadExcelFileData } from "@/utils/fileUtils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as string[][];
    const playersInfo: Player[] = [];
    // Read the data from the payload, payload is a json[][] data
    let foundHeader = false;
    const headerMap = new Map<number, string>();

    payload.map((row: any[], i) => {
      // Check if the row is empty
      if (row.length === 0) return null;

      if (!foundHeader) {
        const header = row.map((cell: string) => cell.toLowerCase());
        if (
          header.includes("name") &&
          header.includes("phone") &&
          header.includes("email")
        ) {
          foundHeader = true;
          row.map((cell: string, index) => {
            headerMap.set(index, cell);
          });
        }
        return null;
      }
      const player = {} as Player;
       // Regex to match 'baseValue', 'bidValue', 'currentTeamId', or 'status'
      const regex = /^(baseValue|bidValue|currentTeamId|status)$/;
      
      row.map((cell: string, index) => {
        if (headerMap.get(index)) {
          // write a regex code to match with : baseValue, bidValue, currentTeamId, status
          if(regex.test(headerMap.get(index) as string)){
            if (!player.stats) {
              player.stats = {} as any;
            }
            player.stats[headerMap.get(index) as string] = cell;
          } else {
            player[headerMap.get(index) as string] = cell;
          }
        }
      });
      playersInfo.push({...player, vID: crypto.randomUUID()});
    });

    // Upload the data to the server
    await insertMultiplePlayers(playersInfo);


    return NextResponse.json({
      message: "File data uploaded successfully",
      data: playersInfo,
    });
  } catch (error) {
    console.error("Something went wrong:", error);
    return NextResponse.json(
      { message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
