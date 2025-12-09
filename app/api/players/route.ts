import { NextRequest, NextResponse } from "next/server";
import playersOld from "@/data/playerslist-old.json";
// import { connectToMongoDB, database, client, closeConnection } from "../config";
import players from "@/data/players.json";
import Player, { PlayerCategory, PlayerStatus, PlayerType } from "@/models/Player";
import { connectDB } from "@/lib/sequelize";
import { requireAuth, requireAdminOrManager, getAdminOrManagerRole } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    // Require authentication - only admin or manager can create players
    const authResult = await requireAdminOrManager(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    
    // Handle bulk creation
    if (Array.isArray(body)) {
      const players = await Player.bulkCreate(body);
      return NextResponse.json(players, { status: 201 });
    }
    
    // const {
    //   baseValue,
    //   bidValue,
    //   currentTeamId,
    //   status,
    // } = body.stats || {};

    // // Handle single player creation
    // const player = await Player.create({
    //   name: body.name,
    //   image: body.image,
    //   type: body.type as PlayerType,
    //   category: body.category as PlayerCategory,
    //   base_value: baseValue || body.baseValue,
    //   current_bid: body.current_bid || body.currentBid || 0,
    //   bid_value: bidValue || body.bidValue,
    //   current_team_id: currentTeamId || body.currentTeamId,
    //   status: PlayerStatus.AVAILABLE,
    // });

    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: 'Failed to create player', message: String(error) },
      { status: 500 }
    );
  }
}


export async function PATCH(req: NextRequest) {
  try {
    // Require authentication - only admin or manager can update players
    const authResult = await requireAdminOrManager(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

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
    // Require authentication for accessing players list
    // const authResult = await requireAuth(request);
    // const adminOrManager = await requireAdminOrManager(request);
    const userRole = await getAdminOrManagerRole(request);

    const playerAttributes = ['id', 'name', 'image', 'type', 'category', 'current_team_id', 'current_bid', 'base_value', 'status', 'created_at', 'updated_at'];
    if (userRole === 'admin' || userRole === 'manager') {
      playerAttributes.push('bid_value');
    }
  
    // if (authResult instanceof NextResponse) {
    //   return authResult;
    // }

    // const { session } = authResult;
    // const userRole = session.user.role;

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
    
    // Determine if user can see sensitive bid information
    const canSeeBidInfo = userRole === 'admin' || userRole === 'manager';
    
    // Fetch players from database with optional filters
    const result = await Player.findAll({
      where: whereClause,
      order: [['id', 'ASC']],
      attributes: playerAttributes,
    });

    // Filter sensitive data for non-admin/non-manager users
    const filteredResult = canSeeBidInfo
      ? result
      : result.map(player => {
          const playerData = player.toJSON();
          return {
            ...playerData,
            // current_bid: null,
            // bid_value: null,
            // base_value: null,
          };
        });
    
    return NextResponse.json({
      success: true,
      count: filteredResult.length,
      data: filteredResult,
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

export async function DELETE(req: NextRequest) {
  // Require admin authentication for delete operations
  const authResult = await requireAdminOrManager(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  return NextResponse.json({ message: "Not Implemented" }, { status: 501 });
}
