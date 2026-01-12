import { NextRequest, NextResponse } from "next/server";
import CricketMatch from "@/models/CricketMatch";
import InningsScore from "@/models/InningsScore";
import BallByBall from "@/models/BallByBall";
import Team from "@/models/Team";
import Player from "@/models/Player";
import '@/lib/db-init';
import { requireAdminOrManager } from "@/lib/api-auth";

// GET match by ID with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const match = await CricketMatch.findByPk(id, {
      include: [
        { model: Team, as: 'team1', attributes: ['id', 'name', 'image'] },
        { model: Team, as: 'team2', attributes: ['id', 'name', 'image'] },
        { model: Team, as: 'battingTeam', attributes: ['id', 'name'] },
        { model: Team, as: 'winner', attributes: ['id', 'name'] },
        { 
          model: InningsScore, 
          as: 'innings',
          include: [
            { model: Team, as: 'battingTeam', attributes: ['id', 'name'] },
            { model: Team, as: 'bowlingTeam', attributes: ['id', 'name'] },
          ]
        },
      ],
    });

    if (!match) {
      return NextResponse.json(
        { message: "Match not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(match);
  } catch (e) {
    console.error("Error fetching match: ", e);
    return NextResponse.json(
      { message: "Failed to fetch match", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH - Update match (start match, update toss, end innings, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminOrManager(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      action, 
      tossWinnerId, 
      tossDecision, 
      status, 
      winnerId, 
      resultSummary 
    } = body;

    const match = await CricketMatch.findByPk(id);
    if (!match) {
      return NextResponse.json(
        { message: "Match not found" },
        { status: 404 }
      );
    }

    // Handle different actions
    if (action === 'start_match') {
      if (!tossWinnerId || !tossDecision) {
        return NextResponse.json(
          { message: "Toss winner and decision required to start match" },
          { status: 400 }
        );
      }

      // Determine batting team based on toss
      const battingTeamId = tossDecision === 'bat' ? tossWinnerId : 
        (tossWinnerId === match.team1_id ? match.team2_id : match.team1_id);
      const bowlingTeamId = battingTeamId === match.team1_id ? match.team2_id : match.team1_id;

      await match.update({
        toss_winner_id: tossWinnerId,
        toss_decision: tossDecision,
        status: 'live',
        batting_team_id: battingTeamId,
        current_innings: 1,
      });

      // Create first innings
      await InningsScore.create({
        match_id: match.id,
        innings_number: 1,
        batting_team_id: battingTeamId,
        bowling_team_id: bowlingTeamId,
      });
    } 
    else if (action === 'end_innings') {
      const currentInnings = await InningsScore.findOne({
        where: { match_id: match.id, innings_number: match.current_innings }
      });

      if (currentInnings) {
        await currentInnings.update({ is_completed: true });
      }

      if (match.current_innings === 1) {
        // Start second innings
        const newBattingTeamId = match.batting_team_id === match.team1_id ? match.team2_id : match.team1_id;
        const newBowlingTeamId = match.batting_team_id;

        await match.update({
          status: 'innings_break',
          current_innings: 2,
          batting_team_id: newBattingTeamId,
        });

        // Create second innings
        await InningsScore.create({
          match_id: match.id,
          innings_number: 2,
          batting_team_id: newBattingTeamId,
          bowling_team_id: newBowlingTeamId!,
        });

        // Update to live after brief break
        await match.update({ status: 'live' });
      } else {
        // Match completed
        await match.update({ status: 'completed' });
      }
    }
    else if (action === 'end_match') {
      await match.update({
        status: 'completed',
        winner_id: winnerId || null,
        result_summary: resultSummary || null,
      });
    }
    else if (action === 'abandon') {
      await match.update({
        status: 'abandoned',
        result_summary: resultSummary || 'Match abandoned',
      });
    }
    else {
      // Generic update
      const updateData: any = {};
      if (status) updateData.status = status;
      if (winnerId !== undefined) updateData.winner_id = winnerId;
      if (resultSummary !== undefined) updateData.result_summary = resultSummary;
      
      await match.update(updateData);
    }

    // Fetch updated match with associations
    const updatedMatch = await CricketMatch.findByPk(id, {
      include: [
        { model: Team, as: 'team1', attributes: ['id', 'name', 'image'] },
        { model: Team, as: 'team2', attributes: ['id', 'name', 'image'] },
        { model: Team, as: 'battingTeam', attributes: ['id', 'name'] },
        { model: Team, as: 'winner', attributes: ['id', 'name'] },
        { model: InningsScore, as: 'innings' },
      ],
    });

    return NextResponse.json(updatedMatch);
  } catch (e) {
    console.error("Error updating match: ", e);
    return NextResponse.json(
      { message: "Failed to update match", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE match
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminOrManager(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;

    const match = await CricketMatch.findByPk(id);
    if (!match) {
      return NextResponse.json(
        { message: "Match not found" },
        { status: 404 }
      );
    }

    await match.destroy();

    return NextResponse.json({ message: "Match deleted successfully" });
  } catch (e) {
    console.error("Error deleting match: ", e);
    return NextResponse.json(
      { message: "Failed to delete match", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
