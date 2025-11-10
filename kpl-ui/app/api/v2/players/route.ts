import { NextRequest, NextResponse } from 'next/server';
import { Player, Team } from '@/models';
import { PlayerType, PlayerCategory, PlayerStatus } from '@/models/Player';
import { Op } from 'sequelize';

// GET all players with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const teamId = searchParams.get('teamId');

    // Build where clause based on filters
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (category) where.category = category;
    if (teamId) where.current_team_id = parseInt(teamId);

    const players = await Player.findAll({
      where,
      include: [
        {
          model: Team,
          as: 'currentTeam',
          required: false,
        },
      ],
      order: [['id', 'ASC']],
    });

    return NextResponse.json(players, { status: 200 });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players', message: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create new player(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle bulk creation
    if (Array.isArray(body)) {
      const players = await Player.bulkCreate(body);
      return NextResponse.json(players, { status: 201 });
    }
    
    const {
      baseValue,
      bidValue,
      currentTeamId,
      status,
    } = body.stats || {};

    // Handle single player creation
    const player = await Player.create({
      name: body.name,
      image: body.image,
      type: body.type as PlayerType,
      category: body.category as PlayerCategory,
      base_value: baseValue || body.baseValue,
      current_bid: body.current_bid || body.currentBid || 0,
      bid_value: bidValue || body.bidValue,
      current_team_id: currentTeamId || body.currentTeamId,
      status: status as PlayerStatus,
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: 'Failed to create player', message: String(error) },
      { status: 500 }
    );
  }
}

// PATCH - Update a player
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, _id, ...updateData } = body;
    const playerId = id || _id;

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    const player = await Player.findByPk(playerId);
    
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // Map camelCase to snake_case if needed
    const mappedData: any = {};
    if (updateData.currentTeamId !== undefined) mappedData.current_team_id = updateData.currentTeamId;
    if (updateData.current_team_id !== undefined) mappedData.current_team_id = updateData.current_team_id;
    if (updateData.bidValue !== undefined) mappedData.bid_value = updateData.bidValue;
    if (updateData.bid_value !== undefined) mappedData.bid_value = updateData.bid_value;
    if (updateData.currentBid !== undefined) mappedData.current_bid = updateData.currentBid;
    if (updateData.current_bid !== undefined) mappedData.current_bid = updateData.current_bid;
    if (updateData.baseValue !== undefined) mappedData.base_value = updateData.baseValue;
    if (updateData.base_value !== undefined) mappedData.base_value = updateData.base_value;
    if (updateData.status !== undefined) mappedData.status = updateData.status;
    if (updateData.name !== undefined) mappedData.name = updateData.name;
    if (updateData.image !== undefined) mappedData.image = updateData.image;
    if (updateData.type !== undefined) mappedData.type = updateData.type;
    if (updateData.category !== undefined) mappedData.category = updateData.category;

    await player.update(mappedData);

    return NextResponse.json({ success: true, result: player }, { status: 200 });
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json(
      { error: 'Failed to update player', message: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Delete a player
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    const player = await Player.findByPk(id);
    
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    await player.destroy();

    return NextResponse.json(
      { message: 'Player deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json(
      { error: 'Failed to delete player', message: String(error) },
      { status: 500 }
    );
  }
}
