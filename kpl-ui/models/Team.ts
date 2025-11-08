import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/sequelize';

// Team attributes interface
export interface TeamAttributes {
  id: number;
  name: string;
  purse: number;
  owner: string;
  mentor: string;
  icon_player?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Optional fields for creation
interface TeamCreationAttributes extends Optional<TeamAttributes, 'id' | 'created_at' | 'updated_at' | 'icon_player'> {}

// Team model class
class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
  public id!: number;
  public name!: string;
  public purse!: number;
  public owner!: string;
  public mentor!: string;
  public icon_player?: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize Team model
Team.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    purse: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10000,
    },
    owner: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mentor: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    icon_player: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'teams',
    timestamps: true,
    underscored: true,
  }
);

export default Team;
