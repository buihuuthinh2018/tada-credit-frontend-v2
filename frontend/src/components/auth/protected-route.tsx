"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  requiredRoles?: string[];
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
  requiredRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, hasPermission, hasRole, hasAnyRole } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small delay to allow hydration
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      if (requiredPermission && !hasPermission(requiredPermission)) {
        router.push("/unauthorized");
        return;
      }

      if (requiredRole && !hasRole(requiredRole)) {
        router.push("/unauthorized");
        return;
      }

      if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
        router.push("/unauthorized");
        return;
      }

      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, requiredPermission, requiredRole, requiredRoles, router, hasPermission, hasRole, hasAnyRole]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-8 w-64" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return null;
  }

  return <>{children}</>;
}
