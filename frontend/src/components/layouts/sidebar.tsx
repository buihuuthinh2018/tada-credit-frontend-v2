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
} from "lucide-react";
import { useLogout, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const userNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/wallet", label: "Ví của tôi", icon: Wallet },
  { href: "/dashboard/contracts", label: "Hồ sơ", icon: FileText },
  { href: "/dashboard/referrals", label: "Giới thiệu", icon: Users },
  { href: "/dashboard/commission", label: "Hoa hồng", icon: DollarSign },
  { href: "/dashboard/settings", label: "Cài đặt", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const logoutMutation = useLogout();
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white">TADA Credit</h1>
        <p className="text-sm text-gray-400 mt-1">
          {user?.fullname}
        </p>
      </div>

      <Separator className="bg-gray-700" />

      <nav className="flex-1 p-4 space-y-1">
        {userNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <Button
          onClick={() => logoutMutation.mutate()}
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
          disabled={logoutMutation.isPending}
        >
          <LogOut className="w-5 h-5 mr-3" />
          {logoutMutation.isPending ? "Đang xử lý..." : "Đăng xuất"}
        </Button>
      </div>
    </aside>
  );
}
