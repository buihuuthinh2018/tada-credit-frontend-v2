"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  FileCheck,
  GitBranch,
  FileBox,
  ClipboardList,
} from "lucide-react";
import { useLogout, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/users", label: "Quản lý User", icon: Users },
  { href: "/admin/contracts", label: "Quản lý Hồ sơ", icon: FileText },
  { href: "/admin/withdrawals", label: "Rút tiền", icon: CreditCard },
  { href: "/admin/services", label: "Dịch vụ", icon: FileBox },
  { href: "/admin/documents", label: "Tài liệu", icon: FileCheck },
  { href: "/admin/workflows", label: "Workflow", icon: GitBranch },
  { href: "/admin/roles", label: "Phân quyền", icon: Shield },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardList },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const logoutMutation = useLogout();
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white">TADA Admin</h1>
        <p className="text-sm text-gray-400 mt-1">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="text-xs text-blue-400">
          {user?.roles?.map((r) => r.name).join(", ")}
        </p>
      </div>

      <Separator className="bg-slate-700" />

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-gray-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-slate-700" />

      <div className="p-4">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-slate-800 mb-2"
          >
            <Home className="w-5 h-5 mr-3" />
            User Dashboard
          </Button>
        </Link>
        <Button
          onClick={() => logoutMutation.mutate()}
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-slate-800"
          disabled={logoutMutation.isPending}
        >
          <LogOut className="w-5 h-5 mr-3" />
          {logoutMutation.isPending ? "Đang xử lý..." : "Đăng xuất"}
        </Button>
      </div>
    </aside>
  );
}
