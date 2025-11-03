import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Sử dụng env variables hoặc fallback về giá trị hardcode (chỉ để dev/test)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dnjynpcgpkeggnevdnpm.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuanlucGNncGtlZ2duZXZkbnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDUzMTAsImV4cCI6MjA3NzY4MTMxMH0.jAr6T4kzAk3HqlYEaDdS23Y7jVgd4KVoiD8K8vB0wAg'

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Cấu hình Supabase chưa được thiết lập. Vui lòng:\n' +
      '1. Kiểm tra file .env.local trong thư mục ai-calendar-app/\n' +
      '2. Đảm bảo có 2 dòng:\n' +
      '   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co\n' +
      '   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...\n' +
      '3. Dừng dev server (Ctrl+C) và chạy lại: npm run dev'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

