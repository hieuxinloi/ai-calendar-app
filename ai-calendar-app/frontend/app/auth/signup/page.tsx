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

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!email || !password || !fullName) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Đăng ký user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (authError) {
        // Kiểm tra nếu là lỗi network
        const errorMessage = authError.message || ''
        if (errorMessage.includes('Failed to fetch') || 
            errorMessage.includes('NetworkError') ||
            errorMessage.includes('fetch') ||
            authError.name === 'NetworkError' ||
            authError.name === 'AuthRetryableFetchError') {
          toast.error('Không thể kết nối đến Supabase. Có thể:\n1. Supabase project đã bị suspend/xóa\n2. URL/Key không đúng\n3. Chưa có file .env.local\n\nGiải pháp:\n- Kiểm tra Supabase Dashboard: https://supabase.com/dashboard\n- Tạo file .env.local với URL/Key mới\n- Restart dev server (Ctrl+C rồi npm run dev)', { duration: 10000 })
        } else {
          toast.error(authError.message || 'Có lỗi xảy ra khi đăng ký')
        }
        setIsLoading(false)
        return
      }

      // Tạo user profile trong users table - dùng client-side để có session
      if (authData.user) {
        try {
          // Đợi một chút để session được set
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Kiểm tra xem user đã có profile chưa
          const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('id', authData.user.id)
            .single()
          
          // Nếu chưa có profile, tạo mới
          if (checkError && checkError.code === 'PGRST116') { // PGRST116 = not found
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert({
                id: authData.user.id,
                email: authData.user.email || null,
                full_name: fullName.trim() || null,
                avatar_url: authData.user.user_metadata?.avatar_url || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single()
            
            if (insertError) {
              console.error('Error creating user profile:', insertError)
              // Không throw error vì user đã được tạo trong auth.users
              // Profile sẽ được tạo khi đăng nhập
            } else {
              console.log('✅ User profile created successfully:', newUser)
            }
          } else if (existingUser) {
            console.log('✅ User profile already exists')
          } else if (checkError) {
            console.warn('Error checking user profile:', checkError)
          }
        } catch (profileError) {
          console.warn('Error creating user profile:', profileError)
          // Không throw error vì user đã được tạo trong auth.users
          // Profile sẽ được tạo khi đăng nhập
        }
      }

      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.')
      
      // Redirect to sign in
      setTimeout(() => {
        router.push('/auth/signin')
      }, 2000)
    } catch (error: any) {
      console.error('Sign up error:', error)
      // Hiển thị message rõ ràng hơn cho lỗi env variables
      if (error.message?.includes('Cấu hình Supabase')) {
        toast.error(error.message, { duration: 10000 })
      } else if (error.message?.includes('Failed to fetch') || 
                  error.message?.includes('NetworkError') ||
                  error.name === 'TypeError') {
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet và thử lại.')
      } else {
        toast.error(error.message || 'Có lỗi xảy ra khi đăng ký')
      }
    } finally {
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
          <h1 className="text-3xl font-bold mb-2">Tạo tài khoản mới</h1>
          <p className="text-muted-foreground">Bắt đầu hành trình quản lý thời gian thông minh</p>
        </div>

        {/* Form */}
        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ít nhất 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                'Đăng ký'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Đã có tài khoản?{' '}
              <Link href="/auth/signin" className="text-primary hover:underline font-medium">
                Đăng nhập ngay
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

        <p className="text-xs text-center text-muted-foreground mt-6">
          Bằng cách đăng ký, bạn đồng ý với{' '}
          <Link href="#" className="underline">
            Điều khoản dịch vụ
          </Link>{' '}
          và{' '}
          <Link href="#" className="underline">
            Chính sách bảo mật
          </Link>
        </p>
      </div>
    </div>
  )
}

