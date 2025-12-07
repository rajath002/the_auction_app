import pg from "pg";
import { Sequelize } from 'sequelize';

// PostgreSQL connection configuration
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: true, // Use snake_case for column names
        freezeTableName: true, // Prevent Sequelize from pluralizing table names
      },
    })
  : new Sequelize({
      host: process.env.PG_DB_HOST || 'localhost',
      port: parseInt(process.env.PG_DB_PORT || '5432'),
      database: process.env.PG_DB_DATABASE || 'kpl_auction',
      username: process.env.PG_DB_USERNAME || 'postgres',
      password: process.env.PG_DB_PASSWORD || '',
      dialect: 'postgres',
      schema: process.env.PG_DB_SCHEMA || 'public',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectModule: pg,
      dialectOptions: {
        ssl: process.env.PG_DB_HOST !== 'localhost' ? {
          require: true,
          rejectUnauthorized: false,
        } : false,
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: true, // Use snake_case for column names
        freezeTableName: true, // Prevent Sequelize from pluralizing table names
      },
    });

// Test the connection
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL database:', error);
    throw error;
  }
};

// Sync all models with database
export const syncDB = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log(`✅ Database synced successfully${force ? ' (forced)' : ''}`);
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    throw error;
  }
};

// Close the connection
export const closeDB = async () => {
  try {
    await sequelize.close();
    console.log('✅ PostgreSQL connection closed.');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
};

export default sequelize;
