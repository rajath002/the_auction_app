# Page Access Control System

## Overview
The Page Access Control System allows administrators to dynamically control which pages are accessible to unauthenticated users. This provides granular control over public vs. private content without code changes.

## Architecture

### Components

1. **Database Table**: `page_access_settings`
   - Stores configuration for each page/route
   - Tracks public/private access status
   - Managed through admin interface

2. **Sequelize Model**: `PageAccessSetting`
   - TypeScript model for database operations
   - Located: `models/PageAccessSetting.ts`

3. **API Endpoints**: `/api/page-access/*`
   - CRUD operations for managing settings
   - Role-based authorization (admin only)

4. **Middleware**: `middleware.ts`
   - Intercepts all requests
   - Checks authentication and page access
   - Redirects unauthorized users

5. **Admin Interface**: `/page-access-management`
   - UI for managing page access settings
   - Toggle public/private access
   - Add/edit/delete page settings

## Database Schema

```sql
CREATE TABLE page_access_settings (
  id SERIAL PRIMARY KEY,
  page_route VARCHAR(255) NOT NULL UNIQUE,
  page_name VARCHAR(255) NOT NULL,
  public_access BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Fields

- **id**: Auto-incrementing primary key
- **page_route**: The URL path (e.g., `/`, `/teams`, `/players-list`)
- **page_name**: Human-readable page name
- **public_access**: `true` = accessible without login, `false` = requires authentication
- **description**: Optional description of the page
- **created_at/updated_at**: Automatic timestamps

## Default Settings

The system comes pre-configured with sensible defaults:

| Page Route | Page Name | Public Access | Description |
|-----------|-----------|---------------|-------------|
| `/` | Home | ✅ Public | Landing page |
| `/teams` | Teams | ✅ Public | View teams and players |
| `/about-us` | About Us | ✅ Public | Information about KPL |
| `/players-list` | Players List | ❌ Private | Requires authentication |
| `/auction` | Auction | ❌ Private | Admin/Manager only (role-based) |
| `/player-registration` | Player Registration | ❌ Private | Admin only (role-based) |
| `/bulk-player-registration` | Bulk Registration | ❌ Private | Admin only (role-based) |
| `/page-access-management` | Page Access Management | ❌ Private | Admin only (role-based) |

## Access Control Flow

```
1. User requests page → 
2. Middleware intercepts →
3. Check if always public route (login, register, API) → Allow
4. Check if protected route (role-based) → Check role → Allow/Deny
5. Query page_access_settings table →
6. If public_access = true → Allow
7. If public_access = false AND not authenticated → Redirect to login
8. If authenticated → Allow
```

## API Endpoints

### 1. Get All Settings
```http
GET /api/page-access
```
**Response**: Array of all page access settings

### 2. Check Specific Route
```http
GET /api/page-access/check?route=/teams
```
**Response**:
```json
{
  "route": "/teams",
  "page_name": "Teams",
  "public_access": true,
  "description": "View all teams"
}
```

### 3. Create Setting (Admin Only)
```http
POST /api/page-access
Content-Type: application/json

{
  "page_route": "/new-page",
  "page_name": "New Page",
  "public_access": false,
  "description": "Description"
}
```

### 4. Update Setting (Admin Only)
```http
PATCH /api/page-access
Content-Type: application/json

