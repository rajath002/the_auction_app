import { NextRequest, NextResponse } from "next/server";
import teamList from "@/data/teamslist.json";
import { client, database } from "../config";

export async function POST(request: NextRequest) {
  const js = await request.json();
  console.log("Request ", request.body);
  return NextResponse.json(js);
}

export async function PATCH() {
  return NextResponse.json({ success: "raj" });
}

export async function GET() {
  try {
    await client.connect();
    const teamCollection = database.collection("teams");
    const teamsValues = await teamCollection.find({}).toArray();
    return NextResponse.json(teamsValues);
  } catch (e) {
    console.log("Error !!!: ", e);
    NextResponse.json({message: "Something went wrong"}, {status: 400});
  } finally {
    await client.close();
  }
}
