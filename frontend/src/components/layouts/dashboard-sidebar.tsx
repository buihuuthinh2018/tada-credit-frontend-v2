"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Wallet,
  FileText,
  Settings,
  LogOut,
  Users,
  DollarSign,
  Plus,
} from "lucide-react";
import { useLogout, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Trang chủ", icon: Home },
  { href: "/dashboard/contracts", label: "Hồ sơ vay", icon: FileText },
  { href: "/dashboard/wallet", label: "Ví của tôi", icon: Wallet },
  { href: "/dashboard/referral", label: "Giới thiệu", icon: Users },
  { href: "/dashboard/commission", label: "Hoa hồng", icon: DollarSign },
  { href: "/dashboard/settings", label: "Cài đặt", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const logoutMutation = useLogout();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
      {/* User info */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.fullname
                ?.split(" ")
                .map((n) => n.charAt(0))
                .slice(0, 2)
                .join("") || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.fullname}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Quick action */}
      <div className="p-4">
        <Link href="/dashboard/contracts/new">
          <Button className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Tạo hồ sơ mới
          </Button>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Icon
                className={cn(
                  "w-4.5 h-4.5",
                  isActive ? "text-blue-600" : "text-gray-400",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full"
        >
          <LogOut className="w-4.5 h-4.5" />
          {logoutMutation.isPending ? "Đang xử lý..." : "Đăng xuất"}
        </button>
      </div>
    </aside>
  );
}
