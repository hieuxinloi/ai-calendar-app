import { createClient } from './client'
import type { Task } from '../services/tasks'

// Chuyển đổi từ Supabase format sang app format
function supabaseToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    time: row.time || undefined,
    priority: row.priority,
    category: row.category || undefined,
    completed: row.completed,
    date: row.date,
    linkedPageId: row.linked_page_id || undefined,
    createdAt: new Date(row.created_at),
  }
}

// Chuyển đổi từ app format sang Supabase format
function taskToSupabase(task: Omit<Task, 'id' | 'createdAt'>) {
  return {
    title: task.title,
    description: task.description || null,
    time: task.time || null,
    priority: task.priority,
    category: task.category || null,
    completed: task.completed,
    date: task.date,
    linked_page_id: task.linkedPageId || null,
  }
}

/**
 * Lấy tất cả tasks của user hiện tại
 */
export async function getTasks(userId?: string): Promise<Task[]> {
  const supabase = createClient()
  
  // Nếu chưa có userId, thử lấy từ session
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    userId = user.id
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  return data?.map(supabaseToTask) || []
}

/**
 * Lấy tasks theo ngày
 */
export async function getTasksByDate(date: Date, userId?: string): Promise<Task[]> {
  const supabase = createClient()
  const dateString = date.toISOString().split('T')[0]

  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    userId = user.id
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateString)
    .order('time', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Error fetching tasks by date:', error)
    return []
  }

  return data?.map(supabaseToTask) || []
}

/**
 * Thêm task mới
 */
export async function addTask(task: Omit<Task, 'id' | 'createdAt'>, userId?: string): Promise<Task | null> {
  const supabase = createClient()

  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('No user found')
      return null
    }
    userId = user.id
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      ...taskToSupabase(task),
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding task:', error)
    return null
  }

  return supabaseToTask(data)
}

/**
 * Cập nhật task
 */
export async function updateTask(
  id: string,
  updates: Partial<Task>,
  userId?: string
): Promise<Task | null> {
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
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description || null
  if (updates.time !== undefined) updateData.time = updates.time || null
  if (updates.priority !== undefined) updateData.priority = updates.priority
  if (updates.category !== undefined) updateData.category = updates.category || null
  if (updates.completed !== undefined) updateData.completed = updates.completed
  if (updates.date !== undefined) updateData.date = updates.date
  if (updates.linkedPageId !== undefined) updateData.linked_page_id = updates.linkedPageId || null
  updateData.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating task:', error)
    return null
  }

  return data ? supabaseToTask(data) : null
}

/**
 * Xóa task
 */
export async function deleteTask(id: string, userId?: string): Promise<boolean> {
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
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting task:', error)
    return false
  }

  return true
}

