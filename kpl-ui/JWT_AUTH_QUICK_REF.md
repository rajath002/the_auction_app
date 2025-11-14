# JWT Authentication Quick Reference

## Quick Start

### Protect an API Route

```typescript
import { requireAdminOrManager } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const authResult = await requireAdminOrManager(request);
  if (authResult instanceof NextResponse) return authResult;
  
  // Authenticated - proceed with logic
  const { session } = authResult;
}
```

### Check User Role in Component

```typescript
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const isManager = session?.user?.role === 'manager';
}
```

## Authentication Helpers

| Helper | Allowed Roles | Use Case |
|--------|---------------|----------|
| `requireAuth(req)` | Any authenticated user | General protection |
| `requireAuth(req, ['admin'])` | Admin only | Admin-specific routes |
| `requireAdmin(req)` | Admin | Shorthand for admin-only |
| `requireAdminOrManager(req)` | Admin, Auction Manager | Most management routes |
| `requireTeamAccess(req)` | Admin, Manager, Team Owner | Team-related routes |

## User Roles

| Role | Access Level |
|------|--------------|
| `admin` | Full system access |
| `manager` | Manage auctions, players, teams |
| `team_owner` | View/manage own team |
| `viewer` | Read-only access |

## API Endpoints Protection Status

### Players
- `GET /api/players` - 🔒 Authenticated (bid data filtered by role)
- `POST /api/players` - 🔒 Admin/Manager
- `PATCH /api/players` - 🔒 Admin/Manager
- `DELETE /api/players` - 🔒 Admin/Manager

### Teams
- `GET /api/teams` - 🔒 Authenticated
- `POST /api/teams` - 🔒 Admin/Manager
- `PATCH /api/teams` - 🔒 Admin/Manager
- `DELETE /api/teams` - 🔒 Admin Only

### Upload
- `POST /api/upload/imagekit` - 🔒 Admin/Manager

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 401 | Not authenticated | Sign in required |
| 403 | Insufficient permissions | Check user role |
| 500 | Server error | Check logs |

## Testing

### Test Protected Route
```bash
# 1. Login first
POST /api/auth/signin
Body: { "email": "admin@example.com", "password": "password" }

# 2. Make authenticated request (cookie auto-included)
PATCH /api/players
Body: { "id": 1, "bidValue": 5000 }
```

### Check Session in Component
```typescript
const { data: session, status } = useSession();

if (status === 'loading') return <div>Loading...</div>;
if (status === 'unauthenticated') return <div>Please sign in</div>;

// User is authenticated
console.log(session.user.role);
```

## Common Patterns

### Protect Multiple Methods
```typescript
async function checkAuth(req: NextRequest) {
  const authResult = await requireAdminOrManager(req);
  if (authResult instanceof NextResponse) return authResult;
  return authResult.session;
}

export async function POST(req: NextRequest) {
  const session = await checkAuth(req);
  if (session instanceof NextResponse) return session;
  // ... logic
}

export async function PATCH(req: NextRequest) {
  const session = await checkAuth(req);
  if (session instanceof NextResponse) return session;
  // ... logic
}
```

### Conditional UI Rendering
```typescript
function PlayerCard({ player }) {
  const { data: session } = useSession();
  const canEdit = ['admin', 'manager'].includes(session?.user?.role);
  
  return (
    <div>
      <h3>{player.name}</h3>
      {canEdit && <button>Edit</button>}
    </div>
  );
}
```

## Environment Setup

Required in `.env.local`:
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Troubleshooting

**Session undefined in API route?**
- Check NEXTAUTH_SECRET is set
- Verify cookie is being sent

**403 Forbidden?**
- User lacks required role
- Check `session.user.role` value

**401 Unauthorized?**
- User not logged in
- Session expired
- Invalid token

## Best Practices

✅ Always check authentication on write operations
✅ Use appropriate role checks
✅ Log failed auth attempts
✅ Use HTTPS in production
✅ Keep NEXTAUTH_SECRET secure

❌ Don't expose sensitive data to unauthorized users
❌ Don't skip authentication checks
❌ Don't hardcode credentials
❌ Don't store tokens in localStorage

## Documentation

- Full docs: `API_AUTHENTICATION.md`
- Implementation summary: `JWT_AUTHENTICATION_SUMMARY.md`
- This quick reference: `JWT_AUTH_QUICK_REF.md`
