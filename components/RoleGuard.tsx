"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Result, Button, Spin } from "antd";
import { LockOutlined } from "@ant-design/icons";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export default function RoleGuard({ children, allowedRoles, redirectTo = "/" }: RoleGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <Spin size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!session) {
    return null;
  }

  // Check if user has the required role
  const hasRequiredRole = allowedRoles.includes(session.user.role);

  if (!hasRequiredRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <div className="w-full max-w-md">
          <Result
            status="403"
            icon={<LockOutlined className="text-red-500" style={{ fontSize: 72 }} />}
            title={<span className="text-white">Access Denied</span>}
            subTitle={
              <span className="text-gray-400">
                You don&apos;t have permission to access this page. Required role:{" "}
                <span className="font-semibold text-yellow-300">
                  {allowedRoles.join(" or ")}
                </span>
              </span>
            }
            extra={
              <Button
                type="primary"
                onClick={() => router.push(redirectTo)}
                className="!bg-amber-400 !font-semibold !text-gray-900 hover:!bg-amber-300"
              >
                Go Back Home
              </Button>
            }
            className="rounded-xl border border-white/10 bg-gray-900/50 p-8 backdrop-blur"
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
