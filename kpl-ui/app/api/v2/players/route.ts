import { NextRequest, NextResponse } from "next/server";
import Player from "@/models/Player";
import { connectDB } from "@/lib/sequelize";
import { requireAuth, requireAdminOrManager } from "@/lib/api-auth";

// POST - Create a new player
export async function POST(request: NextRequest) {
  try {
    // Require authentication - only admin or manager can create players
    const authResult = await requireAdminOrManager(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Connect to database
    await connectDB();
    
    // Parse request body
    const data = await request.json();
    
    // Map camelCase to snake_case for database
    const playerData: any = {
      name: data.name,
      image: data.image || '',
      type: data.type,
      category: data.category,
      current_bid: data.currentBid || data.stats?.currentBid || 0,
      base_value: data.baseValue || data.stats?.baseValue || 0,
      bid_value: data.bidValue || data.stats?.bidValue || 0,
      current_team_id: data.currentTeamId || data.stats?.currentTeamId || null,
      status: data.status || data.stats?.status || 'AVAILABLE',
    };
    
    // Create player in database
    const newPlayer = await Player.create(playerData);
    
    // Map snake_case back to camelCase for response
    const responseData = {
      id: newPlayer.id,
      name: newPlayer.name,
      image: newPlayer.image,
      type: newPlayer.type,
      category: newPlayer.category,
      currentBid: newPlayer.current_bid,
      baseValue: newPlayer.base_value,
      bidValue: newPlayer.bid_value,
      currentTeamId: newPlayer.current_team_id,
      status: newPlayer.status,
      createdAt: newPlayer.created_at,
      updatedAt: newPlayer.updated_at,
    };
    
    return NextResponse.json({
      success: true,
      message: 'Player created successfully',
      data: responseData,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating player:", error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create player',
      details: error.message,
    }, { status: 500 });
  }
}
