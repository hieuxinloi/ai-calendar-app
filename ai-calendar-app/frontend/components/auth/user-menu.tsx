'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/backend/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings } from 'lucide-react'
import { toast } from 'sonner'

export function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (mounted) {
          if (error) {
            // Không log error nếu chỉ là "session missing" - đó là bình thường khi chưa đăng nhập
            if (!error.message?.includes('session') && 
                !error.message?.includes('Auth session missing') &&
                !error.message?.includes('Failed to fetch') &&
                !error.message?.includes('NetworkError')) {
              console.error('Error getting user:', error)
            }
            setUser(null)
          } else {
            setUser(user)
          }
          setLoading(false)
        }
      } catch (error: any) {
        // Bỏ qua lỗi network và session - đó là bình thường khi chưa đăng nhập hoặc mất kết nối
        if (error?.message && 
            !error.message.includes('session') && 
            !error.message.includes('Auth session missing') &&
            !error.message.includes('Failed to fetch') &&
            !error.message.includes('NetworkError')) {
          console.error('Error loading user:', error)
        }
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    loadUser()

    // Listen for auth changes (login, logout, etc.)
    let subscription: { unsubscribe: () => void } | null = null
    try {
      const supabase = createClient()
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (mounted) {
          console.log('Auth state changed:', event, session?.user?.email)
          setUser(session?.user || null)
          setLoading(false)
          
          // Refresh page on login/logout to update all components
          if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            router.refresh()
          }
        }
      })
      
      // onAuthStateChange trả về object có data.subscription
      if (data?.subscription) {
        subscription = data.subscription
      }
    } catch (error) {
      console.error('Error setting up auth listener:', error)
    }

    return () => {
      mounted = false
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    }
  }, [router])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast.error('Có lỗi xảy ra khi đăng xuất')
      } else {
        toast.success('Đã đăng xuất')
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Có lỗi xảy ra khi đăng xuất')
    }
  }

  if (loading) {
    return null
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/auth/signin')} className="font-medium">
          Đăng nhập
        </Button>
        <Button size="sm" onClick={() => router.push('/auth/signup')} className="font-medium">
          Đăng ký
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="hidden sm:inline">
            {user.user_metadata?.full_name || user.email?.split('@')[0]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.full_name || 'Người dùng'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="w-4 h-4 mr-2" />
          Cài đặt
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

