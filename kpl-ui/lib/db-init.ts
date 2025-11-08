import { connectDB, syncDB } from '@/lib/sequelize';
import db from '@/models';

/**
 * Initialize the database connection and sync models
 * @param force - If true, drops existing tables and recreates them
 */
export async function initializeDatabase(force = false) {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    await connectDB();
    
    // Sync all models
    await syncDB(force);
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Seed initial data into the database
 */
export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    const { User, Team } = db;
    
    // Check if data already exists
    const userCount = await User.count();
    
    if (userCount > 0) {
      console.log('ℹ️ Database already contains data. Skipping seed.');
      return;
    }
    
    // Seed users
    await User.bulkCreate([
      {
        name: 'Admin User',
        email: 'admin@kpl.com',
        password: 'admin123', // Will be hashed by the model hook
        role: 'admin' as any,
      },
      {
        name: 'Test User',
        email: 'user@kpl.com',
        password: 'user123',
        role: 'user' as any,
      },
      {
        name: 'Demo User',
        email: 'demo@kpl.com',
        password: 'demo123',
        role: 'user' as any,
      },
    ]);
    
    // Seed teams
    await Team.bulkCreate([
      {
        name: 'KGF',
        purse: 10000,
        owner: 'Jaya Shetty',
        mentor: 'Sagar Shetty',
        icon_player: 'Dheeraj Shetty',
      },
      {
        name: 'Silver Squad',
        purse: 10000,
        owner: 'Guruprasad',
        mentor: 'Santhosh Shetty',
        icon_player: 'Adarsh Acharya',
      },
      {
        name: 'Shabari Strikers',
        purse: 10000,
        owner: 'Rajesh Shetty',
        mentor: 'Pawan Shetty',
        icon_player: 'Dheeraj Shetty',
      },
      {
        name: 'Ocean Stunners',
        purse: 10000,
        owner: 'Ashok Devadiga',
        mentor: 'Yogish Kulal',
        icon_player: 'Abhijith Kulal',
      },
      {
        name: 'Bhoomi Fighters',
        purse: 10000,
        owner: 'Dheeraj Kulal',
        mentor: 'Praveen Acharya Melmane',
        icon_player: 'Prajwal Mathias',
      },
    ]);
    
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

const dbInitializer = { initializeDatabase, seedDatabase };
export default dbInitializer;
