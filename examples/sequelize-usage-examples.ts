/**
 * Example Usage of PostgreSQL + Sequelize in KPL Auction App
 * This file demonstrates how to use the new database setup
 */

import { NextRequest, NextResponse } from 'next/server';
import { Team, Player, User, AuctionEvent } from '@/models';
import { PlayerStatus, PlayerType, PlayerCategory } from '@/models/Player';
import {
  getAllTeamsWithPlayers,
  getAvailablePlayers,
  assignPlayerToTeam,
  recordBid,
  getAuctionStats,
  authenticateUser,
} from '@/lib/db-queries';

// ============================================
// EXAMPLE 1: Simple CRUD Operations
// ============================================

// Get all teams
export async function exampleGetTeams() {
  const teams = await Team.findAll();
  return teams;
}

// Create a new team
export async function exampleCreateTeam() {
  const newTeam = await Team.create({
    name: 'New Team',
    purse: 10000,
    owner: 'Owner Name',
    mentor: 'Mentor Name',
    icon_player: 'Icon Player',
  });
  return newTeam;
}

// Update a team
export async function exampleUpdateTeam(teamId: number) {
  const team = await Team.findByPk(teamId);
  if (!team) throw new Error('Team not found');
  
  await team.update({
    purse: team.purse - 1000, // Deduct from purse
  });
  
  return team;
}

// ============================================
// EXAMPLE 2: Relationships & Joins
// ============================================

// Get team with all its players
export async function exampleGetTeamWithPlayers(teamId: number) {
  const team = await Team.findByPk(teamId, {
    include: [
      {
        model: Player,
        as: 'players',
        where: { status: PlayerStatus.SOLD }, // Only sold players
        required: false, // LEFT JOIN
      },
    ],
  });
  
  return team;
}

// Get player with current team
export async function exampleGetPlayerWithTeam(playerId: number) {
  const player = await Player.findByPk(playerId, {
    include: [
      {
        model: Team,
        as: 'currentTeam',
      },
    ],
  });
  
  return player;
}

// ============================================
// EXAMPLE 3: Complex Queries
// ============================================

// Get available batsmen in L1 category
export async function exampleGetSpecificPlayers() {
  const players = await Player.findAll({
    where: {
      type: PlayerType.BATSMAN,
      category: PlayerCategory.L1,
      status: PlayerStatus.AVAILABLE,
    },
    order: [['base_value', 'DESC']],
    limit: 10,
  });
  
  return players;
}

// Get teams with player count
export async function exampleTeamsWithPlayerCount() {
  const teams = await Team.findAll({
    include: [
      {
        model: Player,
        as: 'players',
        attributes: [], // Don't fetch player details
      },
    ],
    attributes: {
      include: [
        // Add player count to each team
        [Player.sequelize!.fn('COUNT', Player.sequelize!.col('players.id')), 'playerCount'],
      ],
    },
    group: ['Team.id'],
  });
  
  return teams;
}

// ============================================
// EXAMPLE 4: Auction Flow
// ============================================

// Complete auction flow for selling a player
export async function exampleAuctionFlow(
  playerId: number,
  teamId: number,
  finalBid: number
) {
  try {
    // 1. Get player and team
    const player = await Player.findByPk(playerId);
    const team = await Team.findByPk(teamId);
    
    if (!player || !team) {
      throw new Error('Player or Team not found');
    }
    
    // 2. Check if team has enough purse
    if (team.purse < finalBid) {
      throw new Error('Insufficient purse balance');
    }
    
    // 3. Update player status
    await player.update({
      current_team_id: teamId,
      bid_value: finalBid,
      status: PlayerStatus.SOLD,
    });
    
    // 4. Deduct from team purse
    await team.update({
      purse: team.purse - finalBid,
    });
    
    // 5. Record the auction event
    await AuctionEvent.create({
      player_id: playerId,
      team_id: teamId,
      bid_amount: finalBid,
      event_type: 'SOLD',
    });
    
    return {
      success: true,
      player,
      team,
      message: `${player.name} sold to ${team.name} for ${finalBid}`,
    };
  } catch (error) {
    console.error('Auction flow error:', error);
    throw error;
  }
}

// ============================================
// EXAMPLE 5: Authentication
// ============================================

// Login user
export async function exampleLogin(email: string, password: string) {
  const user = await authenticateUser(email, password);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

// Register new user
export async function exampleRegister(
  name: string,
  email: string,
  password: string
) {
  // Check if user exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Create new user (password will be hashed automatically)
  const newUser = await User.create({
    name,
    email,
    password,
    role: 'user' as any,
  });
  
  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };
}

