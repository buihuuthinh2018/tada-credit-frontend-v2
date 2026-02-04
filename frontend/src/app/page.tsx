"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { CreditCard, Shield, Users, Wallet } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      const hasAdminRole = user?.roles?.some((r) =>
        ["SUPER_ADMIN", "ADMIN"].includes(r.code)
      );
      if (hasAdminRole) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">TADA Credit</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Đăng nhập</Button>
            </Link>
            <Link href="/register">
              <Button>Đăng ký</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Nền tảng quản lý{" "}
            <span className="text-blue-600">Tín dụng & Tài chính</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            TADA Credit cung cấp giải pháp toàn diện cho quản lý hồ sơ vay, ví
            điện tử, và hệ thống hoa hồng giới thiệu.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">Bắt đầu ngay</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CreditCard className="w-10 h-10 text-blue-500 mb-2" />
              <CardTitle>Quản lý Hồ sơ</CardTitle>
              <CardDescription>
                Nộp và theo dõi hồ sơ vay một cách dễ dàng
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Wallet className="w-10 h-10 text-green-500 mb-2" />
              <CardTitle>Ví điện tử</CardTitle>
              <CardDescription>
                Quản lý số dư và rút tiền nhanh chóng
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-10 h-10 text-purple-500 mb-2" />
              <CardTitle>Giới thiệu & Hoa hồng</CardTitle>
              <CardDescription>
                Kiếm hoa hồng từ việc giới thiệu khách hàng
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-10 h-10 text-orange-500 mb-2" />
              <CardTitle>Bảo mật cao</CardTitle>
              <CardDescription>
                Hệ thống phân quyền và bảo mật tiên tiến
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>© 2024 TADA Credit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
