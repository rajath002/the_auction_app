import { NextRequest, NextResponse } from "next/server";
import playersOld from "@/data/playerslist-old.json";
import { connectToMongoDB, database, client, closeConnection } from "../config";
import players from "@/data/players.json";

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();
    const playersCollection = database.collection("players");
    const result = await playersCollection.insertMany(playersOld);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "Something went Wrong!" },
      { status: 500 }
    );
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
    const id = data.id;
    // const _id = data._id;
    delete data.id;
    delete data._id;
    await playersCollection.updateOne({ id }, { $set: { ...data } });
    return NextResponse.json({ success: "raj", result: data });
  } catch (error) {
    console.error("something went wrong", error);
    return NextResponse.json(error, { status: 500 });
  } finally {
    closeConnection();
    console.log("finally executed");
  }
}

export async function GET() {
  try {
    // connectToMongoDB();
    // await client.connect();
    // const playersCollection = database.collection("players");
    // const result = await playersCollection.find().toArray();
    const result = players;
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log("Error : ", error);
    return NextResponse.json(error, { status: 500 });
  } finally {
    // closeConnection();
  }
}

export async function DELETE() {
  return NextResponse.json({ message: "Not Implemented" }, { status: 501 });
}
