import { NextRequest, NextResponse } from "next/server";
import teamList from "@/data/teamslist.json";
import { closeConnection, connectToMongoDB, database } from "../config";

export async function POST(request: NextRequest) {
  const js = await request.json();
  console.log("Request ", request.body);
  NextResponse.json(js);
  return;
}

export async function PATCH() {
  return NextResponse.json({ success: "raj" });
}

export async function GET() {
  try {
    await connectToMongoDB();;
    const teamCollection = database.collection("teams");
    const teamsValues = await teamCollection.find({}).toArray();
    NextResponse.json(teamsValues);
  } catch (e) {
    console.log("Error !!!: ", e);
    NextResponse.json({message: "Something went wrong"}, {status: 400});
  } finally {
    await closeConnection();
  }
  return;
}
