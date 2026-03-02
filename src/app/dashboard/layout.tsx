"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";
import { DashboardHeader } from "@/components/layouts/dashboard-header";
import { BottomNav } from "@/components/layouts/bottom-nav";
import { FloatingBackButton } from "@/components/layouts/floating-back-button";
import { useCurrentUserQuery } from "@/hooks/use-users";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useCurrentUserQuery();

  return (
    <ProtectedRoute>
      <div className="flex h-dvh bg-gray-50">
        {/* Desktop sidebar - hidden on mobile */}
        <DashboardSidebar />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header */}
          <DashboardHeader />

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            <div className="px-4 py-4 sm:px-6 sm:py-6 pb-20 md:pb-6 max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>

          {/* Mobile bottom nav */}
          <BottomNav />
        </div>

        {/* Floating back button */}
        <FloatingBackButton bottomOffset={88} />
      </div>
    </ProtectedRoute>
  );
}
