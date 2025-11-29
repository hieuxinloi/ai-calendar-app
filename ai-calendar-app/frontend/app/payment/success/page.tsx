"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { createClient } from "@/backend/lib/supabase/client"

function PaymentSuccessPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("paymentId")
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "completed" | "failed">("pending")
  const supabase = createClient()

  useEffect(() => {
    if (!paymentId) {
      router.push("/payment")
      return
    }

    // Check payment status
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment/status?id=${paymentId}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success && data.payment) {
          setPaymentStatus(data.payment.status as "pending" | "completed" | "failed")
        }
      } catch (error: any) {
        // Chỉ log lỗi, không hiển thị toast cho lỗi network trong polling
        if (error.name !== 'TypeError' || !error.message.includes('fetch')) {
          console.error("Payment status check error:", error)
        }
      } finally {
        setLoading(false)
      }
    }

    checkPaymentStatus()

    // Poll for payment status if pending
    const interval = setInterval(() => {
      if (paymentStatus === "pending") {
        checkPaymentStatus()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [paymentId, paymentStatus])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang kiểm tra thanh toán...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Success Animation */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-32 h-32 text-primary animate-pulse" />
            </div>
            <CheckCircle2 className="w-24 h-24 text-green-500 relative z-10 animate-in zoom-in duration-500" />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Thanh toán thành công!</h1>
            <p className="text-muted-foreground">
              Gói Pro của bạn đã được kích hoạt thành công.
            </p>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            <Button 
              asChild 
              className="w-full" 
              size="lg"
            >
              <Link href="/calendar">
                Đi đến Calendar
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => router.push("/")}
            >
              Về trang chủ
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang kiểm tra thanh toán...</p>
        </div>
      </div>
    }>
      <PaymentSuccessPageContent />
    </Suspense>
  )
}

