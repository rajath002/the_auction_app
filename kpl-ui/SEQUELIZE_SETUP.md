# Quick Start: PostgreSQL + Sequelize Setup

## ✅ What's Been Set Up

1. **Sequelize ORM** - Connected to PostgreSQL
2. **Database Models** - All tables defined:
   - Users (authentication)
   - Teams
   - Players
   - Sessions
   - AuctionEvents

3. **Database Scripts** - Easy commands to manage DB
4. **Sample API Routes** - Examples using Sequelize

## 🚀 Getting Started

### Step 1: Ensure PostgreSQL is Running

**Option A - Existing PostgreSQL:**
```bash
# Check if running
psql -U postgres -h localhost
```

**Option B - Docker (Quick Setup):**
```bash
docker run --name kpl-postgres -e POSTGRES_PASSWORD=admin -p 5432:5432 -d postgres
```

### Step 2: Create Database
```sql
-- Connect to PostgreSQL
psql -U postgres -h localhost

-- Create database
CREATE DATABASE kpl_auction;

-- Exit
\q
```

### Step 3: Configure Environment
Edit `.env.local` (already configured):
```env
PG_DB_HOST=localhost
PG_DB_PORT=5432
PG_DB_DATABASE=kpl_auction
PG_DB_USERNAME=postgres
PG_DB_PASSWORD=admin
PG_DB_SCHEMA=public
```

### Step 4: Initialize Database
```bash
# Create all tables
npm run db:init

# Seed initial data (users + teams)
npm run db:seed
```

### Step 5: Start Development Server
```bash
npm run dev
```

## 📝 Database Commands

```bash
# Initialize (create tables)
npm run db:init

# Seed data
npm run db:seed

# Reset everything (⚠️ drops all data)
npm run db:reset
```

## 🔐 Default User Accounts

After seeding, you can login with:

| Email | Password | Role |
|-------|----------|------|
| admin@kpl.com | admin123 | admin |
| user@kpl.com | user123 | user |
| demo@kpl.com | demo123 | user |

## 📂 Key Files

- `lib/sequelize.ts` - Database connection
- `models/*.ts` - All database models
- `models/index.ts` - Model exports and associations
- `lib/db-init.ts` - Database initialization & seeding
- `database.dbml` - Database schema definition
- `DATABASE_SETUP.md` - Detailed documentation

## 🔄 Migration from MongoDB to PostgreSQL

Your existing API routes need to be updated. Example files created:
- `app/api/teams/route-sequelize.ts` - Sequelize version
- `app/api/players/route-sequelize.ts` - Sequelize version

To switch:
1. Rename current `route.ts` to `route-mongo.ts` (backup)
2. Rename `route-sequelize.ts` to `route.ts`

## 🧪 Testing the Connection

Create a test page or API route:

```typescript
import { connectDB } from '@/lib/sequelize';
import { Team } from '@/models';

export async function GET() {
  try {
    await connectDB();
    const teams = await Team.findAll();
    return Response.json({ success: true, teams });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
```

## 📚 Next Steps

1. ✅ Database connection established
2. ✅ Models created
3. ✅ Seed data added
4. 🔄 Update API routes to use Sequelize
5. 🔄 Update auth to use User model
6. 🔄 Test all features

## 🆘 Troubleshooting

**Connection refused:**
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env.local`

**Tables not created:**
- Run `npm run db:init`
- Check console for errors

**Need help?**
- See `DATABASE_SETUP.md` for detailed documentation
- Check model files in `models/` folder
- Review Sequelize docs: https://sequelize.org

## 📊 Database Schema Visualization

View the schema:
1. Open `database.dbml`
2. Copy content to https://dbdiagram.io
3. See visual ER diagram

---

**Status:** ✅ PostgreSQL + Sequelize is ready to use!
