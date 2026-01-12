import { NextRequest, NextResponse } from "next/server";
import CricketMatch from "@/models/CricketMatch";
import InningsScore from "@/models/InningsScore";
import Team from "@/models/Team";
import '@/lib/db-init';
import { requireAuth, requireAdminOrManager } from "@/lib/api-auth";

// GET all matches or filtered matches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const matches = await CricketMatch.findAll({
      where: whereClause,
      include: [
        { model: Team, as: 'team1', attributes: ['id', 'name', 'image'] },
        { model: Team, as: 'team2', attributes: ['id', 'name', 'image'] },
        { model: Team, as: 'battingTeam', attributes: ['id', 'name'] },
        { model: Team, as: 'winner', attributes: ['id', 'name'] },
        { model: InningsScore, as: 'innings' },
      ],
      order: [['match_date', 'DESC'], ['created_at', 'DESC']],
      limit,
    });

    return NextResponse.json(matches);
  } catch (e) {
    console.error("Error fetching matches: ", e);
    return NextResponse.json(
      { message: "Failed to fetch matches", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create new match
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminOrManager(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { matchName, team1Id, team2Id, venue, matchDate, overs } = body;

    // Validate required fields
    if (!matchName || !team1Id || !team2Id || !matchDate) {
      return NextResponse.json(
        { message: "Missing required fields: matchName, team1Id, team2Id, matchDate are required" },
        { status: 400 }
      );
    }

    // Validate teams exist
    const team1 = await Team.findByPk(team1Id);
    const team2 = await Team.findByPk(team2Id);
    
    if (!team1 || !team2) {
      return NextResponse.json(
        { message: "One or both teams not found" },
        { status: 404 }
      );
    }

    if (team1Id === team2Id) {
      return NextResponse.json(
        { message: "Team 1 and Team 2 cannot be the same" },
        { status: 400 }
      );
    }

    const newMatch = await CricketMatch.create({
      match_name: matchName,
      team1_id: team1Id,
      team2_id: team2Id,
      venue: venue || null,
      match_date: matchDate,
      overs: overs || 20,
      status: 'upcoming',
      current_innings: 1,
    });

    // Fetch with associations
    const matchWithDetails = await CricketMatch.findByPk(newMatch.id, {
      include: [
        { model: Team, as: 'team1', attributes: ['id', 'name', 'image'] },
        { model: Team, as: 'team2', attributes: ['id', 'name', 'image'] },
      ],
    });

    return NextResponse.json(matchWithDetails, { status: 201 });
  } catch (e) {
    console.error("Error creating match: ", e);
    return NextResponse.json(
      { message: "Failed to create match", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
