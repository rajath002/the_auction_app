import { NextRequest, NextResponse } from "next/server";
import Team from "@/models/Team";
import Player from "@/models/Player";
import '@/lib/db-init';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = parseInt(params.id);

    if (isNaN(teamId)) {
      return NextResponse.json(
        { message: "Invalid team ID. Must be a number." },
        { status: 400 }
      );
    }

    // Fetch team with associated players
    const team = await Team.findByPk(teamId, {
      include: [
        {
          model: Player,
          as: 'players',
          required: false, // LEFT JOIN to include team even if no players
          attributes: ['id', 'name', 'image', 'type', 'category', 'current_bid', 'base_value', 'bid_value', 'status'],
        }
      ],
      attributes: ['id', 'name', 'purse', 'owner', 'mentor', 'icon_player'],
      order: [
        [{ model: Player, as: 'players' }, 'id', 'ASC']
      ],
    });

    if (!team) {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(team);
  } catch (e) {
    console.error("Error fetching team by ID: ", e);
    return NextResponse.json(
      { message: "Failed to fetch team", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}