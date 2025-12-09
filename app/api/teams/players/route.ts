import { NextRequest, NextResponse } from "next/server";
import Team from "@/models/Team";
import Player from "@/models/Player";
import '@/lib/db-init';
import { getAdminOrManagerRole } from "@/lib/api-auth";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Require authentication for accessing teams with players
    const authResult = await getAdminOrManagerRole(request);
    // if (authResult instanceof NextResponse) {
    //   return authResult;
    // }

    const userRole = authResult;

    // Determine if user can see sensitive bid information
    const canSeeBidInfo = userRole === 'admin' || userRole === 'manager';

    let playerAttributes = ['id', 'name', 'image', 'type', 'category', 'current_bid', 'base_value', 'status'];
    if (userRole === 'admin' || userRole === 'manager') {
      playerAttributes.push('bid_value');
    }
    
    // Fetch all teams with their associated players
    const teamsWithPlayers = await Team.findAll({
      include: [
        {
          model: Player,
          as: 'players',
          where: {
            current_team_id: {
              [require('sequelize').Op.ne]: null // Only include players that belong to teams
            }
          },
          required: false, // LEFT JOIN to include teams with no players
          attributes: playerAttributes,
        }
      ],
      attributes: ['id', 'name', 'purse', 'owner', 'mentor', 'icon_player'],
      order: [
        ['id', 'ASC'],
        [{ model: Player, as: 'players' }, 'id', 'ASC']
      ],
    });

    // Filter sensitive player data for non-admin/non-manager users
    const filteredTeams = canSeeBidInfo
      ? teamsWithPlayers
      : teamsWithPlayers.map(team => {
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

    return NextResponse.json(filteredTeams);
  } catch (e) {
    console.error("Error fetching teams with players: ", e);
    return NextResponse.json(
      { message: "Failed to fetch teams with players", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}