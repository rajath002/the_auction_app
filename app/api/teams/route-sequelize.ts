import { NextRequest, NextResponse } from 'next/server';
import { Team, Player } from '@/models';

// GET all teams with their players
export async function GET() {
  try {
    const teams = await Team.findAll({
      include: [
        {
          model: Player,
          as: 'players',
          required: false, // LEFT JOIN to include teams without players
        },
      ],
      order: [['id', 'ASC']],
    });

    return NextResponse.json(teams, { status: 200 });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams', message: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create a new team
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const team = await Team.create({
      name: body.name,
      purse: body.purse || 10000,
      owner: body.owner,
      mentor: body.mentor,
      icon_player: body.icon_player,
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team', message: String(error) },
      { status: 500 }
    );
  }
}

// PATCH - Update a team
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    const team = await Team.findByPk(id);
    
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    await team.update(updateData);

    return NextResponse.json(team, { status: 200 });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Failed to update team', message: String(error) },
      { status: 500 }
    );
  }
}
