/**
 * Common database queries and utilities for the KPL Auction App
 * These helper functions provide commonly used database operations
 */

import { Team, Player, User, AuctionEvent } from '@/models';
import { PlayerStatus, PlayerType, PlayerCategory } from '@/models/Player';
import { Op } from 'sequelize';

// ============ TEAM QUERIES ============

/**
 * Get all teams with their players
 */
export async function getAllTeamsWithPlayers() {
  return await Team.findAll({
    include: [
      {
        model: Player,
        as: 'players',
        required: false,
      },
    ],
    order: [['id', 'ASC']],
  });
}

/**
 * Get a single team by ID with all details
 */
export async function getTeamById(teamId: number) {
  return await Team.findByPk(teamId, {
    include: [
      {
        model: Player,
        as: 'players',
      },
      {
        model: AuctionEvent,
        as: 'bids',
        limit: 10,
        order: [['created_at', 'DESC']],
      },
    ],
  });
}

/**
 * Update team purse after purchase
 */
export async function updateTeamPurse(teamId: number, amount: number) {
  const team = await Team.findByPk(teamId);
  if (!team) throw new Error('Team not found');
  
  await team.update({
    purse: team.purse - amount,
  });
  
  return team;
}

// ============ PLAYER QUERIES ============

/**
 * Get all available players for auction
 */
export async function getAvailablePlayers() {
  return await Player.findAll({
    where: {
      status: PlayerStatus.AVAILABLE,
    },
    order: [['category', 'ASC'], ['base_value', 'DESC']],
  });
}

/**
 * Get players by status
 */
export async function getPlayersByStatus(status: PlayerStatus) {
  return await Player.findAll({
    where: { status },
    include: [
      {
        model: Team,
        as: 'currentTeam',
        required: false,
      },
    ],
    order: [['id', 'ASC']],
  });
}

/**
 * Get players by type
 */
export async function getPlayersByType(type: PlayerType) {
  return await Player.findAll({
    where: { type },
    order: [['base_value', 'DESC']],
  });
}

/**
 * Get players by category
 */
export async function getPlayersByCategory(category: PlayerCategory) {
  return await Player.findAll({
    where: { category },
    order: [['name', 'ASC']],
  });
}

/**
 * Assign player to team (mark as sold)
 */
export async function assignPlayerToTeam(
  playerId: number,
  teamId: number,
  bidAmount: number
) {
  const player = await Player.findByPk(playerId);
  if (!player) throw new Error('Player not found');

  await player.update({
    current_team_id: teamId,
    bid_value: bidAmount,
    status: PlayerStatus.SOLD,
  });

  return player;
}

/**
 * Mark player as unsold
 */
export async function markPlayerAsUnsold(playerId: number) {
  const player = await Player.findByPk(playerId);
  if (!player) throw new Error('Player not found');

  await player.update({
    status: PlayerStatus.UNSOLD,
    current_team_id: undefined,
    bid_value: undefined,
  });

  return player;
}

// ============ USER QUERIES ============

/**
 * Find user by email
 */
export async function findUserByEmail(email: string) {
  return await User.findOne({
    where: { email },
  });
}

/**
 * Authenticate user
 */
export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const isValid = await user.validatePassword(password);
  if (!isValid) return null;

  // Update last login
  await user.update({
    last_login: new Date(),
  });

  return user;
}

/**
 * Create new user
 */
export async function createUser(
  name: string,
  email: string,
  password: string,
  role: 'admin' | 'user' = 'user'
) {
  return await User.create({
    name,
    email,
    password, // Will be hashed automatically by model hook
    role: role as any,
  });
}

// ============ AUCTION EVENT QUERIES ============

/**
 * Record a bid in auction events
 */
export async function recordBid(
  playerId: number,
  teamId: number,
  bidAmount: number,
  bidderName?: string
) {
  return await AuctionEvent.create({
    player_id: playerId,
    team_id: teamId,
    bid_amount: bidAmount,
    event_type: 'BID',
    bidder_name: bidderName,
  });
}

/**
 * Get auction history for a player
 */
export async function getPlayerAuctionHistory(playerId: number) {
  return await AuctionEvent.findAll({
    where: { player_id: playerId },
    include: [
      {
        model: Team,
        as: 'team',
      },
    ],
    order: [['created_at', 'DESC']],
  });
}

/**
 * Get recent auction events
 */
export async function getRecentAuctionEvents(limit = 20) {
  return await AuctionEvent.findAll({
    include: [
      {
        model: Player,
        as: 'player',
      },
      {
        model: Team,
        as: 'team',
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
  });
}

/**
 * Get team's bidding history
 */
export async function getTeamBiddingHistory(teamId: number) {
  return await AuctionEvent.findAll({
    where: { team_id: teamId },
    include: [
      {
        model: Player,
        as: 'player',
      },
    ],
    order: [['created_at', 'DESC']],
  });
}

// ============ STATISTICS QUERIES ============

/**
 * Get auction statistics
 */
export async function getAuctionStats() {
  const totalPlayers = await Player.count();
  const soldPlayers = await Player.count({
    where: { status: PlayerStatus.SOLD },
  });
  const unsoldPlayers = await Player.count({
    where: { status: PlayerStatus.UNSOLD },
  });
  const availablePlayers = totalPlayers - soldPlayers - unsoldPlayers;

  const totalBids = await AuctionEvent.count();

  return {
    totalPlayers,
    soldPlayers,
    unsoldPlayers,
    availablePlayers,
    totalBids,
    soldPercentage: totalPlayers > 0 ? (soldPlayers / totalPlayers) * 100 : 0,
  };
}

/**
 * Get team statistics
 */
export async function getTeamStats(teamId: number) {
  const team = await Team.findByPk(teamId);
  if (!team) throw new Error('Team not found');

  const playerCount = await Player.count({
    where: { current_team_id: teamId },
  });

  const players = await Player.findAll({
    where: { current_team_id: teamId },
  });

  const totalSpent = players.reduce(
    (sum, player) => sum + (player.bid_value || 0),
    0
  );

  const playersByType = await Player.findAll({
    where: { current_team_id: teamId },
    attributes: ['type'],
    group: ['type'],
  });

  return {
    teamName: team.name,
    playerCount,
    totalSpent,
    remainingPurse: team.purse,
    players,
  };
}

// Export all functions
const dbQueries = {
  // Teams
  getAllTeamsWithPlayers,
  getTeamById,
  updateTeamPurse,
  
  // Players
  getAvailablePlayers,
  getPlayersByStatus,
  getPlayersByType,
  getPlayersByCategory,
  assignPlayerToTeam,
  markPlayerAsUnsold,
  
  // Users
  findUserByEmail,
  authenticateUser,
  createUser,
  
  // Auction Events
  recordBid,
  getPlayerAuctionHistory,
  getRecentAuctionEvents,
  getTeamBiddingHistory,
  
  // Statistics
  getAuctionStats,
  getTeamStats,
};

export default dbQueries;
