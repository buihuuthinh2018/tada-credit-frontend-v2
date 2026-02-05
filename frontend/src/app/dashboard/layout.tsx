"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Sidebar } from "@/components/layouts/sidebar";
import { Header } from "@/components/layouts/header";
import { useCurrentUserQuery } from "@/hooks/use-users";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch current user on layout mount to ensure fresh data
  useCurrentUserQuery();
  
  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-6 bg-gray-50">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
