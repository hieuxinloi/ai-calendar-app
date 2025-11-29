import { createClient } from './server'
import type { Database } from '@/shared/types/database'

type User = Database['public']['Tables']['users']['Row']

/**
 * Đảm bảo user profile tồn tại trong users table
 * Tự động tạo nếu chưa có
 */
export async function ensureUserProfile(userId?: string): Promise<User | null> {
  const supabase = await createClient()
  
  // Lấy user từ session nếu chưa có userId
  if (!userId) {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return null
    }
    userId = user.id
  }

  // Kiểm tra xem user đã có profile chưa
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  // Nếu đã có, return
  if (existingUser) {
    return existingUser
  }

  // Nếu lỗi khác "not found", return null
  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking user profile:', checkError)
    return null
  }

  // Lấy thông tin từ auth.users
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  if (authError || !authUser) {
    console.error('Error getting auth user:', authError)
    return null
  }

  // Tạo profile mới
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({
      id: authUser.id,
      email: authUser.email || null,
      full_name: authUser.user_metadata?.full_name || null,
      avatar_url: authUser.user_metadata?.avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error creating user profile:', insertError)
    return null
  }

  return newUser
}

/**
 * Lấy user profile
 */
export async function getUserProfile(userId?: string): Promise<User | null> {
  const supabase = await createClient()
  
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    userId = user.id
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error getting user profile:', error)
    return null
  }

  return data
}

