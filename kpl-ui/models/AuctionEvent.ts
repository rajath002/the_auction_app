import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/sequelize';

// Auction event attributes interface
export interface AuctionEventAttributes {
  id: number;
  player_id: number;
  team_id: number;
  bid_amount: number;
  event_type: string;
  bidder_name?: string;
  created_at?: Date;
}

// Optional fields for creation
interface AuctionEventCreationAttributes extends Optional<AuctionEventAttributes, 'id' | 'created_at' | 'bidder_name' | 'event_type'> {}

// AuctionEvent model class
class AuctionEvent extends Model<AuctionEventAttributes, AuctionEventCreationAttributes> implements AuctionEventAttributes {
  public id!: number;
  public player_id!: number;
  public team_id!: number;
  public bid_amount!: number;
  public event_type!: string;
  public bidder_name?: string;

  public readonly created_at!: Date;
}

// Initialize AuctionEvent model
AuctionEvent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    player_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'players',
        key: 'id',
      },
    },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
    bid_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    event_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'BID',
    },
    bidder_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'auction_events',
    timestamps: true,
    underscored: true,
    updatedAt: false, // No updated_at field for auction events
    indexes: [
      { fields: ['player_id'] },
      { fields: ['team_id'] },
      { fields: ['created_at'] },
      { fields: ['player_id', 'created_at'], name: 'idx_auction_player_time' },
    ],
  }
);

export default AuctionEvent;
