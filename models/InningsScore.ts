import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/sequelize';

// Innings Score attributes interface
export interface InningsScoreAttributes {
  id: number;
  match_id: number;
  innings_number: number;
  batting_team_id: number;
  bowling_team_id: number;
  total_runs: number;
  wickets: number;
  overs_bowled: number;
  extras: number;
  wides: number;
  no_balls: number;
  byes: number;
  leg_byes: number;
  is_completed: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Optional fields for creation
interface InningsScoreCreationAttributes extends Optional<InningsScoreAttributes, 
  'id' | 'created_at' | 'updated_at' | 'total_runs' | 'wickets' | 'overs_bowled' | 
  'extras' | 'wides' | 'no_balls' | 'byes' | 'leg_byes' | 'is_completed'> {}

// InningsScore model class
class InningsScore extends Model<InningsScoreAttributes, InningsScoreCreationAttributes> implements InningsScoreAttributes {
  public id!: number;
  public match_id!: number;
  public innings_number!: number;
  public batting_team_id!: number;
  public bowling_team_id!: number;
  public total_runs!: number;
  public wickets!: number;
  public overs_bowled!: number;
  public extras!: number;
  public wides!: number;
  public no_balls!: number;
  public byes!: number;
  public leg_byes!: number;
  public is_completed!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Override toJSON to transform snake_case to camelCase
  toJSON(): any {
    const values = { ...this.get() };
    return {
      id: values.id,
      matchId: values.match_id,
      inningsNumber: values.innings_number,
      battingTeamId: values.batting_team_id,
      bowlingTeamId: values.bowling_team_id,
      totalRuns: values.total_runs,
      wickets: values.wickets,
      oversBowled: values.overs_bowled,
      extras: values.extras,
      wides: values.wides,
      noBalls: values.no_balls,
      byes: values.byes,
      legByes: values.leg_byes,
      isCompleted: values.is_completed,
      createdAt: values.created_at,
      updatedAt: values.updated_at,
    };
  }
}

// Initialize InningsScore model
InningsScore.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    match_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cricket_matches',
        key: 'id',
      },
    },
    innings_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    batting_team_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
    bowling_team_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
    total_runs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    wickets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    overs_bowled: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: false,
      defaultValue: 0.0,
    },
    extras: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    wides: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    no_balls: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    byes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    leg_byes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'innings_scores',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['match_id'] },
      { fields: ['batting_team_id'] },
      { fields: ['match_id', 'innings_number'], unique: true, name: 'unique_match_innings' },
    ],
  }
);

export default InningsScore;
