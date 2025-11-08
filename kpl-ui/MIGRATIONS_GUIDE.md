# Database Migrations & Seeders Guide

## Overview
This project uses **Sequelize CLI** for database migrations and seeders, providing version control for your database schema and initial data.

## 📁 Directory Structure

```
kpl-ui/
├── config/
│   └── database.json          # Database connection config
├── migrations/                 # Database schema migrations
│   ├── 20241107000001-create-users.js
│   ├── 20241107000002-create-teams.js
│   ├── 20241107000003-create-players.js
│   ├── 20241107000004-create-sessions.js
│   └── 20241107000005-create-auction-events.js
├── seeders/                    # Database seed data
│   ├── 20241107000001-seed-users.js
│   ├── 20241107000002-seed-teams.js
│   └── 20241107000003-seed-players.js
└── .sequelizerc.js            # Sequelize CLI configuration
```

## 🚀 Quick Start

### 1. Setup Database
```bash
# Create PostgreSQL database (if not exists)
psql -U postgres -c "CREATE DATABASE kpl_auction;"
```

### 2. Run Migrations
```bash
# Run all pending migrations
npm run migrate

# This will create all tables: users, teams, players, sessions, auction_events
```

### 3. Run Seeders
```bash
# Seed all initial data
npm run seed

# This will populate:
# - 3 users (admin, user, demo)
# - 5 teams
# - All players from data/players.json
```

## 📋 Available Commands

### Migration Commands

```bash
# Run all pending migrations
npm run migrate

# Undo last migration
npm run migrate:undo

# Undo all migrations (⚠️ drops all tables)
npm run migrate:undo:all

# Check migration status
npx sequelize-cli db:migrate:status
```

### Seeder Commands

```bash
# Run all seeders
npm run seed

# Undo last seeder
npm run seed:undo

# Undo all seeders (⚠️ deletes all seeded data)
npm run seed:undo:all

# Check seeder status
npx sequelize-cli db:seed:status
```

## 📝 Migrations Explained

### Migration Files

Each migration file has two methods:

1. **`up()`** - Applied when running migration
2. **`down()`** - Applied when undoing migration

#### Example: Create Users Table
```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      // ... other columns
    });
  },
  
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
```

### Migration Order

Migrations run in chronological order based on filename timestamps:

1. `20241107000001-create-users.js` - Creates users table
2. `20241107000002-create-teams.js` - Creates teams table
3. `20241107000003-create-players.js` - Creates players table (references teams)
4. `20241107000004-create-sessions.js` - Creates sessions table (references users)
5. `20241107000005-create-auction-events.js` - Creates auction_events table

**Important:** Foreign key constraints require tables to be created in the correct order!

## 🌱 Seeders Explained

### Seeder Files

Seeders populate initial data into tables.

#### Example: Seed Users
```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin User',
        email: 'admin@kpl.com',
        password: hashedPassword,
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },
  
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: 'admin@kpl.com'
    });
  }
};
```

### Seeded Data

#### 1. Users (3 accounts)
| Email | Password | Role |
|-------|----------|------|
| admin@kpl.com | admin123 | admin |
| user@kpl.com | user123 | user |
| demo@kpl.com | demo123 | user |

#### 2. Teams (5 teams)
- KGF
- Silver Squad
- Shabari Strikers
- Ocean Stunners
- Bhoomi Fighters

Each team starts with a purse of 10,000.

#### 3. Players
All players from `data/players.json` are imported with:
- Name, image, type, category
- Base values and current bids
- Status (available, sold, unsold)

## 🔧 Creating New Migrations

### Generate Migration File
```bash
# Create a new migration
npx sequelize-cli migration:generate --name add-column-to-players

# This creates: migrations/YYYYMMDDHHMMSS-add-column-to-players.js
```

### Example: Add Column
```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('players', 'jersey_number', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },
  
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('players', 'jersey_number');
  }
};
```

## 🌱 Creating New Seeders

### Generate Seeder File
```bash
# Create a new seeder
npx sequelize-cli seed:generate --name add-sample-auction-events

# This creates: seeders/YYYYMMDDHHMMSS-add-sample-auction-events.js
```

