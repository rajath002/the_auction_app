import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/sequelize';
import { PlayerStatus, PlayerType, PlayerCategory, PlayerRole } from '@/types/player-enums';

// Re-export enums for backward compatibility
export { PlayerStatus, PlayerType, PlayerCategory, PlayerRole };

// Player attributes interface
export interface PlayerAttributes {
  id: number;
  name: string;
  image?: string;
  type: PlayerType;
  category: PlayerCategory;
  role?: string;
  current_bid: number;
  base_value: number;
  bid_value?: number;
  current_team_id?: number;
  status?: PlayerStatus;
  created_at?: Date;
  updated_at?: Date;
}

// Optional fields for creation
interface PlayerCreationAttributes extends Optional<PlayerAttributes, 'id' | 'created_at' | 'updated_at' | 'image' | 'current_bid' | 'bid_value' | 'current_team_id' | 'status' | 'role'> {}

// Player model class
class Player extends Model<PlayerAttributes, PlayerCreationAttributes> implements PlayerAttributes {
  public id!: number;
  public name!: string;
  public image?: string;
  public type!: PlayerType;
  public category!: PlayerCategory;
  public role?: string;
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
    role: {
      type: DataTypes.STRING(25),
      allowNull: true,
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
      { fields: ['role'] },
      { fields: ['status'] },
      { fields: ['current_team_id'] },
      { fields: ['name'], name: 'idx_players_name' },
    ],
  }
);

// Override toJSON method to transform snake_case to camelCase
Player.prototype.toJSON = function () {
  const values = { ...this.get() };
  return {
    id: values.id,
    name: values.name,
    image: values.image,
    type: values.type,
    category: values.category,
    role: values.role,
    currentBid: values.current_bid,
    baseValue: values.base_value, 
    bidValue: values.bid_value,
    currentTeamId: values.current_team_id,
    status: values.status,
    createdAt: values.created_at,
    updatedAt: values.updated_at,
    currentTeam: (values as any).currentTeam,
  };
};

export default Player;
