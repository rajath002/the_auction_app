# Demo Accounts Quick Reference

## Available Test Accounts

### 1. Admin Account
- **Email:** `admin@kpl.com`
- **Password:** `admin123`
- **Role:** admin
- **Use for:** Testing admin features, full access

### 2. Test User
- **Email:** `user@kpl.com`
- **Password:** `user123`
- **Role:** user
- **Use for:** Testing regular user features

### 3. Demo User
- **Email:** `demo@kpl.com`
- **Password:** `demo123`
- **Role:** user
- **Use for:** Additional testing, demonstrations

## Quick Login

1. Navigate to: http://localhost:3000
2. Click "Login" button in header
3. Enter one of the emails and passwords above
4. Click "Sign In"

## Viewing All Demo Accounts

Visit the registration page to see all available accounts:
http://localhost:3000/auth/register

## Adding More Accounts

Edit `lib/auth.ts` and add to the `HARDCODED_USERS` array:

```typescript
{
  id: "4",
  name: "Your Name",
  email: "youremail@kpl.com",
  password: "yourpassword",
  role: "user", // or "admin"
}
```

## Protected Routes

These routes require login:
- `/auction`
- `/player-registration`
- `/bulk-player-registration`
- `/teams`

Try accessing them without logging in - you'll be redirected to login page!
