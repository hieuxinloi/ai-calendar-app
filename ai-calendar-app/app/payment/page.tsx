"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { ArrowLeft, QrCode, Clock, CheckCircle2, XCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

function PaymentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") || "pro"
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending")
  const [qrData, setQrData] = useState<string>("")
  const [paymentId, setPaymentId] = useState<string>("")
  const [isChecking, setIsChecking] = useState(false)
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmedAmount, setConfirmedAmount] = useState<string>("")
  const [expectedAmount, setExpectedAmount] = useState<number>(0)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        setUser(user)
        // Create payment after user loaded for manual QR
        await createPayment()
      } catch (error) {
        console.error("Error loading user:", error)
        toast.error("Không thể tải thông tin người dùng")
        router.push("/auth/signin")
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    // Cleanup polling on unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [router, supabase])

  const createPayment = async () => {
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()

      if (data.success && data.payment) {
        setQrData(data.payment.qr_code)
        setPaymentId(data.payment.id)
        setExpectedAmount(data.payment.amount)
        toast.success("Mã QR thanh toán đã được tạo")
      } else {
        throw new Error(data.error || "Failed to create payment")
      }
    } catch (error) {
      console.error("Payment creation error:", error)
      toast.error("Không thể tạo mã thanh toán")
    }
  }

  const checkPaymentStatus = async () => {
    if (!paymentId) return

    try {
      const response = await fetch(`/api/payment/status?id=${paymentId}`)
      const data = await response.json()

      if (data.success && data.payment) {
        const status = data.payment.status

        if (status === 'completed') {
          setPaymentStatus("success")
          toast.success("Thanh toán thành công!")
          if (pollInterval) {
            clearInterval(pollInterval)
          }
          // Redirect to calendar after 2 seconds
          setTimeout(() => {
            router.push("/calendar")
          }, 2000)
        } else if (status === 'failed') {
          setPaymentStatus("failed")
          toast.error("Thanh toán thất bại")
          if (pollInterval) {
            clearInterval(pollInterval)
          }
        }
      }
    } catch (error) {
      console.error("Payment status check error:", error)
    }
  }

  const handlePayOSPayment = async () => {
    try {
      toast.info("Đang tạo liên kết thanh toán PayOS...")
      
      const response = await fetch('/api/payment/payos/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()

      if (data.success && data.paymentLink) {
        // Redirect to PayOS checkout page
        window.location.href = data.paymentLink
      } else {
        throw new Error(data.error || "Failed to create payment link")
      }
    } catch (error) {
      console.error("PayOS payment error:", error)
      toast.error("Không thể tạo liên kết thanh toán PayOS")
    }
  }

  const handleCheckPayment = () => {
    // Mở dialog để nhập số tiền
    setShowConfirmDialog(true)
  }

  const confirmPayment = async () => {
    if (!paymentId) {
      toast.error("Không tìm thấy thông tin thanh toán")
      return
    }

    if (!confirmedAmount || parseInt(confirmedAmount.replace(/[^\d]/g, '')) === 0) {
      toast.error("Vui lòng nhập số tiền đã chuyển")
      return
    }

    setIsChecking(true)
    setShowConfirmDialog(false)

    try {
      const response = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          confirmedAmount,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPaymentStatus("success")
        setShowSuccess(true)
        toast.success("Thanh toán đã được xác nhận!")
        
        // Redirect sau 3 giây
        setTimeout(() => {
          router.push("/calendar")
        }, 3000)
      } else {
        setPaymentStatus("failed")
        toast.error(data.error || "Xác nhận thanh toán thất bại")
        setShowConfirmDialog(true) // Mở lại dialog để nhập lại
      }
    } catch (error) {
      console.error("Payment confirm error:", error)
      toast.error("Có lỗi xảy ra khi xác nhận thanh toán")
      setShowConfirmDialog(true)
    } finally {
      setIsChecking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const planDetails = {
    pro: {
      name: "Pro",
      price: "99.000đ",
      period: "tháng",
      features: [
        "Tất cả tính năng Miễn Phí",
        "Sắp xếp ưu tiên công việc tự động",
        "Tích hợp Pomodoro timer",
        "Đo lường hiệu suất làm việc",
        "Tự động sắp xếp lịch đột xuất",
        "Hẹn lịch nhóm tự động",
        "Ưu tiên hỗ trợ",
        "Không giới hạn task"
      ]
    }
  }

  const currentPlan = planDetails[plan as keyof typeof planDetails] || planDetails.pro

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Thanh toán nâng cấp</h1>
          <p className="text-muted-foreground mt-2">
            Chọn phương thức thanh toán để kích hoạt gói {currentPlan.name}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Payment Info & QR Code */}
          <Card className="p-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Gói {currentPlan.name}</h2>
                <div className="flex items-baseline justify-center gap-2 mt-2">
                  <span className="text-4xl font-bold">{currentPlan.price}</span>
                  <span className="text-muted-foreground">/{currentPlan.period}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center space-y-4 p-6 bg-muted/50 rounded-lg border-2 border-dashed border-border">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                {qrData ? (
                  <Image 
                    src={qrData}
                    alt="QR Code thanh toán"
                    width={250}
                    height={250}
                    className="w-[250px] h-[250px] object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Thông tin chuyển khoản</p>
                <div className="bg-white p-3 rounded border text-left space-y-1 text-xs">
                  <p><span className="font-semibold">Ngân hàng:</span> BIDV</p>
                  <p><span className="font-semibold">STK:</span> 5580232066</p>
                  <p><span className="font-semibold">Tên tài khoản:</span> HUYNH HUU HIEU</p>
                  <p><span className="font-semibold">Số tiền:</span> {plan === 'pro' ? '99,000 VND' : '0 VND'}</p>
                  <p><span className="font-semibold">Nội dung:</span> Ma GD {paymentId.slice(0, 8).toUpperCase()}</p>
                </div>
                <Badge variant="secondary" className="mt-2">
                  <Clock className="w-3 h-3 mr-1" />
                  Vui lòng chuyển khoản và bấm "Tôi đã thanh toán xong"
                </Badge>
              </div>
            </div>

            {/* Payment Status */}
            {paymentStatus === "pending" && (
              <div className="flex items-center justify-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <Clock className="w-4 h-4 text-yellow-600" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Chờ xác nhận thanh toán
                </p>
              </div>
            )}

            {/* Payment Methods */}
            <div className="space-y-3">
              {/* PayOS Button (Recommended) */}
              <Button 
                onClick={handlePayOSPayment} 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Thanh toán PayOS (Tự động)
              </Button>

              {/* Manual Confirmation Button */}
              <Button 
                onClick={handleCheckPayment} 
                className="w-full" 
                size="lg"
                variant="outline"
                disabled={isChecking || !qrData}
              >
                {isChecking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Đang kiểm tra...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Tôi đã chuyển khoản thủ công
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Right: Order Summary */}
          <Card className="p-6 space-y-6">
            <h3 className="text-xl font-bold">Thông tin đơn hàng</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Gói {currentPlan.name}</p>
                  <p className="text-sm text-muted-foreground">Thanh toán hàng tháng</p>
                </div>
                <span className="font-bold">{currentPlan.price}</span>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Những gì bạn nhận được:</h4>
                <ul className="space-y-2">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-medium">{currentPlan.price}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>VAT (10%):</span>
                  <span>Đã bao gồm</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span>{currentPlan.price}</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-t pt-4 space-y-2">
              <h4 className="font-semibold">Thông tin khách hàng</h4>
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Mã đơn hàng:</span> #{Date.now().toString().slice(-8)}
                </p>
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold mb-2 text-sm">Cần hỗ trợ?</h4>
              <p className="text-xs text-muted-foreground">
                Nếu bạn gặp vấn đề với thanh toán, vui lòng liên hệ chúng tôi qua email hoặc chat.
              </p>
            </div>
          </Card>
        </div>

        {/* Footer Note */}
        <Card className="mt-6 p-4 bg-muted/30">
          <p className="text-xs text-center text-muted-foreground">
            Bằng việc thanh toán, bạn đồng ý với{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Điều khoản dịch vụ
            </Link>{" "}
            và{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Chính sách bảo mật
            </Link>
            {" "}của chúng tôi.
          </p>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Xác nhận số tiền đã chuyển</DialogTitle>
              <DialogDescription>
                Vui lòng nhập số tiền bạn đã chuyển khoản để xác nhận thanh toán.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Số tiền đã chuyển (VND)</Label>
                <Input
                  id="amount"
                  type="text"
                  placeholder={`${expectedAmount.toLocaleString('vi-VN')} VND`}
                  value={confirmedAmount ? parseInt(confirmedAmount.replace(/[^\d]/g, '') || '0').toLocaleString('vi-VN') : ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '')
                    setConfirmedAmount(value)
                  }}
                  onFocus={(e) => e.target.select()}
                  className="text-lg font-semibold"
                />
                <p className="text-xs text-muted-foreground">
                  Số tiền mong đợi: <span className="font-semibold">{expectedAmount.toLocaleString('vi-VN')} VND</span>
                </p>
              </div>
              {confirmedAmount && Math.abs(parseInt(confirmedAmount.replace(/[^\d]/g, '')) - expectedAmount) > 1000 && (
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    ⚠️ Số tiền không khớp với số tiền mong đợi. Vui lòng kiểm tra lại.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmDialog(false)
                  setConfirmedAmount("")
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={confirmPayment}
                disabled={isChecking || !confirmedAmount || Math.abs(parseInt(confirmedAmount.replace(/[^\d]/g, '')) - expectedAmount) > 1000}
              >
                {isChecking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xác nhận...
                  </>
                ) : (
                  "Xác nhận"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Screen Overlay */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
            <Card className="relative max-w-md w-full mx-4 p-8 animate-in zoom-in-95 slide-in-from-bottom-4">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-32 h-32 text-primary animate-pulse" />
                  </div>
                  <CheckCircle2 className="w-24 h-24 text-green-500 relative z-10 animate-in zoom-in duration-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">Thanh toán thành công!</h2>
                  <p className="text-muted-foreground">
                    Gói {plan === 'pro' ? 'Pro' : 'Free'} đã được kích hoạt thành công.
                  </p>
                </div>
                <div className="bg-primary/10 rounded-lg p-4 w-full">
                  <p className="text-sm font-semibold text-primary">
                    Đang chuyển đến trang Calendar...
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  )
}

