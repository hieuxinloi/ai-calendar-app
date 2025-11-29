export interface MoodRecord {
  id: string
  date: string
  mood: string
  note: string
  emoji: string
  createdAt: Date
}

// Re-export từ supabase moods để dùng trong frontend
export { getMoods, getMoodByDate, addMood, updateMood, deleteMood } from '../supabase/moods'

