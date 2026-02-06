"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Wallet,
  FileText,
  Users,
  DollarSign,
  Plus,
} from "lucide-react";

const bottomNavItems = [
  { href: "/dashboard", label: "Trang chủ", icon: Home },
  { href: "/dashboard/contracts", label: "Hồ sơ", icon: FileText },
  { href: "/dashboard/contracts/new", label: "Tạo mới", icon: Plus, isAction: true },
  { href: "/dashboard/wallet", label: "Ví", icon: Wallet },
  { href: "/dashboard/commission", label: "Hoa hồng", icon: DollarSign },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 bg-linear-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] mt-1 text-gray-500">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-14 py-1 px-2 rounded-lg transition-colors",
                isActive ? "text-blue-600" : "text-gray-400",
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
              <span className={cn("text-[10px]", isActive ? "font-semibold" : "font-medium")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