// ============================================
// EXAMPLE 6: Statistics & Analytics
// ============================================

// Get dashboard statistics
export async function exampleGetDashboardStats() {
  const auctionStats = await getAuctionStats();
  
  const topBids = await AuctionEvent.findAll({
    include: [
      { model: Player, as: 'player' },
      { model: Team, as: 'team' },
    ],
    order: [['bid_amount', 'DESC']],
    limit: 5,
  });
  
  const teamSpending = await Team.findAll({
    attributes: [
      'id',
      'name',
      'purse',
      [Team.sequelize!.literal('10000 - purse'), 'spent'],
    ],
    order: [[Team.sequelize!.literal('spent'), 'DESC']],
  });
  
  return {
    auctionStats,
    topBids,
    teamSpending,
  };
}

// ============================================
// EXAMPLE 7: Complete API Route
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'teams':
        const teams = await getAllTeamsWithPlayers();
        return NextResponse.json(teams);
        
      case 'available-players':
        const players = await getAvailablePlayers();
        return NextResponse.json(players);
        
      case 'stats':
        const stats = await exampleGetDashboardStats();
        return NextResponse.json(stats);
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    switch (action) {
      case 'auction-bid':
        const result = await exampleAuctionFlow(
          data.playerId,
          data.teamId,
          data.bidAmount
        );
        return NextResponse.json(result);
        
      case 'register':
        const user = await exampleRegister(
          data.name,
          data.email,
          data.password
        );
        return NextResponse.json(user);
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500 }
    );
  }
}

// ============================================
// EXAMPLE 8: Using Helper Functions
// ============================================

export async function exampleUsingHelpers() {
  // Get all teams with players (uses helper)
  const teams = await getAllTeamsWithPlayers();
  
  // Get available players (uses helper)
  const availablePlayers = await getAvailablePlayers();
  
  // Assign player to team (uses helper)
  await assignPlayerToTeam(1, 1, 1500);
  
  // Record a bid (uses helper)
  await recordBid(1, 1, 1000, 'John Doe');
  
  // Get statistics (uses helper)
  const stats = await getAuctionStats();
  
  return {
    teams,
    availablePlayers,
    stats,
  };
}

// ============================================
// EXAMPLE 9: Transactions
// ============================================

export async function exampleTransaction(
  playerId: number,
  teamId: number,
  bidAmount: number
) {
  const sequelize = Player.sequelize!;
  
  // Use transaction for atomic operations
  const result = await sequelize.transaction(async (t) => {
    // All operations in this block will be part of the transaction
    
    const player = await Player.findByPk(playerId, { transaction: t });
    const team = await Team.findByPk(teamId, { transaction: t });
    
    if (!player || !team) {
      throw new Error('Player or Team not found');
    }
    
    if (team.purse < bidAmount) {
      throw new Error('Insufficient funds');
    }
    
    // Update player
    await player.update(
      {
        current_team_id: teamId,
        bid_value: bidAmount,
        status: PlayerStatus.SOLD,
      },
      { transaction: t }
    );
    
    // Update team
    await team.update(
      {
        purse: team.purse - bidAmount,
      },
      { transaction: t }
    );
    
    // Record event
    await AuctionEvent.create(
      {
        player_id: playerId,
        team_id: teamId,
        bid_amount: bidAmount,
        event_type: 'SOLD',
      },
      { transaction: t }
    );
    
    return { player, team };
  });
  
  // If any operation fails, all changes will be rolled back
  return result;
}

// ============================================
// EXAMPLE 10: Bulk Operations
// ============================================

export async function exampleBulkOperations() {
  // Bulk create players
  const players = await Player.bulkCreate([
    {
      name: 'Player 1',
      type: PlayerType.BATSMAN,
      category: PlayerCategory.L1,
      base_value: 500,
    },
    {
      name: 'Player 2',
      type: PlayerType.BOWLER,
      category: PlayerCategory.L2,
      base_value: 400,
    },
  ]);
  
  // Bulk update
  await Player.update(
    { status: PlayerStatus.AVAILABLE },
    {
      where: {
        status: PlayerStatus.UNSOLD,
      },
    }
  );
  
  // Bulk delete (be careful!)
  await Player.destroy({
    where: {
      status: PlayerStatus.UNSOLD,
    },
  });
  
  return players;
}