### Example: Seed Auction Events
```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('auction_events', [
      {
        player_id: 1,
        team_id: 1,
        bid_amount: 1500,
        event_type: 'BID',
        created_at: new Date()
      }
    ]);
  },
  
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('auction_events', null, {});
  }
};
```

## 🔄 Common Workflows

### Fresh Database Setup
```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE kpl_auction;"

# 2. Run migrations
npm run migrate

# 3. Seed data
npm run seed
```

### Reset Database (Development)
```bash
# Undo all seeders
npm run seed:undo:all

# Undo all migrations
npm run migrate:undo:all

# Re-run migrations
npm run migrate

# Re-seed data
npm run seed
```

### Update Schema
```bash
# 1. Create migration
npx sequelize-cli migration:generate --name your-change

# 2. Edit the migration file

# 3. Run migration
npm run migrate

# 4. Test the change

# 5. If needed, undo
npm run migrate:undo
```

## 🎯 Best Practices

### Migrations

1. **Never modify existing migrations** after they've been run in production
2. **Always include both `up` and `down`** methods
3. **Test rollbacks** - ensure `down()` properly undoes `up()`
4. **Create migrations for schema changes only** - not data changes
5. **Use transactions** for complex migrations

### Seeders

1. **Make seeders idempotent** - safe to run multiple times
2. **Use proper down methods** - clean up seeded data
3. **Order matters** - respect foreign key constraints
4. **Don't seed production data** in version control
5. **Use environment checks** if needed

## 📊 Migration Tracking

Sequelize uses a `sequelize_meta` table to track which migrations have been run:

```sql
SELECT * FROM sequelize_meta;
```

This table contains the filename of each executed migration.

## 🔍 Troubleshooting

### Migration fails
```bash
# Check which migrations have run
npx sequelize-cli db:migrate:status

# Undo last migration
npm run migrate:undo

# Fix the migration file and re-run
npm run migrate
```

### Foreign key constraint errors
- Ensure migrations run in correct order
- Parent tables must exist before child tables
- Check that referenced IDs exist when seeding

### Seeder fails
```bash
# Check database state
psql -U postgres -d kpl_auction -c "\dt"

# Undo and re-run seeders
npm run seed:undo:all
npm run seed
```

### Password hashing in seeders
Seeders use bcryptjs to hash passwords before insertion:
```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash('password123', 10);
```

## 🆚 Migrations vs Models

| Feature | Migrations | Sequelize Models |
|---------|-----------|------------------|
| Purpose | Schema version control | ORM data access |
| When to use | Schema changes | Application code |
| Runs | Once per environment | Every app start |
| Rollback | Yes (via `down()`) | No |

**Key Point:** Models and migrations should be kept in sync!

## 📝 Environment Configuration

Edit `config/database.json` for different environments:

```json
{
  "development": {
    "username": "postgres",
    "password": "admin",
    "database": "kpl_auction",
    "host": "localhost",
    "dialect": "postgres"
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres"
  }
}
```

## 🚀 Production Deployment

### Recommended workflow:

1. **Never run seeders in production** (except initial setup)
2. **Always backup before migrations**
3. **Test migrations in staging first**
4. **Use database transactions**
5. **Have a rollback plan**

```bash
# Production migration
NODE_ENV=production npm run migrate

# Check status
NODE_ENV=production npx sequelize-cli db:migrate:status
```

## 📚 Additional Resources

- [Sequelize CLI Documentation](https://sequelize.org/docs/v6/other-topics/migrations/)
- [Migration Examples](https://github.com/sequelize/cli/tree/main/test/assets)
- [Database Schema](./database.dbml)

---

**Quick Reference:**

```bash
# Setup
npm run migrate          # Create tables
npm run seed            # Add data

# Undo
npm run migrate:undo    # Drop last table
npm run seed:undo       # Remove last seed

# Reset
npm run migrate:undo:all && npm run migrate && npm run seed

# Status
npx sequelize-cli db:migrate:status
npx sequelize-cli db:seed:status
```
