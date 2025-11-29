"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserMenu } from "@/components/auth/user-menu"
import { Calendar, Sparkles, Brain, Moon, Zap, Trophy, Clock } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/backend/lib/supabase/client"

export default function LandingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUser() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [])

  const isLoggedIn = !!user

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-balance">AI Calendar</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Tính năng
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Bảng giá
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Về chúng tôi
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          <Badge variant="secondary" className="mb-2 sm:mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Lịch thông minh cho người Việt
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-balance leading-tight">
            Quản lý thời gian thông minh với <span className="text-primary">AI Calendar</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-pretty max-w-2xl mx-auto px-2">
            Lịch thông minh kết hợp AI, giúp sắp xếp công việc, nhắc nhở đúng lúc và phân tích thói quen cá nhân. Được
            thiết kế riêng cho Gen Z Việt Nam.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 px-4">
            {isLoggedIn ? (
              <Link href="/calendar" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  <Zap className="w-4 h-4 mr-2" />
                  Vào không gian làm việc
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Zap className="w-4 h-4 mr-2" />
                    Bắt đầu miễn phí
                  </Button>
                </Link>
                <Link href="/calendar" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                    <Calendar className="w-4 h-4 mr-2" />
                    Xem demo
                  </Button>
                </Link>
              </>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Miễn phí mãi mãi • Không cần thẻ tín dụng</p>
        </div>

        {/* Hero Image */}
        <div className="mt-12 sm:mt-16 max-w-5xl mx-auto px-2 sm:px-0">
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-border shadow-2xl">
            <img
              src="/image/hero.png"
              alt="AI Calendar Interface"
              className="w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
          <Badge variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            Tính năng nổi bật
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-balance px-4">
            Mọi thứ bạn cần để quản lý thời gian
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty max-w-2xl mx-auto px-4">
            Từ lập kế hoạch hàng ngày đến theo dõi tâm trạng, AI Calendar có tất cả
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          <Card className="p-5 sm:p-6 space-y-3 sm:space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">AI Thông Minh</h3>
            <p className="text-muted-foreground text-pretty">
              AI học thói quen của bạn và tự động sắp xếp lịch trình hợp lý nhất. Gợi ý thời gian làm việc hiệu quả.
            </p>
          </Card>

          <Card className="p-5 sm:p-6 space-y-3 sm:space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Moon className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold">Mood Tracker</h3>
            <p className="text-muted-foreground text-pretty">
              Theo dõi tâm trạng hàng ngày, phân tích xu hướng cảm xúc và nhận gợi ý cải thiện sức khỏe tinh thần.
            </p>
          </Card>

          <Card className="p-5 sm:p-6 space-y-3 sm:space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">Lịch Âm Việt Nam</h3>
            <p className="text-muted-foreground text-pretty">
              Tích hợp lịch âm, ngày tốt xấu, lễ tết Việt Nam. Xem ngày hoàng đạo để lên kế hoạch quan trọng.
            </p>
          </Card>

          <Card className="p-5 sm:p-6 space-y-3 sm:space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-chart-2" />
            </div>
            <h3 className="text-xl font-semibold">Chat AI Trợ Lý</h3>
            <p className="text-muted-foreground text-pretty">
              Hỏi AI bất cứ lúc nào: "Mình rảnh khi nào?", "Hôm nay có việc gì?". Trợ lý thông minh luôn sẵn sàng.
            </p>
          </Card>

          <Card className="p-5 sm:p-6 space-y-3 sm:space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-chart-4" />
            </div>
            <h3 className="text-xl font-semibold">Pomodoro Timer</h3>
            <p className="text-muted-foreground text-pretty">
              Tích hợp kỹ thuật Pomodoro giúp tập trung làm việc hiệu quả. Theo dõi thời gian và năng suất.
            </p>
          </Card>

          <Card className="p-5 sm:p-6 space-y-3 sm:space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-chart-5/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-chart-5" />
            </div>
            <h3 className="text-xl font-semibold">Gamification</h3>
            <p className="text-muted-foreground text-pretty">
              Nhận điểm, thành tựu khi hoàn thành công việc. Thử thách năng suất và chia sẻ với bạn bè.
            </p>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-12 sm:py-16 md:py-24 bg-muted/30">
        <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
          <Badge variant="secondary">
            <Zap className="w-3 h-3 mr-1" />
            Bảng giá
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-balance px-4">Chọn gói phù hợp với bạn</h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty max-w-2xl mx-auto px-4">
            Bắt đầu miễn phí, nâng cấp khi cần thêm tính năng
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <Card className="p-6 sm:p-8 space-y-5 sm:space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Miễn Phí</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">0đ</span>
                <span className="text-muted-foreground">/tháng</span>
              </div>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary text-xs">✓</span>
                </div>
                <span className="text-sm">Lập kế hoạch cho 1 ngày</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary text-xs">✓</span>
                </div>
                <span className="text-sm">Nhắc nhở cơ bản</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary text-xs">✓</span>
                </div>
                <span className="text-sm">Xem ngày tốt, lịch âm</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary text-xs">✓</span>
                </div>
                <span className="text-sm">Mood tracker cơ bản</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-primary text-xs">✓</span>
                </div>
                <span className="text-sm">Chat AI đơn giản</span>
              </li>
            </ul>
            {isLoggedIn ? (
              <Link href="/calendar" className="w-full">
                <Button variant="outline" className="w-full bg-transparent">
                  Vào không gian làm việc
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signup" className="w-full">
                <Button variant="outline" className="w-full bg-transparent">
                  Bắt đầu miễn phí
                </Button>
              </Link>
            )}
          </Card>

          <Card className="p-6 sm:p-8 space-y-5 sm:space-y-6 border-primary shadow-lg relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary text-primary-foreground">Phổ biến</Badge>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">99.000đ</span>
                <span className="text-muted-foreground">/tháng</span>
              </div>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center mt-0.5">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
                <span className="text-sm font-medium">Tất cả tính năng Miễn Phí</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center mt-0.5">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
                <span className="text-sm">Sắp xếp ưu tiên công việc tự động</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center mt-0.5">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
                <span className="text-sm">Tích hợp Pomodoro timer</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center mt-0.5">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
                <span className="text-sm">Đo lường hiệu suất làm việc</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center mt-0.5">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
                <span className="text-sm">Tự động sắp xếp lịch đột xuất</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center mt-0.5">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
                <span className="text-sm">Hẹn lịch nhóm tự động</span>
              </li>
            </ul>
            <Link href="/payment?plan=pro" className="w-full">
              <Button className="w-full">Nâng cấp Pro</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* CTA Section - Only show when not logged in */}
      {!isLoggedIn && (
        <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
          <Card className="p-6 sm:p-8 md:p-12 bg-primary text-primary-foreground text-center space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
              Sẵn sàng quản lý thời gian thông minh hơn?
            </h2>
            <p className="text-base sm:text-lg text-primary-foreground/90 text-pretty max-w-2xl mx-auto">
              Tham gia cùng hàng nghìn người Việt đang sử dụng AI Calendar để nâng cao năng suất mỗi ngày
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Zap className="w-4 h-4 mr-2" />
                  Đăng ký miễn phí
                </Button>
              </Link>
              <Link href="/auth/signin" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Đăng nhập
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-3 sm:space-y-4 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold">AI Calendar</span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground text-pretty">
                Lịch thông minh cho người Việt. Quản lý thời gian hiệu quả với AI.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Sản phẩm</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Tính năng
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Bảng giá
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Tải app
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Công ty</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Trung tâm trợ giúp
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Điều khoản
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Bảo mật
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border/40 text-center text-xs sm:text-sm text-muted-foreground">
            <p>© 2025 AI Calendar. Made with ❤️ in Vietnam.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
