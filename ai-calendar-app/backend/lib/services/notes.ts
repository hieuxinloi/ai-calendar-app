export interface Note {
  id: string
  userId: string
  title: string
  content: any // JSONB content (blocks)
  icon?: string
  coverUrl?: string
  parentId?: string
  isFavorite: boolean
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

export { getNotes, getNoteById, createNote, updateNote, deleteNote, toggleFavorite } from '../supabase/notes'

