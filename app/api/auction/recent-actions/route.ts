import { NextRequest, NextResponse } from 'next/server';
import { Player, Team } from '@/models';
import { PlayerStatus } from '@/types/player-enums';
import { connectDB } from '@/lib/sequelize';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const players = await Player.findAll({
      where: {
        status: [PlayerStatus.SOLD, PlayerStatus.UNSOLD],
      },
      include: [
        {
          model: Team,
          as: 'currentTeam',
          required: false,
        },
      ],
      order: [['updated_at', 'DESC']],
      attributes: { exclude: ['bid_value'] },
    });

    return NextResponse.json({ data: players }, { status: 200 });
  } catch (error) {
    console.error('Error fetching recent actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent actions', message: String(error) },
      { status: 500 }
    );
  }
}