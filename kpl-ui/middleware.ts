import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Protect routes like "/" (home) and any other protected pages
export async function middleware(req: NextRequest) {
  // Token from NextAuth JWT
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  console.log("MIDDLEWARE : Token:", token);
  
  const { pathname } = req.nextUrl;

  // const dt = await req.json();
  const secret = process.env.NEXTAUTH_SECRET;

  console.log("Data : ", "Secret : ", secret);

  debugger;
  // Allow access if:
  // 1) Token exists, meaning user is authenticated
  // 2) Request is for a public file (/_next/static, favicon, etc.)
  // 3) Request is for the NextAuth API (which doesn't need to be protected)
  if (token || pathname.startsWith("/api/auth") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // If no token, and it's a protected route, redirect to login page
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"], // Protect the home page
};
