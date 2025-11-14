import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define routes that should always be public (no database check needed)
const alwaysPublicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/api",
  "/_next",
  "/favicon.ico",
];

// Define routes that require specific roles
const protectedRoutes = {
  "/player-registration": ["admin"],
  "/bulk-player-registration": ["admin"],
  "/auction": ["admin", "manager"],
  "/page-access-management": ["admin"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for always public routes
  if (alwaysPublicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get the user's session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if route requires specific role
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      // Not authenticated - redirect to login
      if (!token) {
        const url = new URL("/auth/login", request.url);
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }

      // Check if user has required role
      if (!allowedRoles.includes(token.role as string)) {
        // User doesn't have permission - redirect to home
        return NextResponse.redirect(new URL("/", request.url));
      }

      // User is authenticated and authorized
      return NextResponse.next();
    }
  }

  // For other routes, check page_access_settings from database
  try {
    // Try to fetch page access setting
    const apiUrl = new URL("/api/page-access/check", request.url);
    apiUrl.searchParams.set("route", pathname);

    const response = await fetch(apiUrl.toString(), {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      // If page requires authentication and user is not logged in
      if (!data.public_access && !token) {
        const url = new URL("/auth/login", request.url);
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }
    } else {
      // If no setting found, default to requiring authentication
      if (!token) {
        const url = new URL("/auth/login", request.url);
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    console.error("Error checking page access:", error);
    // On error, default to requiring authentication for safety
    if (!token) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
