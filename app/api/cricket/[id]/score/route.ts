import { NextRequest, NextResponse } from "next/server";
import CricketMatch from "@/models/CricketMatch";
import InningsScore from "@/models/InningsScore";
import BallByBall from "@/models/BallByBall";
import Team from "@/models/Team";
import '@/lib/db-init';
import { requireAdminOrManager } from "@/lib/api-auth";

// Helper function to calculate overs from balls
function calculateOvers(totalBalls: number): number {
  const completedOvers = Math.floor(totalBalls / 6);
  const remainingBalls = totalBalls % 6;
  return parseFloat(`${completedOvers}.${remainingBalls}`);
}

// GET score for a specific match
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const inningsNumber = searchParams.get('innings');

    const match = await CricketMatch.findByPk(id, {
      include: [
        { model: Team, as: 'team1', attributes: ['id', 'name', 'image'] },
        { model: Team, as: 'team2', attributes: ['id', 'name', 'image'] },
      ],
    });

    if (!match) {
      return NextResponse.json(
        { message: "Match not found" },
        { status: 404 }
      );
    }

    const inningsWhere: any = { match_id: id };
    if (inningsNumber) {
      inningsWhere.innings_number = parseInt(inningsNumber);
    }

    const inningsData = await InningsScore.findAll({
      where: inningsWhere,
      include: [
        { model: Team, as: 'battingTeam', attributes: ['id', 'name', 'image'] },
        { model: Team, as: 'bowlingTeam', attributes: ['id', 'name', 'image'] },
      ],
      order: [['innings_number', 'ASC']],
    });

    // Transform innings to include associations properly
    const innings = inningsData.map(inn => {
      const innJson = inn.toJSON();
      // Ensure associated teams are included
      const rawInn = inn.get({ plain: true }) as any;
      return {
        ...innJson,
        battingTeam: rawInn.battingTeam,
        bowlingTeam: rawInn.bowlingTeam,
      };
    });

    // Get current over balls if match is live
    let currentOverBalls: any[] = [];
    if (match.status === 'live' && inningsData.length > 0) {
      const currentInnings = inningsData.find(i => !i.is_completed);
      if (currentInnings) {
        const ballsData = await BallByBall.findAll({
          where: {
            innings_id: currentInnings.id,
          },
          order: [['over_number', 'DESC'], ['ball_number', 'DESC']],
          limit: 12, // Last 2 overs worth of balls
        });
        currentOverBalls = ballsData.map(b => b.toJSON());
      }
    }

    return NextResponse.json({
      match: match.toJSON(),
      innings,
      currentOverBalls,
    });
  } catch (e) {
    console.error("Error fetching score: ", e);
    return NextResponse.json(
      { message: "Failed to fetch score", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Record a ball/score update
export async function POST(
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
      runs,
      ballType,
      isWicket,
      wicketType,
      batsmanId,
      bowlerId,
      fielderId,
      dismissedBatsmanId,
      commentary,
    } = body;

    // Get match and current innings
    const match = await CricketMatch.findByPk(id);
    if (!match) {
      return NextResponse.json(
        { message: "Match not found" },
        { status: 404 }
      );
    }

    if (match.status !== 'live') {
      return NextResponse.json(
        { message: "Match is not live" },
        { status: 400 }
      );
    }

    const currentInnings = await InningsScore.findOne({
      where: { match_id: id, innings_number: match.current_innings, is_completed: false }
    });

    if (!currentInnings) {
      return NextResponse.json(
        { message: "No active innings found" },
        { status: 400 }
      );
    }

    // Count legal balls to determine current over and ball
    const legalBallsCount = await BallByBall.count({
      where: {
        innings_id: currentInnings.id,
        ball_type: ['normal', 'wicket', 'bye', 'leg_bye'],
      },
    });

    const currentOver = Math.floor(legalBallsCount / 6);
    const currentBall = legalBallsCount % 6;
    
    // Determine if this is a legal delivery
    const isLegalDelivery = !['wide', 'no_ball'].includes(ballType || 'normal');
    const newBallNumber = isLegalDelivery ? currentBall + 1 : currentBall;
    const newOverNumber = isLegalDelivery && newBallNumber > 6 ? currentOver + 1 : currentOver;

    // Create ball record
    const ballRecord = await BallByBall.create({
      innings_id: currentInnings.id,
      over_number: currentOver,
      ball_number: isLegalDelivery ? currentBall + 1 : currentBall,
      batsman_id: batsmanId || null,
      bowler_id: bowlerId || null,
      runs_scored: runs || 0,
      ball_type: isWicket ? 'wicket' : (ballType || 'normal'),
      is_boundary: runs === 4,
      is_six: runs === 6,
      is_wicket: isWicket || false,
      wicket_type: isWicket ? wicketType : null,
      fielder_id: fielderId || null,
      dismissed_batsman_id: isWicket ? (dismissedBatsmanId || batsmanId) : null,
      commentary: commentary || null,
    });

    // Update innings score
    const runsToAdd = runs || 0;
    let extrasToAdd = 0;
    let widesToAdd = 0;
    let noBallsToAdd = 0;
    let byesToAdd = 0;
    let legByesToAdd = 0;

    if (ballType === 'wide') {
      // Wide: 1 penalty + any runs scored (all counted as wides/extras)
      widesToAdd = 1 + runsToAdd;
      extrasToAdd = widesToAdd;
    } else if (ballType === 'no_ball') {
      // No ball: 1 penalty (extras) + runs scored (batsman runs, not extras)
      noBallsToAdd = 1;
      extrasToAdd = 1; // Only the penalty is extras, batsman runs are separate
    } else if (ballType === 'bye') {
      byesToAdd = runsToAdd;
      extrasToAdd = runsToAdd;
    } else if (ballType === 'leg_bye') {
      legByesToAdd = runsToAdd;
      extrasToAdd = runsToAdd;
    }

    const newLegalBallsCount = isLegalDelivery ? legalBallsCount + 1 : legalBallsCount;
    const newOvers = calculateOvers(newLegalBallsCount);

    await currentInnings.update({
      total_runs: currentInnings.total_runs + runsToAdd + extrasToAdd,
      wickets: currentInnings.wickets + (isWicket ? 1 : 0),
      overs_bowled: newOvers,
      extras: currentInnings.extras + extrasToAdd,
      wides: currentInnings.wides + widesToAdd,
      no_balls: currentInnings.no_balls + noBallsToAdd,
      byes: currentInnings.byes + byesToAdd,
      leg_byes: currentInnings.leg_byes + legByesToAdd,
    });

    // Check if innings should end (all out or overs completed)
    const totalOvers = match.overs;
    if (currentInnings.wickets >= 10 || newLegalBallsCount >= totalOvers * 6) {
      await currentInnings.update({ is_completed: true });
      
      if (match.current_innings === 1) {
        // Start second innings
        const newBattingTeamId = match.batting_team_id === match.team1_id ? match.team2_id : match.team1_id;
        const newBowlingTeamId = match.batting_team_id;

        await InningsScore.create({
          match_id: match.id,
          innings_number: 2,
          batting_team_id: newBattingTeamId,
          bowling_team_id: newBowlingTeamId!,
        });

        await match.update({
          current_innings: 2,
          batting_team_id: newBattingTeamId,
        });
      } else {
        // Match completed - determine winner
        const innings1 = await InningsScore.findOne({
          where: { match_id: id, innings_number: 1 }
        });
        const innings2 = currentInnings;

        let winnerId: number | undefined = undefined;
        let resultSummary = '';

        if (innings1 && innings2) {
          if (innings2.total_runs > innings1.total_runs) {
            winnerId = innings2.batting_team_id;
            const wicketsRemaining = 10 - innings2.wickets;
            resultSummary = `Won by ${wicketsRemaining} wicket${wicketsRemaining !== 1 ? 's' : ''}`;
          } else if (innings1.total_runs > innings2.total_runs) {
            winnerId = innings1.batting_team_id;
            const runsDiff = innings1.total_runs - innings2.total_runs;
            resultSummary = `Won by ${runsDiff} run${runsDiff !== 1 ? 's' : ''}`;
          } else {
            resultSummary = 'Match Tied';
          }
        }

        await match.update({
          status: 'completed',
          winner_id: winnerId,
          result_summary: resultSummary,
        });
      }
    }

    // Check if second innings team has won (chased target)
    if (match.current_innings === 2) {
      const innings1 = await InningsScore.findOne({
        where: { match_id: id, innings_number: 1 }
      });
      
      if (innings1 && currentInnings.total_runs > innings1.total_runs) {
        const wicketsRemaining = 10 - currentInnings.wickets;
        await currentInnings.update({ is_completed: true });
        await match.update({
          status: 'completed',
          winner_id: currentInnings.batting_team_id,
          result_summary: `Won by ${wicketsRemaining} wicket${wicketsRemaining !== 1 ? 's' : ''}`,
        });
      }
    }

    // Fetch updated score
    const updatedInnings = await InningsScore.findByPk(currentInnings.id, {
      include: [
        { model: Team, as: 'battingTeam', attributes: ['id', 'name'] },
        { model: Team, as: 'bowlingTeam', attributes: ['id', 'name'] },
      ],
    });

    return NextResponse.json({
      ball: ballRecord,
      innings: updatedInnings,
      match: await CricketMatch.findByPk(id),
    });
  } catch (e) {
    console.error("Error recording ball: ", e);
    return NextResponse.json(
      { message: "Failed to record ball", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Undo last ball
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

    const currentInnings = await InningsScore.findOne({
      where: { match_id: id, innings_number: match.current_innings }
    });

    if (!currentInnings) {
      return NextResponse.json(
        { message: "No innings found" },
        { status: 400 }
      );
    }

    // Get last ball
    const lastBall = await BallByBall.findOne({
      where: { innings_id: currentInnings.id },
      order: [['created_at', 'DESC']],
    });

    if (!lastBall) {
      return NextResponse.json(
        { message: "No balls to undo" },
        { status: 400 }
      );
    }

    // Calculate values to subtract
    const runsToSubtract = lastBall.runs_scored;
    const isLegalDelivery = !['wide', 'no_ball'].includes(lastBall.ball_type);
    
    let extrasToSubtract = 0;
    if (lastBall.ball_type === 'wide') {
      extrasToSubtract = 1 + lastBall.runs_scored;
    } else if (lastBall.ball_type === 'no_ball') {
      extrasToSubtract = 1;
    } else if (['bye', 'leg_bye'].includes(lastBall.ball_type)) {
      extrasToSubtract = lastBall.runs_scored;
    }

    // Count legal balls after removing this one
    const legalBallsCount = await BallByBall.count({
      where: {
        innings_id: currentInnings.id,
        ball_type: ['normal', 'wicket', 'bye', 'leg_bye'],
        id: { [require('sequelize').Op.ne]: lastBall.id },
      },
    });

    // Update innings
    await currentInnings.update({
      total_runs: Math.max(0, currentInnings.total_runs - runsToSubtract - extrasToSubtract),
      wickets: Math.max(0, currentInnings.wickets - (lastBall.is_wicket ? 1 : 0)),
      overs_bowled: calculateOvers(legalBallsCount),
      extras: Math.max(0, currentInnings.extras - extrasToSubtract),
      wides: Math.max(0, currentInnings.wides - (lastBall.ball_type === 'wide' ? extrasToSubtract : 0)),
      no_balls: Math.max(0, currentInnings.no_balls - (lastBall.ball_type === 'no_ball' ? 1 : 0)),
      byes: Math.max(0, currentInnings.byes - (lastBall.ball_type === 'bye' ? lastBall.runs_scored : 0)),
      leg_byes: Math.max(0, currentInnings.leg_byes - (lastBall.ball_type === 'leg_bye' ? lastBall.runs_scored : 0)),
      is_completed: false,
    });

    // Delete the ball
    await lastBall.destroy();

    // If match was completed, revert to live
    if (match.status === 'completed') {
      await match.update({ status: 'live' });
    }

    return NextResponse.json({ 
      message: "Last ball undone successfully",
      innings: await InningsScore.findByPk(currentInnings.id),
    });
  } catch (e) {
    console.error("Error undoing ball: ", e);
    return NextResponse.json(
      { message: "Failed to undo ball", error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
