import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Get the current user session on the server side
 * @returns The user session or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

/**
 * Require authentication - redirect to login if not authenticated
 * @returns The authenticated user
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/auth/login");
  }
  
  return session.user;
}

/**
 * Require admin role - redirect to home if not admin
 * @returns The authenticated admin user
 */
export async function requireAdmin() {
  const user = await requireAuth();
  
  if (user.role !== "admin") {
    redirect("/");
  }
  
  return user;
}

/**
 * Check if user is authenticated
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

/**
 * Check if user has admin role
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}
