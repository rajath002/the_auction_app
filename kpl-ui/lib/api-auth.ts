import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Session data interface
 */
export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

/**
 * Role-based access control levels
 */
export type UserRole = "admin" | "manager" | "team_owner" | "viewer";

/**
 * Verify JWT token and return session
 * This uses NextAuth's getServerSession which validates the JWT automatically
 */
export async function verifyAuth(request: NextRequest): Promise<AuthSession | null> {
  try {
    const session = await getServerSession(authOptions);
    return session as AuthSession | null;
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(session: AuthSession | null, allowedRoles: UserRole[]): boolean {
  if (!session?.user?.role) return false;
  return allowedRoles.includes(session.user.role as UserRole);
}

/**
 * Middleware to protect API routes
 * Returns session if authenticated, or error response if not
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles?: UserRole[]
): Promise<{ session: AuthSession } | NextResponse> {
  const session = await verifyAuth(request);

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Please sign in." },
      { status: 401 }
    );
  }

  // Check role-based access if roles are specified
  if (allowedRoles && !hasRole(session, allowedRoles)) {
    return NextResponse.json(
      {
        success: false,
        error: "Forbidden. You do not have permission to access this resource.",
      },
      { status: 403 }
    );
  }

  return { session };
}

/**
 * Helper to check if user is admin
 */
export async function requireAdmin(request: NextRequest) {
  return requireAuth(request, ["admin"]);
}

/**
 * Helper to check if user is admin or auction manager
 */
export async function requireAdminOrManager(request: NextRequest) {
  return requireAuth(request, ["admin", "manager"]);
}

/**
 * Helper to check if user is admin, auction manager, or team owner
 */
export async function requireTeamAccess(request: NextRequest) {
  return requireAuth(request, ["admin", "manager", "team_owner"]);
}

/**
 * Extract and validate bearer token from Authorization header
 * This is for custom JWT validation if needed (NextAuth handles it automatically)
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Check if user is logged in as Admin or Manager and return the role
 * Returns 'admin' or 'manager' if logged in with those roles, undefined otherwise
 */
export async function getAdminOrManagerRole(request: NextRequest): Promise<'admin' | 'manager' | 'team_owner' | 'user' | undefined> {
  try {
    const session = await verifyAuth(request);
    
    if (!session?.user?.role) {
      return undefined;
    }

    const userRole = session.user.role;
    
    if (userRole === 'admin' || userRole === 'manager' || userRole === 'team_owner' || userRole === 'user') {
      return userRole as 'admin' | 'manager' | 'team_owner' | 'user';
    }
    
    return undefined;
  } catch (error) {
    console.error("Error checking admin/manager role:", error);
    return undefined;
  }
}
