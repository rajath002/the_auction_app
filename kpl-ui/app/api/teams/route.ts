import { NextRequest, NextResponse } from "next/server";
import { closeConnection, connectToMongoDB, database } from "../config";
import teamList from "../../../data/teamslist.json";

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
    // await connectToMongoDB();
    // const teamCollection = database.collection("teams");
    // const teamsValues = await teamCollection.find({}).toArray();
    const teamsValues = teamList;
    return NextResponse.json(teamsValues);
  } catch (e) {
    console.log("Error !!!: ", e);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 400 }
    );
  } finally {
    // await closeConnection();
  }
}
