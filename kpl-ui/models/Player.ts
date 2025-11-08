import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/sequelize';

// Player status enum
export enum PlayerStatus {
  SOLD = 'SOLD',
  UNSOLD = 'UNSOLD',
  AVAILABLE = 'AVAILABLE',
}

// Player type enum
export enum PlayerType {
  BATSMAN = 'Batsman',
  BOWLER = 'Bowler',
  ALL_ROUNDER = 'All-Rounder',
  WICKET_KEEPER = 'Wicket-Keeper',
}

// Player category enum
export enum PlayerCategory {
  L1 = 'L1',
  L2 = 'L2',
  L3 = 'L3',
  L4 = 'L4',
}

// Player attributes interface
export interface PlayerAttributes {
  id: number;
  name: string;
  image?: string;
  type: PlayerType;
  category: PlayerCategory;
  current_bid: number;
  base_value: number;
  bid_value?: number;
  current_team_id?: number;
  status?: PlayerStatus;
  created_at?: Date;
  updated_at?: Date;
}

// Optional fields for creation
interface PlayerCreationAttributes extends Optional<PlayerAttributes, 'id' | 'created_at' | 'updated_at' | 'image' | 'current_bid' | 'bid_value' | 'current_team_id' | 'status'> {}

// Player model class
class Player extends Model<PlayerAttributes, PlayerCreationAttributes> implements PlayerAttributes {
  public id!: number;
  public name!: string;
  public image?: string;
  public type!: PlayerType;
  public category!: PlayerCategory;
  public current_bid!: number;
  public base_value!: number;
  public bid_value?: number;
  public current_team_id?: number;
  public status?: PlayerStatus;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize Player model
Player.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(PlayerType)),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(...Object.values(PlayerCategory)),
      allowNull: false,
    },
    current_bid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    base_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bid_value: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    current_team_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PlayerStatus)),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'players',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['type'] },
      { fields: ['category'] },
      { fields: ['status'] },
      { fields: ['current_team_id'] },
      { fields: ['name'], name: 'idx_players_name' },
    ],
  }
);

export default Player;
