import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/sequelize';

// Ball by Ball attributes interface
export interface BallByBallAttributes {
  id: number;
  innings_id: number;
  over_number: number;
  ball_number: number;
  batsman_id?: number;
  bowler_id?: number;
  runs_scored: number;
  ball_type: 'normal' | 'wide' | 'no_ball' | 'bye' | 'leg_bye' | 'wicket';
  is_boundary: boolean;
  is_six: boolean;
  is_wicket: boolean;
  wicket_type?: 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped' | 'hit_wicket' | 'retired';
  fielder_id?: number;
  dismissed_batsman_id?: number;
  commentary?: string;
  created_at?: Date;
}

// Optional fields for creation
interface BallByBallCreationAttributes extends Optional<BallByBallAttributes, 
  'id' | 'created_at' | 'batsman_id' | 'bowler_id' | 'runs_scored' | 'ball_type' | 
  'is_boundary' | 'is_six' | 'is_wicket' | 'wicket_type' | 'fielder_id' | 'dismissed_batsman_id' | 'commentary'> {}

// BallByBall model class
class BallByBall extends Model<BallByBallAttributes, BallByBallCreationAttributes> implements BallByBallAttributes {
  public id!: number;
  public innings_id!: number;
  public over_number!: number;
  public ball_number!: number;
  public batsman_id?: number;
  public bowler_id?: number;
  public runs_scored!: number;
  public ball_type!: 'normal' | 'wide' | 'no_ball' | 'bye' | 'leg_bye' | 'wicket';
  public is_boundary!: boolean;
  public is_six!: boolean;
  public is_wicket!: boolean;
  public wicket_type?: 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped' | 'hit_wicket' | 'retired';
  public fielder_id?: number;
  public dismissed_batsman_id?: number;
  public commentary?: string;

  public readonly created_at!: Date;

  // Override toJSON to transform snake_case to camelCase
  toJSON(): any {
    const values = { ...this.get() };
    return {
      id: values.id,
      inningsId: values.innings_id,
      overNumber: values.over_number,
      ballNumber: values.ball_number,
      batsmanId: values.batsman_id,
      bowlerId: values.bowler_id,
      runsScored: values.runs_scored,
      ballType: values.ball_type,
      isBoundary: values.is_boundary,
      isSix: values.is_six,
      isWicket: values.is_wicket,
      wicketType: values.wicket_type,
      fielderId: values.fielder_id,
      dismissedBatsmanId: values.dismissed_batsman_id,
      commentary: values.commentary,
      createdAt: values.created_at,
    };
  }
}

// Initialize BallByBall model
BallByBall.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    innings_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'innings_scores',
        key: 'id',
      },
    },
    over_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ball_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    batsman_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'players',
        key: 'id',
      },
    },
    bowler_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'players',
        key: 'id',
      },
    },
    runs_scored: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ball_type: {
      type: DataTypes.ENUM('normal', 'wide', 'no_ball', 'bye', 'leg_bye', 'wicket'),
      allowNull: false,
      defaultValue: 'normal',
    },
    is_boundary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_six: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_wicket: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    wicket_type: {
      type: DataTypes.ENUM('bowled', 'caught', 'lbw', 'run_out', 'stumped', 'hit_wicket', 'retired'),
      allowNull: true,
    },
    fielder_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'players',
        key: 'id',
      },
    },
    dismissed_batsman_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'players',
        key: 'id',
      },
    },
    commentary: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'ball_by_ball',
    timestamps: true,
    underscored: true,
    updatedAt: false, // No updated_at for ball records
    indexes: [
      { fields: ['innings_id'] },
      { fields: ['innings_id', 'over_number', 'ball_number'], name: 'idx_ball_sequence' },
      { fields: ['batsman_id'] },
      { fields: ['bowler_id'] },
    ],
  }
);

export default BallByBall;
