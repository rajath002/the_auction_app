import sequelize from '@/lib/sequelize';
import User from './User';
import Team from './Team';
import Player from './Player';
import Session from './Session';
import AuctionEvent from './AuctionEvent';

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
};

const db = {
  sequelize,
  User,
  Team,
  Player,
  Session,
  AuctionEvent,
};

export default db;
