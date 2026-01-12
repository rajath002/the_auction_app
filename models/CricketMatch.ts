import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/sequelize';

// Cricket Match attributes interface
export interface CricketMatchAttributes {
  id: number;
  match_name: string;
  team1_id: number;
  team2_id: number;
  toss_winner_id?: number;
  toss_decision?: 'bat' | 'bowl';
  venue?: string;
  match_date: string;
  overs: number;
  status: 'upcoming' | 'live' | 'innings_break' | 'completed' | 'abandoned';
  current_innings: number;
  batting_team_id?: number;
  winner_id?: number;
  result_summary?: string;
  created_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

// Optional fields for creation
interface CricketMatchCreationAttributes extends Optional<CricketMatchAttributes, 
  'id' | 'created_at' | 'updated_at' | 'toss_winner_id' | 'toss_decision' | 'venue' | 
  'batting_team_id' | 'winner_id' | 'result_summary' | 'created_by' | 'status' | 'current_innings' | 'overs'> {}

// CricketMatch model class
class CricketMatch extends Model<CricketMatchAttributes, CricketMatchCreationAttributes> implements CricketMatchAttributes {
  public id!: number;
  public match_name!: string;
  public team1_id!: number;
  public team2_id!: number;
  public toss_winner_id?: number;
  public toss_decision?: 'bat' | 'bowl';
  public venue?: string;
  public match_date!: string;
  public overs!: number;
  public status!: 'upcoming' | 'live' | 'innings_break' | 'completed' | 'abandoned';
  public current_innings!: number;
  public batting_team_id?: number;
  public winner_id?: number;
  public result_summary?: string;
  public created_by?: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Override toJSON to transform snake_case to camelCase
  toJSON(): any {
    const values = { ...this.get() } as any;
    return {
      id: values.id,
      matchName: values.match_name,
      team1Id: values.team1_id,
      team2Id: values.team2_id,
      tossWinnerId: values.toss_winner_id,
      tossDecision: values.toss_decision,
      venue: values.venue,
      matchDate: values.match_date,
      overs: values.overs,
      status: values.status,
      currentInnings: values.current_innings,
      battingTeamId: values.batting_team_id,
      winnerId: values.winner_id,
      resultSummary: values.result_summary,
      createdBy: values.created_by,
      createdAt: values.created_at,
      updatedAt: values.updated_at,
      // Include associations if they exist
      team1: values.team1,
      team2: values.team2,
      battingTeam: values.battingTeam,
      winner: values.winner,
    };
  }
}

// Initialize CricketMatch model
CricketMatch.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    match_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    team1_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
    team2_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
    toss_winner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
    toss_decision: {
      type: DataTypes.ENUM('bat', 'bowl'),
      allowNull: true,
    },
    venue: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    match_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    overs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 20,
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'live', 'innings_break', 'completed', 'abandoned'),
      allowNull: false,
      defaultValue: 'upcoming',
    },
    current_innings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    batting_team_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
    winner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
    result_summary: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'cricket_matches',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['match_date'] },
      { fields: ['team1_id', 'team2_id'] },
    ],
  }
);

export default CricketMatch;
