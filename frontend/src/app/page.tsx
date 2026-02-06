"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CreditCard,
  Shield,
  Users,
  Wallet,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardUrl = user?.roles?.some((r) =>
    ["SUPER_ADMIN", "ADMIN"].includes(r.code),
  )
    ? "/admin"
    : "/dashboard";

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TADA Credit
              </span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Tính năng</a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Cách hoạt động</a>
              <a href="#benefits" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Lợi ích</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Link href={dashboardUrl}>
                  <Button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Vào Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-gray-600">Đăng nhập</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">Đăng ký miễn phí</Button>
                  </Link>
                </>
              )}
            </div>

            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </nav>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            <a href="#features" className="block text-sm text-gray-600 py-2" onClick={() => setMobileMenuOpen(false)}>Tính năng</a>
            <a href="#how-it-works" className="block text-sm text-gray-600 py-2" onClick={() => setMobileMenuOpen(false)}>Cách hoạt động</a>
            <a href="#benefits" className="block text-sm text-gray-600 py-2" onClick={() => setMobileMenuOpen(false)}>Lợi ích</a>
            <div className="pt-3 border-t border-gray-100 space-y-2">
              {isAuthenticated ? (
                <Link href={dashboardUrl}><Button className="w-full bg-linear-to-r from-blue-600 to-indigo-600">Vào Dashboard</Button></Link>
              ) : (
                <>
                  <Link href="/login"><Button variant="outline" className="w-full">Đăng nhập</Button></Link>
                  <Link href="/register"><Button className="w-full bg-linear-to-r from-blue-600 to-indigo-600">Đăng ký miễn phí</Button></Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-150 bg-linear-to-b from-blue-50 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-20 right-0 w-72 h-72 bg-indigo-50 rounded-full blur-3xl" />
          <div className="absolute top-40 left-0 w-72 h-72 bg-blue-50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              Nền tảng tài chính thế hệ mới
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              Quản lý{" "}
              <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Tín dụng & Tài chính
              </span>
              <br />
              đơn giản hơn bao giờ hết
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              TADA Credit giúp bạn nộp hồ sơ vay, quản lý ví điện tử và kiếm hoa hồng
              giới thiệu — tất cả trong một nền tảng duy nhất.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href={dashboardUrl}>
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
                    Vào Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
                      Bắt đầu miễn phí <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6">
                      Đã có tài khoản? Đăng nhập
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-500">
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Miễn phí đăng ký</div>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-500" />Bảo mật cao</div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" />Xử lý nhanh chóng</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Mọi thứ bạn cần, một nơi duy nhất</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">TADA Credit tích hợp đầy đủ các công cụ để quản lý tài chính cá nhân và kinh doanh.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { icon: CreditCard, title: "Quản lý Hồ sơ", description: "Nộp và theo dõi hồ sơ vay trực tuyến. Quy trình số hóa 100%, nhanh chóng và minh bạch.", bg: "bg-blue-50", iconColor: "text-blue-600" },
              { icon: Wallet, title: "Ví điện tử", description: "Quản lý số dư, theo dõi giao dịch và rút tiền nhanh chóng với giao diện trực quan.", bg: "bg-emerald-50", iconColor: "text-emerald-600" },
              { icon: Users, title: "Giới thiệu & Hoa hồng", description: "Kiếm thu nhập thụ động bằng cách giới thiệu khách hàng. Hệ thống KPI rõ ràng.", bg: "bg-violet-50", iconColor: "text-violet-600" },
              { icon: Shield, title: "Bảo mật cao", description: "Hệ thống phân quyền chi tiết, mã hóa dữ liệu và bảo vệ thông tin tuyệt đối.", bg: "bg-amber-50", iconColor: "text-amber-600" },
            ].map((feature) => (
              <div key={feature.title} className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-5`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Bắt đầu chỉ trong 3 bước</h2>
            <p className="text-lg text-gray-600">Quy trình đơn giản, nhanh chóng và tiện lợi</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { step: "01", title: "Đăng ký tài khoản", description: "Tạo tài khoản miễn phí chỉ trong 1 phút với email và số điện thoại." },
              { step: "02", title: "Nộp hồ sơ", description: "Điền thông tin, tải tài liệu và nộp hồ sơ vay trực tuyến dễ dàng." },
              { step: "03", title: "Theo dõi & Nhận kết quả", description: "Theo dõi trạng thái hồ sơ theo thời gian thực và nhận thông báo ngay." },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl text-white font-bold text-lg mb-6 shadow-lg shadow-blue-500/25">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
                {index < 2 && <ChevronRight className="hidden md:block absolute top-8 -right-6 w-8 h-8 text-gray-300" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 sm:py-28 bg-linear-to-br from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Tại sao chọn TADA Credit?</h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">Được tin tưởng bởi hàng nghìn người dùng và cộng tác viên trên toàn quốc.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { value: "100%", label: "Số hóa quy trình" },
              { value: "24/7", label: "Hỗ trợ trực tuyến" },
              { value: "< 5 phút", label: "Thời gian nộp hồ sơ" },
              { value: "Minh bạch", label: "Hoa hồng rõ ràng" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Sẵn sàng bắt đầu?</h2>
          <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
            Tham gia cùng hàng nghìn người dùng đang sử dụng TADA Credit để quản lý tài chính hiệu quả hơn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href={dashboardUrl}>
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 bg-linear-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
                  Vào Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 bg-linear-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
                    Đăng ký miễn phí ngay <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/login"><Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6">Đăng nhập</Button></Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-lg font-bold text-gray-900">TADA Credit</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">Nền tảng quản lý tín dụng và tài chính toàn diện cho cá nhân và doanh nghiệp.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-gray-900 transition-colors">Quản lý hồ sơ</a></li>
                <li><a href="#features" className="hover:text-gray-900 transition-colors">Ví điện tử</a></li>
                <li><a href="#features" className="hover:text-gray-900 transition-colors">Hoa hồng</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Liên hệ</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Pháp lý</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Điều khoản sử dụng</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Chính sách bảo mật</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-10 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2026 TADA Credit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
