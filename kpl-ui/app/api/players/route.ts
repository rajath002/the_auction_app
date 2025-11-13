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
    // Connect to database
    await connectDB();
    
    // Parse request body
    const data = await req.json();
    const { id, ...updateData } = data;
    
    // Validate player ID
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Player ID is required',
      }, { status: 400 });
    }
    
    // Find player by ID
    const player = await Player.findByPk(id);
    
    if (!player) {
      return NextResponse.json({
        success: false,
        error: 'Player not found',
      }, { status: 404 });
    }
    
    // Map camelCase to snake_case and build update object
    const fieldMapping: Record<string, string> = {
      'name': 'name',
      'image': 'image',
      'type': 'type',
      'category': 'category',
      'currentBid': 'current_bid',
      'baseValue': 'base_value',
      'bidValue': 'bid_value',
      'currentTeamId': 'current_team_id',
      'status': 'status',
    };
    
    const fieldsToUpdate: any = {};
    for (const [camelKey, snakeKey] of Object.entries(fieldMapping)) {
      if (updateData[camelKey] !== undefined) {
        fieldsToUpdate[snakeKey] = updateData[camelKey];
      }
    }
    
    // Update player
    await player.update(fieldsToUpdate);
    
    return NextResponse.json({
      success: true,
      message: 'Player updated successfully',
      data: player,
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error updating player:", error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update player',
      details: error.message,
    }, { status: 500 });
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
