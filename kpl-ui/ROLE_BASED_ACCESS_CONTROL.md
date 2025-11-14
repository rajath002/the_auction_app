# Role-Based Access Control (RBAC)

## Overview
The application now implements role-based access control to restrict access to certain features based on user roles.

## User Roles

### 1. **Admin** (`role: "admin"`)
- **Full Access**: Has access to all features
- **Permissions**:
  - Player Registration (Single & Bulk)
  - Auction Management
  - All other features

### 2. **Manager** (`role: "manager"`)
- **Limited Access**: Can manage auctions but not registrations
- **Permissions**:
  - Auction Management
  - View players and teams
  - Cannot access registration features

### 3. **User** (`role: "user"`)
- **Basic Access**: Read-only access to public features
- **Permissions**:
  - View players
  - View teams
  - View home and about pages
  - Cannot access registration or auction features

## Protected Routes

### Registration Pages (Admin Only)
- `/player-registration` - Single player registration
- `/bulk-player-registration` - Bulk player registration via CSV upload

**Access**: Only users with `role: "admin"`

### Auction Page (Admin & Manager)
- `/auction` - Auction management interface

**Access**: Users with `role: "admin"` OR `role: "manager"`

## Role Hierarchy

| Role | Player Registration | Bulk Registration | Auction Management | View Players | View Teams | View Home/About |
|------|--------------------|--------------------|-------------------|--------------|------------|-----------------|
| **Admin** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **Manager** | ❌ No Access | ❌ No Access | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **User** | ❌ No Access | ❌ No Access | ❌ No Access | ✅ View Only | ✅ View Only | ✅ Full Access |

## Implementation Details

### RoleGuard Component
Location: `components/RoleGuard.tsx`

A reusable component that wraps protected pages to enforce role-based access control.

**Features**:
- Redirects unauthenticated users to login page
- Shows "Access Denied" page for users without required permissions
- Displays loading state during authentication check
- Provides user-friendly error messages with role requirements

**Usage**:
```tsx
<RoleGuard allowedRoles={["admin", "manager"]}>
  <YourProtectedComponent />
</RoleGuard>
```

### Header Navigation
The navigation menu dynamically shows/hides links based on user role:

- **Registration dropdown**: Only visible to admins
- **Auction link**: Only visible to admins and managers
- **Other links**: Visible to all users

## Demo Accounts

From `seeders/20251108000001-seed-users.js`:

| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| `admin@kpl.com` | `admin123` | admin | Full access to all features |
| `auction@kpl.com` | `auction123m` | manager | Auction + view features |
| `user@kpl.com` | `user123` | user | View-only features |
| `demo@kpl.com` | `demo123` | user | View-only features |

## Testing Role-Based Access

1. **Test Admin Access**:
   - Login with `admin@kpl.com` / `admin123`
   - Verify you can see and access:
     - Registration dropdown menu
     - Player Registration page
     - Bulk Player Registration page
     - Auction page

2. **Test Manager Access**:
   - Login with `auction@kpl.com` / `auction123m`
   - Verify you can see and access:
     - Auction page (visible and accessible)
   - Verify you CANNOT see:
     - Registration dropdown menu
   - Verify attempting to access registration URLs shows "Access Denied"

3. **Test User Access**:
   - Login with `user@kpl.com` / `user123`
   - Verify you CANNOT see:
     - Registration dropdown menu
     - Auction link
   - Verify attempting to access protected URLs shows "Access Denied"

## Security Notes

1. **Client-side Protection**: The RoleGuard provides immediate UI feedback and prevents unnecessary navigation
2. **Server-side Protection**: You should also implement API-level authorization to ensure data security
3. **Session Management**: Roles are stored in JWT tokens and refreshed automatically
4. **Password Security**: All passwords are hashed using bcrypt with 10 salt rounds

## Future Enhancements

Consider adding:
- API-level role checks using middleware
- Permission-based access control (PBAC) for granular control
- Role hierarchy system
- Audit logging for sensitive operations
- Two-factor authentication for admin accounts
