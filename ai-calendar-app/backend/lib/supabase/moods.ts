import { createClient } from './client'
import type { MoodRecord } from '../services/moods'

// Chuyển đổi từ Supabase format sang app format
function supabaseToMood(row: any): MoodRecord {
  return {
    id: row.id,
    date: row.date,
    mood: row.mood,
    note: row.note || '',
    emoji: row.emoji,
    createdAt: new Date(row.created_at),
  }
}

// Chuyển đổi từ app format sang Supabase format
function moodToSupabase(mood: Omit<MoodRecord, 'id' | 'createdAt'>) {
  return {
    date: mood.date,
    mood: mood.mood,
    note: mood.note || '',
    emoji: mood.emoji,
  }
}

/**
 * Lấy tất cả moods của user hiện tại
 */
export async function getMoods(userId?: string): Promise<MoodRecord[]> {
  const supabase = createClient()

  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    userId = user.id
  }

  const { data, error } = await supabase
    .from('moods')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching moods:', error)
    return []
  }

  return data?.map(supabaseToMood) || []
}

/**
 * Lấy mood theo ngày
 */
export async function getMoodByDate(date: Date, userId?: string): Promise<MoodRecord | null> {
  const supabase = createClient()
  const dateString = date.toISOString().split('T')[0]

  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    userId = user.id
  }

  const { data, error } = await supabase
    .from('moods')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateString)
    .maybeSingle()

  if (error) {
    console.error('Error fetching mood by date:', error)
    return null
  }

  return data ? supabaseToMood(data) : null
}

/**
 * Thêm mood mới hoặc cập nhật nếu đã tồn tại
 * (Mỗi user chỉ có 1 mood mỗi ngày - unique constraint)
 */
export async function addMood(mood: Omit<MoodRecord, 'id' | 'createdAt'>, userId?: string): Promise<MoodRecord | null> {
  const supabase = createClient()

  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('No user found')
      return null
    }
    userId = user.id
  }

  // Sử dụng upsert để insert hoặc update nếu đã tồn tại
  const { data, error } = await supabase
    .from('moods')
    .upsert({
      user_id: userId,
      ...moodToSupabase(mood),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,date'
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding mood:', error)
    return null
  }

  return supabaseToMood(data)
}

/**
 * Cập nhật mood
 */
export async function updateMood(
  id: string,
  updates: Partial<MoodRecord>,
  userId?: string
): Promise<MoodRecord | null> {
  const supabase = createClient()

  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('No user found')
      return null
    }
    userId = user.id
  }

  const updateData: any = {}
  if (updates.mood !== undefined) updateData.mood = updates.mood
  if (updates.note !== undefined) updateData.note = updates.note || ''
  if (updates.emoji !== undefined) updateData.emoji = updates.emoji
  if (updates.date !== undefined) updateData.date = updates.date
  updateData.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('moods')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating mood:', error)
    return null
  }

  return data ? supabaseToMood(data) : null
}

/**
 * Xóa mood
 */
export async function deleteMood(id: string, userId?: string): Promise<boolean> {
  const supabase = createClient()

  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('No user found')
      return false
    }
    userId = user.id
  }

  const { error } = await supabase
    .from('moods')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting mood:', error)
    return false
  }

  return true
}

