import { NextRequest, NextResponse } from 'next/server';
import { Team, Player } from '@/models';
import { requireAuth, requireAdminOrManager, requireAdmin } from '@/lib/api-auth';

// GET all teams with their players
export async function GET(request: NextRequest) {
  try {
    // Require authentication for accessing teams list
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { session } = authResult;
    const userRole = session.user.role;

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

    // Determine if user can see sensitive bid information
    const canSeeBidInfo = userRole === 'admin' || userRole === 'manager';

    // Filter sensitive player data for non-admin/non-manager users
    const filteredTeams = canSeeBidInfo
      ? teams
      : teams.map(team => {
          const teamData = team.toJSON();
          return {
            ...teamData,
            players: teamData.players?.map((player: any) => ({
              ...player,
              current_bid: null,
              bid_value: null,
              base_value: null,
            })) || [],
          };
        });

    return NextResponse.json(filteredTeams, { status: 200 });
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
    // Require authentication - only admin or manager can create teams
    const authResult = await requireAdminOrManager(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

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
    // Require authentication - only admin or manager can update teams
    const authResult = await requireAdminOrManager(request);
    // if (authResult instanceof NextResponse) {
    //   return authResult;
    // }

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
