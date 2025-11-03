export interface Task {
  id: string
  title: string
  description?: string
  time?: string
  priority: "high" | "medium" | "low"
  category?: string
  completed: boolean
  date: string
  createdAt: Date
}

const STORAGE_KEY = "ai-calendar-tasks"

export function getTasks(): Task[] {
  if (typeof window === "undefined") return []
  
  try {
    const tasks = localStorage.getItem(STORAGE_KEY)
    return tasks ? JSON.parse(tasks) : []
  } catch {
    return []
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (error) {
    console.error("Failed to save tasks:", error)
  }
}

export function addTask(task: Omit<Task, "id" | "createdAt">): Task {
  const newTask: Task = {
    ...task,
    id: Date.now().toString(),
    createdAt: new Date(),
  }
  
  const tasks = getTasks()
  const updatedTasks = [...tasks, newTask]
  saveTasks(updatedTasks)
  
  return newTask
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = getTasks()
  const index = tasks.findIndex((t) => t.id === id)
  
  if (index === -1) return null
  
  const updatedTask = { ...tasks[index], ...updates }
  tasks[index] = updatedTask
  saveTasks(tasks)
  
  return updatedTask
}

export function deleteTask(id: string): boolean {
  const tasks = getTasks()
  const filtered = tasks.filter((t) => t.id !== id)
  
  if (filtered.length === tasks.length) return false
  
  saveTasks(filtered)
  return true
}

export function getTasksByDate(date: Date): Task[] {
  const dateString = date.toISOString().split("T")[0]
  return getTasks().filter((t) => t.date === dateString)
}