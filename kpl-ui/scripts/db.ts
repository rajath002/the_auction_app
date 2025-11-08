#!/usr/bin/env node
/**
 * Database CLI tool for initializing and seeding the PostgreSQL database
 * 
 * Usage:
 *   npm run db:init     - Initialize database and sync models
 *   npm run db:seed     - Seed initial data
 *   npm run db:reset    - Reset database (drop and recreate)
 */

import { initializeDatabase, seedDatabase } from '../lib/db-init';
import { closeDB } from '../lib/sequelize';

const command = process.argv[2];

async function main() {
  try {
    switch (command) {
      case 'init':
        console.log('📦 Initializing database...');
        await initializeDatabase(false);
        break;
        
      case 'seed':
        console.log('🌱 Seeding database...');
        await initializeDatabase(false);
        await seedDatabase();
        break;
        
      case 'reset':
        console.log('⚠️  Resetting database (this will drop all tables)...');
        await initializeDatabase(true);
        await seedDatabase();
        break;
        
      default:
        console.log(`
Usage: npm run db:<command>

Commands:
  init   - Initialize database and sync models
  seed   - Seed initial data
  reset  - Reset database (drop and recreate all tables)
        `);
        process.exit(1);
    }
    
    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
