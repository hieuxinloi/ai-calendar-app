import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  try {
    // Sử dụng env variables hoặc fallback về giá trị hardcode (chỉ để dev/test)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dnjynpcgpkeggnevdnpm.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuanlucGNncGtlZ2duZXZkbnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDUzMTAsImV4cCI6MjA3NzY4MTMxMH0.jAr6T4kzAk3HqlYEaDdS23Y7jVgd4KVoiD8K8vB0wAg'

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        'Cấu hình Supabase chưa được thiết lập. Vui lòng:\n' +
        '1. Kiểm tra file .env.local trong thư mục ai-calendar-app/\n' +
        '2. Đảm bảo có 2 dòng:\n' +
        '   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co\n' +
        '   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...\n' +
        '3. Dừng dev server (Ctrl+C) và chạy lại: npm run dev'
      )
    }

    const client = createBrowserClient(supabaseUrl, supabaseAnonKey)
    
    // Wrap auth methods to handle network errors gracefully
    const originalGetUser = client.auth.getUser.bind(client.auth)
    client.auth.getUser = async function(...args: any[]) {
      try {
        return await originalGetUser(...args)
      } catch (error: any) {
        // Return a safe error response for network failures instead of throwing
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError') ||
            error?.message?.includes('AuthRetryableFetchError') ||
            error?.name === 'TypeError' ||
            error?.name === 'AuthRetryableFetchError' ||
            (error?.message && typeof error.message === 'string' && error.message.includes('fetch'))) {
          // Return a safe response that won't crash the app
          return { 
            data: { user: null }, 
            error: { 
              message: 'Network error - please check your connection', 
              status: 0,
              name: 'NetworkError'
            } 
          }
        }
        // Re-throw other errors
        throw error
      }
    }
    
    // Suppress Supabase internal retry errors by intercepting fetch
    if (typeof window !== 'undefined' && window.fetch) {
      const originalFetch = window.fetch
      window.fetch = async function(...args: any[]) {
        try {
          return await originalFetch.apply(this, args)
        } catch (error: any) {
          // Suppress network errors silently
          if (error?.message?.includes('Failed to fetch') || 
              error?.name === 'TypeError' ||
              error?.name === 'NetworkError') {
            // Return a rejected promise that won't be logged
            return Promise.reject(new Error('Network error'))
          }
          throw error
        }
      }
    }

    // Wrap signInWithPassword to handle network errors
    const originalSignIn = client.auth.signInWithPassword.bind(client.auth)
    client.auth.signInWithPassword = async function(...args: any[]) {
      try {
        return await originalSignIn(...args)
      } catch (error: any) {
        // Don't suppress errors for sign in - let them through
        throw error
      }
    }

    // Wrap signUp to handle network errors
    const originalSignUp = client.auth.signUp.bind(client.auth)
    client.auth.signUp = async function(...args: any[]) {
      try {
        return await originalSignUp(...args)
      } catch (error: any) {
        // Don't suppress errors for sign up - let them through
        throw error
      }
    }

    return client
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    // Return a mock client to prevent crashes
    // This will fail gracefully when used
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
  }
}

