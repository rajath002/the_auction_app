import { NextRequest, NextResponse } from 'next/server';
import Player from '@/models/Player';
import '@/lib/db-init';

// GET - Fetch all players for a team
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const players = await Player.findAll({
      where: { current_team_id: parseInt(id) },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'image', 'type', 'category', 'role'],
    });

    return NextResponse.json({
      success: true,
      players: players.map(p => p.toJSON()),
    });
  } catch (error) {
    console.error('Error fetching team players:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team players' },
      { status: 500 }
    );
  }
}
