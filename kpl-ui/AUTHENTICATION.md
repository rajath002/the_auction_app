# Authentication Setup Guide

This application uses **NextAuth.js** for authentication with **hardcoded demo accounts** for testing.

## Features

✅ Demo user accounts for quick testing  
✅ JWT-based session management  
✅ Protected routes with middleware  
✅ Role-based user system (admin/user)  
✅ Automatic session persistence  

## Demo Accounts

The following accounts are available for testing:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Admin User | admin@kpl.com | admin123 | admin |
| Test User | user@kpl.com | user123 | user |
| Demo User | demo@kpl.com | demo123 | user |

**Note:** Registration is currently disabled. Use the demo accounts above to login.

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with the following:

```bash
NEXTAUTH_SECRET=your-secret-key-here  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

**Note:** MongoDB credentials are NOT required as authentication uses hardcoded accounts.

### 2. Start the Application

```bash
npm run dev
```

### 3. Login

1. Go to http://localhost:3000
2. Click "Login" in the header
3. Use any of the demo accounts above
4. You'll be redirected to the home page upon successful login

## Protected Routes

The following routes are protected and require authentication (configured in `middleware.ts`):
- `/auction/*`
- `/player-registration/*`
- `/bulk-player-registration/*`
- `/teams/*`

Unauthenticated users will be redirected to `/auth/login`.

## API Routes

**NextAuth.js Routes:**
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handler
  - `/api/auth/signin` - Sign in
  - `/api/auth/signout` - Sign out
  - `/api/auth/session` - Get session
  - `/api/auth/csrf` - Get CSRF token

**Registration Route:**
- `POST /api/auth/register` - Currently disabled, returns demo account information

## Session Management

The application uses JWT strategy for sessions:
- Sessions expire after 30 days
- Sessions include user ID, email, name, and role
- Sessions are automatically refreshed on page loads

## Accessing User Session

### In Server Components
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    console.log(session.user.name);
    console.log(session.user.email);
    console.log(session.user.role);
  }
  
  return <div>...</div>;
}
```

### In Client Components
```typescript
"use client";
import { useSession } from "next-auth/react";

export default function Component() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (session) {
    return <div>Welcome, {session.user.name}!</div>;
  }
  
  return <div>Please log in</div>;
}
```

### In API Routes
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  // Your API logic here
}
```

## Logout

Users can log out by clicking the "Logout" button in the header, or programmatically:

```typescript
import { signOut } from "next-auth/react";

// In a client component
await signOut({ callbackUrl: "/" });
```

## Customization

### Adding More Authentication Providers

Edit `lib/auth.ts` to add more providers (Google, GitHub, etc.):

```typescript
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({ /* ... */ }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // ...
};
```

### Customizing User Roles

Edit the `HARDCODED_USERS` array in `lib/auth.ts` to modify or add users:

```typescript
const HARDCODED_USERS = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@kpl.com",
    password: "admin123",
    role: "admin",
  },
  // Add more users here...
];
```

### Protecting Specific Routes

Add or remove routes in `middleware.ts`:

```typescript
export const config = {
  matcher: [
    "/auction/:path*",
    "/admin/:path*", // Add new protected route
    // Add more routes as needed
  ],
};
```

## Troubleshooting

### "Invalid credentials" error
- Check that you're using one of the demo account emails
- Verify the password matches exactly (case-sensitive)
- Try: admin@kpl.com / admin123

### Session not persisting
- Ensure `NEXTAUTH_SECRET` is set in `.env.local`
- Check browser cookies are enabled
- Verify `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try logging in again

### Protected routes not working
- Check middleware configuration in `middleware.ts`
- Verify session is active (check browser console)
- Clear browser cookies and log in again

## Security Notes

⚠️ **Important:** This setup uses hardcoded credentials for DEVELOPMENT/TESTING only.

For production:
- Replace hardcoded users with a proper database (MongoDB, PostgreSQL, etc.)
- Implement password hashing with bcrypt
- Add user registration functionality
- Enable HTTPS
- Use strong, unique NEXTAUTH_SECRET

## Next Steps for Production

- [ ] Connect to MongoDB for user storage
- [ ] Implement password hashing
- [ ] Add user registration functionality
- [ ] Add password reset functionality
- [ ] Implement email verification
- [ ] Add OAuth providers (Google, GitHub, etc.)
- [ ] Add two-factor authentication
- [ ] Implement rate limiting for login attempts
