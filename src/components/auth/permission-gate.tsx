"use client";

import { useAuth } from "@/hooks/use-auth";

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  role?: string;
  roles?: string[];
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  permission,
  role,
  roles,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasRole, hasAnyRole } = useAuth();

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
