import { NextRequest, NextResponse } from "next/server";
import players from "@/data/playerslist.json";
import { getClient, database, client } from "../config";

export async function POST(request: NextRequest) {
  try {
    const client = getClient();
    await client.connect();
    const playersCollection = database.collection("players");
    const result = await playersCollection.insertMany(players);
    return NextResponse.json(result);
  } catch (error) {
    NextResponse.json({ message: "Something went Wrong!" }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function PATCH() {
  return NextResponse.json({ success: "raj" });
}

export async function GET() {
  return NextResponse.json(players);
}

export async function DELETE () {
  return 
}
