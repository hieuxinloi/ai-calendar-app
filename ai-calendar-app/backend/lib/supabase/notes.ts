'use server'

import { createClient } from './server'
import type { Note } from '../services/notes'

function supabaseToNote(row: any): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title || 'Untitled',
    content: row.content || {},
    icon: row.icon || undefined,
    coverUrl: row.cover_url || undefined,
    parentId: row.parent_id || undefined,
    isFavorite: row.is_favorite || false,
    isArchived: row.is_archived || false,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

function noteToSupabase(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) {
  return {
    user_id: note.userId,
    title: note.title,
    content: note.content || null, // JSONB can be null
    icon: note.icon || null,
    cover_url: note.coverUrl || null,
    parent_id: note.parentId || null,
    is_favorite: note.isFavorite || false,
    is_archived: note.isArchived || false,
  }
}

/**
 * Lấy tất cả notes của user
 */
export async function getNotes(userId?: string): Promise<Note[]> {
  const supabase = await createClient()
  
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    userId = user.id
  }

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching notes:', error)
    return []
  }

  return data?.map(supabaseToNote) || []
}

/**
 * Lấy note theo ID
 */
export async function getNoteById(id: string, userId?: string): Promise<Note | null> {
  const supabase = await createClient()
  
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    userId = user.id
  }

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching note:', error)
    return null
  }

  return data ? supabaseToNote(data) : null
}

/**
 * Tạo note mới
 */
export async function createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<Note | null> {
  const supabase = await createClient()
  
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    userId = user.id
  }

  const insertData = {
    ...noteToSupabase(note),
    user_id: userId,
  }

  const { data, error } = await supabase
    .from('pages')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating note:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    console.error('Insert data:', JSON.stringify(insertData, null, 2))
    throw new Error(`Failed to create note: ${error.message}`)
  }

  return data ? supabaseToNote(data) : null
}

/**
 * Cập nhật note
 */
export async function updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>, userId?: string): Promise<Note | null> {
  const supabase = await createClient()
  
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    userId = user.id
  }

  const updateData: any = {}
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.content !== undefined) updateData.content = updates.content
  if (updates.icon !== undefined) updateData.icon = updates.icon || null
  if (updates.coverUrl !== undefined) updateData.cover_url = updates.coverUrl || null
  if (updates.parentId !== undefined) updateData.parent_id = updates.parentId || null
  if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite
  if (updates.isArchived !== undefined) updateData.is_archived = updates.isArchived

  const { data, error } = await supabase
    .from('pages')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating note:', error)
    return null
  }

  return data ? supabaseToNote(data) : null
}

/**
 * Xóa note
 */
export async function deleteNote(id: string, userId?: string): Promise<boolean> {
  const supabase = await createClient()
  
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    userId = user.id
  }

  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting note:', error)
    return false
  }

  return true
}

/**
 * Toggle favorite
 */
export async function toggleFavorite(id: string, userId?: string): Promise<Note | null> {
  const note = await getNoteById(id, userId)
  if (!note) return null
  
  return await updateNote(id, { isFavorite: !note.isFavorite }, userId)
}

