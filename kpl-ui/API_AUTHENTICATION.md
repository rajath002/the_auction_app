# API Authentication with JWT

## Overview

All API routes are now protected with JWT-based authentication using NextAuth.js. The authentication is handled automatically when users are logged in through the NextAuth session.

## Authentication Flow

1. **User Login**: Users authenticate via `/api/auth/signin` using credentials
2. **JWT Token**: NextAuth generates a JWT token stored in an HTTP-only cookie
3. **API Requests**: The JWT token is automatically included in API requests
4. **Verification**: API routes verify the JWT token using `getServerSession()`

## Protected Routes

### Authentication Helpers

Located in `/lib/api-auth.ts`, the following helpers are available:

#### `requireAuth(request, allowedRoles?)`
Protects any API route and optionally checks for specific roles.

```typescript
const authResult = await requireAuth(request, ["admin", "manager"]);
if (authResult instanceof NextResponse) {
  return authResult; // Returns 401 or 403 error
}
const { session } = authResult; // Get authenticated session
```

#### `requireAdmin(request)`
Shorthand for admin-only access.

```typescript
const authResult = await requireAdmin(request);
if (authResult instanceof NextResponse) {
  return authResult;
}
```

#### `requireAdminOrManager(request)`
Allows access to admin and manager roles.

```typescript
const authResult = await requireAdminOrManager(request);
if (authResult instanceof NextResponse) {
  return authResult;
}
```

#### `requireTeamAccess(request)`
Allows access to admin, manager, and team_owner roles.

```typescript
const authResult = await requireTeamAccess(request);
if (authResult instanceof NextResponse) {
  return authResult;
}
```

## User Roles

The system supports the following roles:

- **admin**: Full system access
- **manager**: Can manage auctions, players, and teams
- **team_owner**: Can view and manage their own team
- **viewer**: Read-only access to public data

## Protected API Endpoints

### Players API

- **GET** `/api/players` - 🔒 Authenticated (sensitive data filtered by role)
- **POST** `/api/players` - Admin/Manager only (create players)
- **PATCH** `/api/players` - Admin/Manager only (update players)
- **DELETE** `/api/players` - Admin/Manager only (delete players)

### Players API v2

- **GET** `/api/v2/players` - 🔒 Authenticated (sensitive data filtered by role)
- **POST** `/api/v2/players` - Admin/Manager only (create players)
- **PATCH** `/api/v2/players` - Admin/Manager only (update players)
- **DELETE** `/api/v2/players` - Admin/Manager only (delete players)

### Teams API

- **GET** `/api/teams` - 🔒 Authenticated (all users can view)
- **POST** `/api/teams` - Admin/Manager only (create teams)
- **PATCH** `/api/teams` - Admin/Manager only (update teams)
- **DELETE** `/api/teams` - Admin only (delete teams)

### Teams API v2

- **GET** `/api/v2/teams` - 🔒 Authenticated (sensitive data filtered by role)
- **POST** `/api/v2/teams` - Admin/Manager only (create teams)
- **PATCH** `/api/v2/teams` - Admin/Manager only (update teams)

### Page Access API

- **GET** `/api/page-access` - Public (view settings)
- **POST** `/api/page-access` - Admin only (create settings)
- **PATCH** `/api/page-access` - Admin only (update settings)
- **DELETE** `/api/page-access` - Admin only (delete settings)

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "error": "Unauthorized. Please sign in."
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "error": "Forbidden. You do not have permission to access this resource."
}
```

## Client-Side Usage

### Using with Fetch

The JWT token is automatically included in requests when using `fetch` from authenticated pages:

```typescript
const response = await fetch('/api/players', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id: playerId,
    bidValue: newBid,
  }),
});
```

### Using with Axios

```typescript
import axios from 'axios';

const response = await axios.patch('/api/players', {
  id: playerId,
  bidValue: newBid,
});
```

### Checking Authentication Status

```typescript
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Not logged in</div>;
  
  // User is authenticated
  const userRole = session.user.role;
  const canEdit = userRole === 'admin' || userRole === 'manager';
  
  return <div>Welcome {session.user.name}!</div>;
}
```

## Security Features

1. **HTTP-Only Cookies**: JWT tokens are stored in HTTP-only cookies, preventing XSS attacks
2. **Role-Based Access Control**: Fine-grained permissions based on user roles
3. **Automatic Token Validation**: NextAuth validates tokens on every request
4. **Session Expiry**: Sessions expire after 30 days of inactivity
5. **Secure Password Handling**: Passwords are hashed using bcrypt

## Environment Variables

Ensure the following environment variables are set:

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

## Testing Authentication

### Test with cURL

```bash
# First, get the session cookie by logging in
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  -c cookies.txt

# Use the cookie for authenticated requests
curl http://localhost:3000/api/players \
  -b cookies.txt
```

### Test with Postman

1. Login via `/api/auth/signin`
2. Postman will automatically capture the session cookie
3. Use the cookie for subsequent API requests

## Troubleshooting

### 401 Unauthorized Error
- User is not logged in
- Session has expired
- JWT token is invalid or missing

**Solution**: Redirect to login page or refresh the session

### 403 Forbidden Error
- User is logged in but lacks required permissions
- User role doesn't match the allowed roles for the endpoint

**Solution**: Check user role and permissions

### Session Not Persisting
- Check NEXTAUTH_SECRET is set correctly
- Verify NEXTAUTH_URL matches your domain
- Check cookie settings in browser

## Best Practices

1. **Always validate authentication** on sensitive operations
2. **Use appropriate role checks** for different endpoints
3. **Log authentication failures** for security monitoring
4. **Implement rate limiting** to prevent brute force attacks
5. **Use HTTPS in production** to protect session cookies
6. **Rotate NEXTAUTH_SECRET** periodically

## Migration Notes

If you have existing API clients:

1. Ensure clients can handle cookies (most browsers and HTTP clients do by default)
2. Update error handling to check for 401/403 status codes
3. Implement login/logout flows in your clients
4. Test all API endpoints with different user roles

## Future Enhancements

- [ ] Add refresh token mechanism
- [ ] Implement API key authentication for external services
- [ ] Add request rate limiting
- [ ] Add audit logging for sensitive operations
- [ ] Implement two-factor authentication (2FA)
