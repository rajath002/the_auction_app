import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/sequelize';

// Session attributes interface
export interface SessionAttributes {
  id: number;
  user_id: number;
  session_token: string;
  expires: Date;
  created_at?: Date;
}

// Optional fields for creation
interface SessionCreationAttributes extends Optional<SessionAttributes, 'id' | 'created_at'> {}

// Session model class
class Session extends Model<SessionAttributes, SessionCreationAttributes> implements SessionAttributes {
  public id!: number;
  public user_id!: number;
  public session_token!: string;
  public expires!: Date;

  public readonly created_at!: Date;
}

// Initialize Session model
Session.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    session_token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'sessions',
    timestamps: true,
    underscored: true,
    updatedAt: false, // No updated_at field for sessions
    indexes: [
      { fields: ['user_id'] },
      { fields: ['session_token'], unique: true, name: 'idx_sessions_token' },
      { fields: ['expires'] },
    ],
  }
);

export default Session;
