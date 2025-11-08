"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook to require authentication for a page
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectUrl: string = "/auth/login") {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (!session) {
      router.push(redirectUrl);
    }
  }, [session, status, router, redirectUrl]);

  return { session, status, isLoading: status === "loading" };
}

/**
 * Hook to check if user has a specific role
 */
export function useRole(requiredRole: string) {
  const { data: session, status } = useSession();

  const hasRole =
    status === "authenticated" && session?.user?.role === requiredRole;

  return { hasRole, role: session?.user?.role, status };
}

/**
 * Hook to get current user info
 */
export function useCurrentUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    status,
  };
}
