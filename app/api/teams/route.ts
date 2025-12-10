import { NextRequest, NextResponse } from "next/server";
// import { closeConnection, connectToMongoDB, database } from "../config";
// import teamList from "../../../data/teamslist.json";
import Team from "@/models/Team";
import Player from "@/models/Player";
import '@/lib/db-init';
import { requireAuth, requireAdminOrManager, requireAdmin } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    // Require authentication - only admin or manager can create teams
    const authResult = await requireAdminOrManager(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { name, purse, owner, mentor, iconPlayer } = body;

    // Validate required fields
    if (!name || !owner || !mentor) {
      return NextResponse.json(
        { message: "Missing required fields: name, owner, and mentor are required" },
        { status: 400 }
      );
    }

    // Create new team
    const newTeam = await Team.create({
      name,
      purse: purse || 10000,
      owner,
      mentor,
      icon_player: iconPlayer || null,
    });

    return NextResponse.json(newTeam, { status: 201 });
  } catch (e) {
    console.error("Error creating team: ", e);
    return NextResponse.json(
      { message: "Failed to create team", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Require authentication - only admin or manager can update teams
    const authResult = await requireAdminOrManager(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { id, name, purse, owner, mentor, iconPlayer } = body;

    // Validate team ID
    if (!id) {
      return NextResponse.json(
        { message: "Team ID is required" },
        { status: 400 }
      );
    }

    // Find team
    const team = await Team.findByPk(id);
    if (!team) {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      );
    }

    // Update team with provided fields
    const updateData: Partial<typeof team> = {};
    if (name !== undefined) updateData.name = name;
    if (purse !== undefined) updateData.purse = purse;
    if (owner !== undefined) updateData.owner = owner;
    if (mentor !== undefined) updateData.mentor = mentor;
    if (iconPlayer !== undefined) updateData.icon_player = iconPlayer;

    await team.update(updateData);

    return NextResponse.json(team);
  } catch (e) {
    console.error("Error updating team: ", e);
    return NextResponse.json(
      { message: "Failed to update team", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Require authentication for accessing teams list
    // const authResult = await requireAuth(request);
    // if (authResult instanceof NextResponse) {
    //   return authResult;
    // }

    // Fetch all teams from the database
    const teams = await Team.findAll({
      attributes: ['id', 'name', 'purse', 'owner', 'mentor', 'image', 'icon_player'],
      order: [['id', 'ASC']],
    });

    return NextResponse.json(teams);
  } catch (e) {
    console.error("Error fetching teams: ", e);
    return NextResponse.json(
      { message: "Failed to fetch teams", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require admin authentication for delete operations
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate team ID
    if (!id) {
      return NextResponse.json(
        { message: "Team ID is required" },
        { status: 400 }
      );
    }

    // Find team
    const team = await Team.findByPk(parseInt(id));
    if (!team) {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      );
    }

    // Delete team
    await team.destroy();

    return NextResponse.json(
      { message: "Team deleted successfully", id: parseInt(id) },
      { status: 200 }
    );
  } catch (e) {
    console.error("Error deleting team: ", e);
    return NextResponse.json(
      { message: "Failed to delete team", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