{
  "id": 1,
  "public_access": true
}
```

### 5. Delete Setting (Admin Only)
```http
DELETE /api/page-access?id=1
```

## Admin Interface

### Accessing the Management Page

1. Login as admin: `admin@kpl.com` / `admin123`
2. Click **Admin** dropdown in header
3. Select **Page Access Management**

### Features

- **View All Settings**: See all pages and their access status
- **Toggle Access**: Quick switch between public/private
- **Add New Page**: Define access for new routes
- **Edit Settings**: Update page name, route, or description
- **Delete Settings**: Remove page access configurations

### Using the Interface

#### Toggle Public Access
- Click the switch in the "Public Access" column
- Changes take effect immediately
- Green = Public, Gray = Private

#### Add New Page
1. Click **Add Page Setting** button
2. Fill in:
   - **Page Route**: URL path (e.g., `/my-page`)
   - **Page Name**: Display name
   - **Public Access**: Toggle on/off
   - **Description**: Optional details
3. Click **Create**

#### Edit Existing Page
1. Click **Edit** button for the page
2. Modify fields (route cannot be changed)
3. Click **Update**

#### Delete Page Setting
1. Click **Delete** button
2. Confirm deletion
3. Page setting is removed (default behavior applies)

## Middleware Logic

### Always Public Routes (No Check)
- `/auth/*` - Login, register, error pages
- `/api/*` - API endpoints
- `/_next/*` - Next.js internal routes
- `/favicon.ico` - Static assets

### Role-Based Protected Routes
These routes bypass database checks and use hard-coded role requirements:

| Route | Required Roles |
|-------|----------------|
| `/player-registration` | admin |
| `/bulk-player-registration` | admin |
| `/auction` | admin, manager |
| `/page-access-management` | admin |

### Database-Controlled Routes
All other routes query `page_access_settings`:
- If setting exists and `public_access = true` → Allow everyone
- If setting exists and `public_access = false` → Require authentication
- If no setting exists → Default to requiring authentication

## Setup Instructions

### 1. Run Migration
```bash
npx sequelize-cli db:migrate
```

### 2. Seed Default Data
```bash
npx sequelize-cli db:seed --seed 20251115000001-seed-page-access-settings.js
```

### 3. Verify Database
```sql
SELECT * FROM page_access_settings;
```

### 4. Test Access Control
1. Log out completely
2. Try accessing `/teams` → Should work (public)
3. Try accessing `/players-list` → Redirected to login (private)
4. Login as admin
5. Access `/page-access-management` → Manage settings

## Security Considerations

### Multi-Layer Protection

1. **Middleware**: First line of defense at request level
2. **RoleGuard Component**: Client-side protection for pages
3. **API Authorization**: Server-side checks in API routes
4. **Database-Driven**: Centralized configuration

### Best Practices

- **Role-Based Routes**: Critical pages (registration, auction) use hard-coded role checks
- **Default Deny**: If no setting exists, default to requiring authentication
- **Admin Only Management**: Only admins can modify page access settings
- **Audit Trail**: `created_at` and `updated_at` track changes

### Important Notes

⚠️ **Role-based routes take precedence over database settings**
- Even if you set `/auction` to public, it still requires admin/manager role

⚠️ **API routes are not checked**
- Implement authorization in individual API endpoints

⚠️ **Client-side routing**
- Use RoleGuard component for additional protection

## Common Use Cases

### Make a Page Public
1. Login as admin
2. Go to Page Access Management
3. Find the page in the table
4. Toggle the switch to "Public"

### Make a Page Private
1. Login as admin
2. Go to Page Access Management
3. Toggle the switch to "Private"
4. Unauthenticated users will be redirected to login

### Add New Protected Page
1. Create your Next.js page component
2. Login as admin
3. Go to Page Access Management
4. Click "Add Page Setting"
5. Enter route and set access level

### Remove Page Protection
1. Option A: Toggle to "Public" (keeps setting)
2. Option B: Delete setting (defaults to private)

## Troubleshooting

### Page Not Redirecting to Login
- Check if route is in `alwaysPublicRoutes` array
- Verify database has setting for the route
- Check middleware matcher configuration

### Can't Access Admin Page
- Ensure logged in as admin user
- Check session has `role: "admin"`
- Verify middleware allows the route

### Changes Not Taking Effect
- Middleware caches may need refresh
- Try restarting the dev server
- Clear browser session/cookies

### Database Errors
```bash
# Check if migration ran
npx sequelize-cli db:migrate:status

# Re-run migration if needed
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:migrate
```

## Future Enhancements

Potential improvements to consider:

1. **Permission Groups**: Create reusable permission sets
2. **Time-Based Access**: Schedule when pages are public/private
3. **IP Whitelisting**: Allow specific IPs without authentication
4. **Audit Logging**: Track who changes settings and when
5. **Bulk Operations**: Change multiple pages at once
6. **API Rate Limiting**: Prevent abuse of public endpoints
7. **Content Visibility**: Partial content for public vs. authenticated
8. **Role-Based Content**: Show different content based on role

## Related Documentation

- [ROLE_BASED_ACCESS_CONTROL.md](./ROLE_BASED_ACCESS_CONTROL.md) - Role system details
- [AUTHENTICATION.md](./AUTHENTICATION.md) - Authentication setup
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database configuration

## Summary

The Page Access Control System provides:
- ✅ Dynamic control over page access without code changes
- ✅ Admin-friendly UI for managing settings
- ✅ Secure middleware-based enforcement
- ✅ Flexible public/private configuration
- ✅ Seamless integration with existing role-based system
- ✅ Default sensible settings for common pages

This system ensures you have complete control over what content is accessible to the public while maintaining security for sensitive features.
