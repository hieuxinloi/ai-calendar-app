export interface MoodRecord {
  id: string
  date: string
  mood: string
  note: string
  emoji: string
  createdAt: Date
}

const STORAGE_KEY = "ai-calendar-moods"

export function getMoods(): MoodRecord[] {
  if (typeof window === "undefined") return []
  
  try {
    const moods = localStorage.getItem(STORAGE_KEY)
    return moods ? JSON.parse(moods) : []
  } catch {
    return []
  }
}

export function saveMoods(moods: MoodRecord[]): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moods))
  } catch (error) {
    console.error("Failed to save moods:", error)
  }
}

export function addMood(mood: Omit<MoodRecord, "id" | "createdAt">): MoodRecord {
  const newMood: MoodRecord = {
    ...mood,
    id: Date.now().toString(),
    createdAt: new Date(),
  }
  
  const moods = getMoods()
  const updatedMoods = [...moods, newMood]
  saveMoods(updatedMoods)
  
  return newMood
}

export function getMoodByDate(date: Date): MoodRecord | null {
  const dateString = date.toISOString().split("T")[0]
  const moods = getMoods()
  return moods.find((m) => m.date === dateString) || null
}

export function updateMood(id: string, updates: Partial<MoodRecord>): MoodRecord | null {
  const moods = getMoods()
  const index = moods.findIndex((m) => m.id === id)
  
  if (index === -1) return null
  
  const updatedMood = { ...moods[index], ...updates }
  moods[index] = updatedMood
  saveMoods(moods)
  
  return updatedMood
}

export function deleteMood(id: string): boolean {
  const moods = getMoods()
  const filtered = moods.filter((m) => m.id !== id)
  
  if (filtered.length === moods.length) return false
  
  saveMoods(filtered)
  return true
}