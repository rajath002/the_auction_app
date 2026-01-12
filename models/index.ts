import sequelize from '@/lib/sequelize';
import User from './User';
import Team from './Team';
import Player from './Player';
import Session from './Session';
import AuctionEvent from './AuctionEvent';
import PageAccessSetting from './PageAccessSetting';
import CricketMatch from './CricketMatch';
import InningsScore from './InningsScore';
import BallByBall from './BallByBall';

// Define associations between models
const initializeModels = () => {
  // Team - Player relationship (One-to-Many)
  Team.hasMany(Player, {
    foreignKey: 'current_team_id',
    as: 'players',
  });
  Player.belongsTo(Team, {
    foreignKey: 'current_team_id',
    as: 'currentTeam',
  });

  // User - Session relationship (One-to-Many)
  User.hasMany(Session, {
    foreignKey: 'user_id',
    as: 'sessions',
  });
  Session.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  // Player - AuctionEvent relationship (One-to-Many)
  Player.hasMany(AuctionEvent, {
    foreignKey: 'player_id',
    as: 'auctionEvents',
  });
  AuctionEvent.belongsTo(Player, {
    foreignKey: 'player_id',
    as: 'player',
  });

  // Team - AuctionEvent relationship (One-to-Many)
  Team.hasMany(AuctionEvent, {
    foreignKey: 'team_id',
    as: 'bids',
  });
  AuctionEvent.belongsTo(Team, {
    foreignKey: 'team_id',
    as: 'team',
  });

  // CricketMatch - Team relationships
  Team.hasMany(CricketMatch, {
    foreignKey: 'team1_id',
    as: 'homeMatches',
  });
  Team.hasMany(CricketMatch, {
    foreignKey: 'team2_id',
    as: 'awayMatches',
  });
  CricketMatch.belongsTo(Team, {
    foreignKey: 'team1_id',
    as: 'team1',
  });
  CricketMatch.belongsTo(Team, {
    foreignKey: 'team2_id',
    as: 'team2',
  });
  CricketMatch.belongsTo(Team, {
    foreignKey: 'batting_team_id',
    as: 'battingTeam',
  });
  CricketMatch.belongsTo(Team, {
    foreignKey: 'winner_id',
    as: 'winner',
  });

  // CricketMatch - InningsScore relationship
  CricketMatch.hasMany(InningsScore, {
    foreignKey: 'match_id',
    as: 'innings',
  });
  InningsScore.belongsTo(CricketMatch, {
    foreignKey: 'match_id',
    as: 'match',
  });

  // InningsScore - Team relationships
  InningsScore.belongsTo(Team, {
    foreignKey: 'batting_team_id',
    as: 'battingTeam',
  });
  InningsScore.belongsTo(Team, {
    foreignKey: 'bowling_team_id',
    as: 'bowlingTeam',
  });

  // InningsScore - BallByBall relationship
  InningsScore.hasMany(BallByBall, {
    foreignKey: 'innings_id',
    as: 'balls',
  });
  BallByBall.belongsTo(InningsScore, {
    foreignKey: 'innings_id',
    as: 'innings',
  });

  // BallByBall - Player relationships
  BallByBall.belongsTo(Player, {
    foreignKey: 'batsman_id',
    as: 'batsman',
  });
  BallByBall.belongsTo(Player, {
    foreignKey: 'bowler_id',
    as: 'bowler',
  });
  BallByBall.belongsTo(Player, {
    foreignKey: 'fielder_id',
    as: 'fielder',
  });
  BallByBall.belongsTo(Player, {
    foreignKey: 'dismissed_batsman_id',
    as: 'dismissedBatsman',
  });

  console.log('✅ Model associations initialized');
};

// Initialize all associations
initializeModels();

// Export database instance and models
export {
  sequelize,
  User,
  Team,
  Player,
  Session,
  AuctionEvent,
  PageAccessSetting,
  CricketMatch,
  InningsScore,
  BallByBall,
};

const db = {
  sequelize,
  User,
  Team,
  Player,
  Session,
  AuctionEvent,
  PageAccessSetting,
  CricketMatch,
  InningsScore,
  BallByBall,
};

export default db;
