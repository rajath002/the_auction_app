# Page Access Control - Quick Reference

## Quick Start

### For Admins

**Access the Management Interface:**
1. Login as admin: `admin@kpl.com` / `admin123`
2. Click **Admin** dropdown in navigation
3. Select **Page Access Management**

**Make a Page Public:**
- Find the page in the table
- Toggle the switch to "Public" (green)

**Make a Page Private:**
- Find the page in the table  
- Toggle the switch to "Private" (gray)

**Add New Page:**
1. Click **Add Page Setting** button
2. Enter page route (e.g., `/my-page`)
3. Enter page name
4. Set public/private access
5. Click **Create**

## Current Default Settings

| Page | Route | Public? | Who Can Access |
|------|-------|---------|----------------|
| Home | `/` | ✅ Yes | Everyone |
| Teams | `/teams` | ✅ Yes | Everyone |
| About Us | `/about-us` | ✅ Yes | Everyone |
| Players List | `/players-list` | ❌ No | Authenticated users |
| Auction | `/auction` | ❌ No | Admin & Manager only |
| Player Registration | `/player-registration` | ❌ No | Admin only |
| Bulk Registration | `/bulk-player-registration` | ❌ No | Admin only |
| Page Access Mgmt | `/page-access-management` | ❌ No | Admin only |

## API Endpoints

### Check If Route Is Public
```bash
GET /api/page-access/check?route=/teams
```

### Get All Settings
```bash
GET /api/page-access
```

### Update Setting (Admin Only)
```bash
PATCH /api/page-access
Body: { "id": 1, "public_access": true }
```

## Important Notes

### ⚠️ Role-Based Routes Override Database
These routes ALWAYS require specific roles, regardless of database settings:
- `/player-registration` → Admin only
- `/bulk-player-registration` → Admin only
- `/auction` → Admin or Manager
- `/page-access-management` → Admin only

### 🔒 Default Behavior
If no setting exists for a route:
- **Default**: Requires authentication (private)
- Add a database entry to make it public

### 🌐 Always Public Routes
These routes ignore database settings:
- `/auth/*` - Login/register pages
- `/api/*` - API endpoints
- `/_next/*` - Next.js internal
- `/favicon.ico` - Static files

## Common Tasks

### Allow Public Access to New Page
1. Create the page in your app
2. Add setting: Route `/new-page`, Public access = ✅
3. Users can now access without login

### Restrict Existing Public Page
1. Find page in management interface
2. Toggle to "Private"
3. Unauthenticated users redirected to login

### Temporarily Close Registration
1. Go to Page Access Management
2. Toggle `/player-registration` to Public (won't work due to role check)
3. Better: Remove from navigation or disable form

## Testing

### Test Public Access
1. Logout completely
2. Visit the page in incognito/private window
3. Should load if public, redirect if private

### Test Private Access
1. Logout
2. Try to access private page
3. Should redirect to `/auth/login`
4. Login and try again

## Database Commands

### View Settings
```sql
SELECT page_route, page_name, public_access 
FROM page_access_settings 
ORDER BY page_route;
```

### Manually Update
```sql
UPDATE page_access_settings 
SET public_access = true 
WHERE page_route = '/teams';
```

### Add New Entry
```sql
INSERT INTO page_access_settings 
(page_route, page_name, public_access, description)
VALUES ('/new-page', 'New Page', true, 'Description');
```

## Troubleshooting

**Problem**: Changes not taking effect
- **Solution**: Restart dev server, clear cookies

**Problem**: Can't access admin page
- **Solution**: Ensure logged in as admin user

**Problem**: Page always redirects to login
- **Solution**: Check database setting, verify route spelling

**Problem**: Public toggle doesn't work
- **Solution**: Check if route is role-based (overrides database)

## Access Hierarchy

```
1. Always Public Routes (auth, api, static)
   ↓
2. Role-Based Routes (registration, auction)
   ↓
3. Database Settings (page_access_settings)
   ↓
4. Default Behavior (require authentication)
```

## Quick Tips

✅ **DO**:
- Use admin interface to manage settings
- Set sensible defaults during seeding
- Document custom page access requirements
- Test in incognito mode

❌ **DON'T**:
- Rely on database for critical role-based pages
- Forget to restart server after major changes
- Make API routes public without authorization
- Remove authentication from sensitive features

## Need Help?

See full documentation: [PAGE_ACCESS_CONTROL.md](./PAGE_ACCESS_CONTROL.md)
