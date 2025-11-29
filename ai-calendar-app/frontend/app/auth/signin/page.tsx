'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/backend/lib/supabase/client'
import { Calendar, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      
      // Lưu supabase instance để dùng sau
      const supabaseClient = supabase

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Kiểm tra nếu là lỗi network
        const errorMessage = error.message || ''
        if (errorMessage.includes('Failed to fetch') || 
            errorMessage.includes('NetworkError') ||
            errorMessage.includes('fetch') ||
            error.name === 'NetworkError' ||
            error.name === 'AuthRetryableFetchError') {
          toast.error('Không thể kết nối đến Supabase. Có thể:\n1. Supabase project đã bị suspend/xóa\n2. URL/Key không đúng\n3. Chưa có file .env.local\n\nGiải pháp:\n- Kiểm tra Supabase Dashboard: https://supabase.com/dashboard\n- Tạo file .env.local với URL/Key mới\n- Restart dev server (Ctrl+C rồi npm run dev)', { duration: 10000 })
        } else {
          toast.error(error.message || 'Email hoặc mật khẩu không đúng')
        }
        setIsLoading(false)
        return
      }

      if (data.user) {
        toast.success('Đăng nhập thành công!')
        
        // Đợi một chút để session được lưu
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Đảm bảo user profile tồn tại - dùng client-side
        try {
          // Kiểm tra xem user đã có profile chưa
          const { data: existingUser, error: checkError } = await supabaseClient
            .from('users')
            .select('id')
            .eq('id', data.user.id)
            .single()
          
          // Nếu chưa có profile, tạo mới
          if (checkError && checkError.code === 'PGRST116') { // PGRST116 = not found
            const { data: newUser, error: insertError } = await supabaseClient
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email || null,
                full_name: data.user.user_metadata?.full_name || null,
                avatar_url: data.user.user_metadata?.avatar_url || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single()
            
            if (insertError) {
              console.warn('Failed to create user profile:', insertError)
            } else {
              console.log('✅ User profile created on signin:', newUser)
            }
          } else if (existingUser) {
            console.log('✅ User profile already exists')
          }
        } catch (error) {
          console.warn('Failed to ensure user profile:', error)
          // Không block login nếu lỗi
        }
        
        // Redirect to calendar
        router.push('/calendar')
        router.refresh() // Refresh để load user data
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      // Hiển thị message rõ ràng hơn cho lỗi env variables
      if (error.message?.includes('Cấu hình Supabase')) {
        toast.error(error.message, { duration: 10000 })
      } else if (error.message?.includes('Failed to fetch') || 
                  error.message?.includes('NetworkError') ||
                  error.name === 'TypeError') {
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet và thử lại.')
      } else {
        toast.error(error.message || 'Có lỗi xảy ra khi đăng nhập')
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">AI Calendar</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Đăng nhập</h1>
          <p className="text-muted-foreground">Chào mừng bạn quay trở lại!</p>
        </div>

        {/* Form */}
        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Chưa có tài khoản?{' '}
              <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className="mt-4">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Quay lại trang chủ
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

