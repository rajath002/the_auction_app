import { NextRequest, NextResponse } from "next/server";
import Team from "@/models/Team";
import Player from "@/models/Player";
import '@/lib/db-init';

export async function GET() {
  try {
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
          attributes: ['id', 'name', 'image', 'type', 'category', 'current_bid', 'base_value', 'bid_value', 'status'],
        }
      ],
      attributes: ['id', 'name', 'purse', 'owner', 'mentor', 'icon_player'],
      order: [
        ['id', 'ASC'],
        [{ model: Player, as: 'players' }, 'id', 'ASC']
      ],
    });

    console.log('---------> ', JSON.stringify(teamsWithPlayers, null, 2));

    return NextResponse.json(teamsWithPlayers);
  } catch (e) {
    console.error("Error fetching teams with players: ", e);
    return NextResponse.json(
      { message: "Failed to fetch teams with players", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}