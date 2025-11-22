import { NextRequest, NextResponse } from "next/server";
import Player from "@/models/Player";
import { connectDB } from "@/lib/sequelize";
import { requireAdminOrManager } from "@/lib/api-auth";

// DELETE - Delete a specific player by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication - only admin or manager can delete players
    const authResult = await requireAdminOrManager(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Connect to database
    await connectDB();
    
    const playerId = parseInt(params.id);
    
    // Validate player ID
    if (isNaN(playerId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid player ID',
      }, { status: 400 });
    }
    
    // Find player by ID
    const player = await Player.findByPk(playerId);
    
    if (!player) {
      return NextResponse.json({
        success: false,
        error: 'Player not found',
      }, { status: 404 });
    }
    
    // Delete the player
    await player.destroy();
    
    return NextResponse.json({
      success: true,
      message: 'Player deleted successfully',
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error deleting player:", error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete player',
      details: error.message,
    }, { status: 500 });
  }
}

// GET - Get a specific player by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to database
    await connectDB();
    
    const playerId = parseInt(params.id);
    
    // Validate player ID
    if (isNaN(playerId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid player ID',
      }, { status: 400 });
    }
    
    // Find player by ID
    const player = await Player.findByPk(playerId);
    
    if (!player) {
      return NextResponse.json({
        success: false,
        error: 'Player not found',
      }, { status: 404 });
    }
    
    // Map snake_case to camelCase for response
    const responseData = {
      id: player.id,
      name: player.name,
      image: player.image,
      type: player.type,
      category: player.category,
      currentBid: player.current_bid,
      baseValue: player.base_value,
      bidValue: player.bid_value,
      currentTeamId: player.current_team_id,
      status: player.status,
      createdAt: player.created_at,
      updatedAt: player.updated_at,
    };
    
    return NextResponse.json({
      success: true,
      data: responseData,
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error fetching player:", error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch player',
      details: error.message,
    }, { status: 500 });
  }
}
