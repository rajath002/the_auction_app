import { NextResponse } from "next/server";
import Player from "@/models/Player";
import Team from "@/models/Team";
import { Sequelize, Op } from 'sequelize';
import '@/lib/db-init';

export async function GET() {
  try {
    // Get total players count
    const totalPlayers = await Player.count();

    // Get total teams count
    const totalTeams = await Team.count();

    // Get sold players count and total auction value
    const soldPlayersData = await Player.findAll({
      where: {
        status: 'SOLD'
      },
      attributes: ['bid_value']
    });

    const soldPlayers = soldPlayersData.length;
    const totalAuctionValue = soldPlayersData.reduce((sum, player) => {
      return sum + (player.bid_value || 0);
    }, 0);

    // Get team-wise player spending breakdown
    const teamPlayerSpending = await Player.findAll({
      where: {
        status: 'SOLD',
        current_team_id: {
          [Op.ne]: null as any
        }
      },
      include: [{
        model: Team,
        as: 'currentTeam',
        attributes: ['name']
      }],
      attributes: ['id', 'name', 'bid_value', 'current_team_id'],
      order: [['current_team_id', 'ASC'], ['bid_value', 'DESC']]
    });

    // Group by team and calculate team totals and player breakdowns
    const teamBreakdowns: { [key: number]: { teamName: string, totalSpent: number, players: any[] } } = {};

    teamPlayerSpending.forEach(player => {
      const teamId = player.current_team_id!;
      const teamName = (player as any).currentTeam?.name || 'Unknown Team';
      const amount = player.bid_value || 0;

      if (!teamBreakdowns[teamId]) {
        teamBreakdowns[teamId] = {
          teamName,
          totalSpent: 0,
          players: []
        };
      }

      teamBreakdowns[teamId].totalSpent += amount;
      teamBreakdowns[teamId].players.push({
        playerId: player.id,
        playerName: player.name,
        amount: amount
      });
    });

    // Convert to array and calculate percentages
    const teamSpendingData = Object.values(teamBreakdowns).map((team: any) => {
      const teamTotal = team.totalSpent;
      const playersWithPercentage = team.players.map((player: any) => ({
        ...player,
        percentage: teamTotal > 0 ? ((player.amount / teamTotal) * 100).toFixed(1) : '0'
      }));

      return {
        teamId: Object.keys(teamBreakdowns).find(key => teamBreakdowns[parseInt(key)] === team),
        teamName: team.teamName,
        totalSpent: team.totalSpent,
        players: playersWithPercentage
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json({
      totalPlayers,
      totalTeams,
      totalAuctionValue,
      soldPlayers,
      teamSpending: teamSpendingData
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { message: "Failed to fetch analytics data", error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}