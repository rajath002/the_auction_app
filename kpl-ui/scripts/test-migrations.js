#!/usr/bin/env node
/**
 * Test script to verify migrations and seeders
 * Run: node scripts/test-migrations.js
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    const { stdout, stderr } = await execPromise(command);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`✅ ${description} - Success`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - Failed:`, error.message);
    return false;
  }
}

async function testMigrations() {
  console.log('🚀 Testing Database Migrations and Seeders\n');
  console.log('=' .repeat(50));

  // 1. Check migration status
  await runCommand(
    'npx sequelize-cli db:migrate:status',
    'Check migration status'
  );

  // 2. Run migrations
  const migrateSuccess = await runCommand(
    'npx sequelize-cli db:migrate',
    'Run migrations (create tables)'
  );

  if (!migrateSuccess) {
    console.log('\n❌ Migration failed. Please check your database connection.');
    process.exit(1);
  }

  // 3. Run seeders
  const seedSuccess = await runCommand(
    'npx sequelize-cli db:seed:all',
    'Run seeders (insert data)'
  );

  if (!seedSuccess) {
    console.log('\n⚠️  Seeding failed. Tables created but no data inserted.');
  }

  // 4. Check seeder status
  await runCommand(
    'npx sequelize-cli db:seed:status',
    'Check seeder status'
  );

  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Database setup complete!\n');
  console.log('You can now:');
  console.log('  1. Run: npm run dev');
  console.log('  2. Login with: admin@kpl.com / admin123');
  console.log('  3. Check database with: psql -U postgres -d kpl_auction\n');
}

// Run the test
testMigrations().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
