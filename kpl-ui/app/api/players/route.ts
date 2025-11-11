import { NextRequest, NextResponse } from "next/server";
import playersOld from "@/data/playerslist-old.json";
import { connectToMongoDB, database, client, closeConnection } from "../config";
import players from "@/data/players.json";
import Player from "@/models/Player";
import { connectDB } from "@/lib/sequelize";

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

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const teamId = searchParams.get('teamId');
    
    // Build where clause based on query parameters
    const whereClause: any = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (teamId) {
      whereClause.current_team_id = parseInt(teamId);
    }
    
    // Fetch players from database with optional filters
    const result = await Player.findAll({
      where: whereClause,
      order: [['id', 'ASC']],
      attributes: [
        'id',
        'name',
        'image',
        'type',
        'category',
        'current_bid',
        'base_value',
        'bid_value',
        'current_team_id',
        'status',
        'created_at',
        'updated_at',
      ],
    });
    
    return NextResponse.json({
      success: true,
      count: result.length,
      data: result,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching players:", error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch players',
      details: error.message,
    }, { status: 500 });
  }
}

export async function DELETE() {
  return NextResponse.json({ message: "Not Implemented" }, { status: 501 });
}
