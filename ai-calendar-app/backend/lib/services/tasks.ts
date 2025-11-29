export interface Task {
  id: string
  title: string
  description?: string
  time?: string
  priority: "high" | "medium" | "low"
  category?: string
  completed: boolean
  date: string
  linkedPageId?: string
  createdAt: Date
}

// Re-export từ supabase tasks để dùng trong frontend
export { getTasks, getTasksByDate, addTask, updateTask, deleteTask } from '../supabase/tasks'

