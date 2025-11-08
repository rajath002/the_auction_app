# PostgreSQL + Sequelize Setup Guide

## Overview
This project uses PostgreSQL as the database and Sequelize ORM for data modeling and queries.

## Database Schema
See `database.dbml` for the complete database schema definition.

## Environment Variables
Configure your PostgreSQL connection in `.env.local`:

```env
PG_DB_HOST=localhost
PG_DB_PORT=5432
PG_DB_DATABASE=kpl_auction
PG_DB_USERNAME=postgres
PG_DB_PASSWORD=your_password
PG_DB_SCHEMA=public
```

## Installation

1. **Install PostgreSQL**
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=admin -p 5432:5432 -d postgres`

2. **Create Database**
   ```sql
   CREATE DATABASE kpl_auction;
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

## Database Commands

### Initialize Database
Creates all tables based on Sequelize models:
```bash
npm run db:init
```

### Seed Database
Populates initial data (users, teams):
```bash
npm run db:seed
```

### Reset Database
Drops all tables and recreates them with seed data (⚠️ destructive):
```bash
npm run db:reset
```

## Models

### Available Models
- **User** - Authentication users (`models/User.ts`)
- **Team** - Auction teams (`models/Team.ts`)
- **Player** - Players for auction (`models/Player.ts`)
- **Session** - User sessions (`models/Session.ts`)
- **AuctionEvent** - Bidding history (`models/AuctionEvent.ts`)

### Model Relationships
```
Team ──< Player (One-to-Many)
User ──< Session (One-to-Many)
Player ──< AuctionEvent (One-to-Many)
Team ──< AuctionEvent (One-to-Many)
```

## Usage Examples

### Import Models
```typescript
import { User, Team, Player, Session, AuctionEvent } from '@/models';
```

### Query Examples

#### Find All Teams
```typescript
const teams = await Team.findAll();
```

#### Find Team with Players
```typescript
const team = await Team.findByPk(1, {
  include: [{ model: Player, as: 'players' }]
});
```

#### Create a Player
```typescript
const player = await Player.create({
  name: 'John Doe',
  type: PlayerType.BATSMAN,
  category: PlayerCategory.L1,
  base_value: 500,
  current_bid: 0,
});
```

#### Update Player Team
```typescript
await player.update({
  current_team_id: 1,
  status: PlayerStatus.SOLD,
  bid_value: 1200
});
```

#### Complex Query with Joins
```typescript
const auctionEvents = await AuctionEvent.findAll({
  include: [
    { model: Player, as: 'player' },
    { model: Team, as: 'team' }
  ],
  order: [['created_at', 'DESC']],
  limit: 10
});
```

### Authentication Example
```typescript
import { User, UserRole } from '@/models/User';

// Create user (password will be hashed automatically)
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: UserRole.USER
});

// Validate password
const isValid = await user.validatePassword('password123'); // true
```

## API Route Example

```typescript
// app/api/teams/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Team, Player } from '@/models';

export async function GET() {
  try {
    const teams = await Team.findAll({
      include: [{ model: Player, as: 'players' }]
    });
    
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
```

## Migrations (Optional)

For production, consider using Sequelize migrations:

```bash
# Generate migration
npx sequelize-cli migration:generate --name create-users

# Run migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo
```

## Troubleshooting

### Connection Issues
- Verify PostgreSQL is running: `psql -U postgres -h localhost`
- Check `.env.local` configuration
- Ensure database exists: `CREATE DATABASE kpl_auction;`

### Model Sync Issues
- Run `npm run db:reset` to recreate all tables
- Check Sequelize logs in console

### Type Errors
- Ensure all models are properly typed
- Use enums for constrained values (PlayerType, UserRole, etc.)

## Resources
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [DBML Specification](https://dbml.dbdiagram.io/docs/)
