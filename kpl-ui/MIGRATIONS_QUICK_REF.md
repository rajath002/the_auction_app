# Database Setup - Quick Reference Card

## 📦 What Was Created

### Migrations (5 files)
```
migrations/
├── 20241107000001-create-users.js          ✅ Users table
├── 20241107000002-create-teams.js          ✅ Teams table
├── 20241107000003-create-players.js        ✅ Players table
├── 20241107000004-create-sessions.js       ✅ Sessions table
└── 20241107000005-create-auction-events.js ✅ Auction events table
```

### Seeders (3 files)
```
seeders/
├── 20241107000001-seed-users.js    ✅ 3 user accounts
├── 20241107000002-seed-teams.js    ✅ 5 teams
└── 20241107000003-seed-players.js  ✅ All players
```

### Configuration
```
config/
└── database.json          ✅ DB connection config
.sequelizerc.js           ✅ Sequelize CLI config
.eslintignore             ✅ Ignore migrations/seeders from linting
```

## 🚀 Commands Added to package.json

### Migration Commands
```bash
npm run migrate              # Run all migrations (create tables)
npm run migrate:undo         # Undo last migration
npm run migrate:undo:all     # Drop all tables
```

### Seeder Commands
```bash
npm run seed                 # Run all seeders (add data)
npm run seed:undo            # Remove last seed data
npm run seed:undo:all        # Remove all seed data
```

### Original Commands (still available)
```bash
npm run db:init              # Initialize DB with Sequelize models
npm run db:seed              # Seed using lib/db-init.ts
npm run db:reset             # Reset using lib/db-init.ts
```

## 🎯 Typical Workflows

### First Time Setup
```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE kpl_auction;"

# 2. Run migrations
npm run migrate

# 3. Seed data
npm run seed

# 4. Start app
npm run dev
```

### Reset Everything (Development)
```bash
npm run seed:undo:all && npm run migrate:undo:all && npm run migrate && npm run seed
```

### Add New Column
```bash
# 1. Generate migration
npx sequelize-cli migration:generate --name add-new-column

# 2. Edit migration file
# migrations/TIMESTAMP-add-new-column.js

# 3. Run migration
npm run migrate
```

## 📊 Database Schema

### Tables Created
1. **users** - Authentication (3 seeded)
2. **teams** - Auction teams (5 seeded)
3. **players** - Players for auction (all from JSON)
4. **sessions** - User sessions (empty initially)
5. **auction_events** - Bidding history (empty initially)

### Relationships
```
users ──< sessions
teams ──< players
teams ──< auction_events
players ──< auction_events
```

## 🔐 Seeded Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@kpl.com | admin123 | admin |
| user@kpl.com | user123 | user |
| demo@kpl.com | demo123 | user |

## 🏆 Seeded Teams

1. KGF (Jaya Shetty)
2. Silver Squad (Guruprasad)
3. Shabari Strikers (Rajesh Shetty)
4. Ocean Stunners (Ashok Devadiga)
5. Bhoomi Fighters (Dheeraj Kulal)

## 🎮 Seeded Players

- All players from `data/players.json`
- Types: Batsman, Bowler, All-Rounder, Wicket-Keeper
- Categories: L1, L2, L3, L4
- Initial status: Available/Null

## 🔍 Check Status

```bash
# Check migration status
npx sequelize-cli db:migrate:status

# Check seeder status
npx sequelize-cli db:seed:status

# Check tables in database
psql -U postgres -d kpl_auction -c "\dt"

# Check data count
psql -U postgres -d kpl_auction -c "SELECT 'users' as table, COUNT(*) FROM users UNION ALL SELECT 'teams', COUNT(*) FROM teams UNION ALL SELECT 'players', COUNT(*) FROM players;"
```

## 🆘 Troubleshooting

### Database doesn't exist
```bash
psql -U postgres -c "CREATE DATABASE kpl_auction;"
```

### Tables already exist
```bash
npm run migrate:undo:all
npm run migrate
```

### Foreign key errors
```bash
# Check migration order - they must run in sequence
# Users → Teams → Players → Sessions → AuctionEvents
```

### Connection refused
```bash
# Check PostgreSQL is running
pg_isready

# Check credentials in config/database.json
```

## 📚 Documentation Files

- `MIGRATIONS_GUIDE.md` - Complete migrations & seeders guide
- `DATABASE_SETUP.md` - Sequelize setup documentation
- `SEQUELIZE_SETUP.md` - Quick start guide
- `database.dbml` - Database schema definition

## 💡 Key Differences

### Migrations vs db:init

| Method | Migrations | db:init |
|--------|-----------|---------|
| Command | `npm run migrate` | `npm run db:init` |
| Uses | Sequelize CLI | Sequelize ORM |
| Creates | Tables via SQL | Tables via model.sync() |
| Version Control | ✅ Yes | ❌ No |
| Rollback | ✅ Yes | ❌ No |
| Production | ✅ Recommended | ❌ Not recommended |

**Recommendation:** Use migrations for production-grade schema management.

## 🎯 Next Steps

1. ✅ Migrations created
2. ✅ Seeders created
3. ✅ Configuration set up
4. 🔄 Run migrations: `npm run migrate`
5. 🔄 Run seeders: `npm run seed`
6. 🔄 Update API routes to use Sequelize
7. 🔄 Test application

---

**Quick Start:**
```bash
npm run migrate && npm run seed && npm run dev
```

**Status:** ✅ Migrations and seeders are ready to use!
