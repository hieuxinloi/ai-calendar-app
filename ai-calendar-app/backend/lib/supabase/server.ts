import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  // Sử dụng env variables hoặc fallback về giá trị hardcode (chỉ để dev/test)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dnjynpcgpkeggnevdnpm.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuanlucGNncGtlZ2duZXZkbnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDUzMTAsImV4cCI6MjA3NzY4MTMxMH0.jAr6T4kzAk3HqlYEaDdS23Y7jVgd4KVoiD8K8vB0wAg'

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    )
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

