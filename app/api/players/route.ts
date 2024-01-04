import { NextRequest, NextResponse } from "next/server";
import players from "@/data/playerslist.json";
import { connectToMongoDB, database, client, closeConnection } from "../config";

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();
    const playersCollection = database.collection("players");
    const result = await playersCollection.insertMany(players);
    return NextResponse.json(result);
  } catch (error) {
    NextResponse.json({ message: "Something went Wrong!" }, { status: 500 });
  } finally {
    client.close();
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectToMongoDB();
    const playersCollection = database.collection("players");
    console.log("Request received here");
    const data = await req.json();
    const result = await playersCollection.updateOne(
      { id: data.id },
      { $set: { data } }
    );
    return NextResponse.json({ success: "raj", result: data });
  } catch (error) {
    console.error("something went wrong", error);
  } finally {
    closeConnection();
    console.log("finally executed");
  }
  return NextResponse.json({}, { status: 400 });
}

export async function GET(req: NextRequest) {
  try {
    debugger;
    connectToMongoDB();
    await client.connect();
    const playersCollection = database.collection("players");
    const result = await playersCollection.find().toArray();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log("Error : ", error);
  } finally {
    closeConnection();
  }
}

export async function DELETE() {
  return;
}
