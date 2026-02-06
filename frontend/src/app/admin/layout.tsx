"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { Header } from "@/components/layouts/header";
import { FloatingBackButton } from "@/components/layouts/floating-back-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute requiredRoles={["SUPER_ADMIN", "ADMIN"]}>
      <div className="flex h-dvh">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — always visible on desktop, slide-over on mobile */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out
          md:relative md:transform-none md:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          <AdminSidebar />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">{children}</main>
        </div>

        {/* Floating back button */}
        <FloatingBackButton bottomOffset={20} />
      </div>
    </ProtectedRoute>
  );
}
