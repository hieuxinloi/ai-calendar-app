"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { addMood, getMoodByDate, updateMood } from "@/lib/mood"
import { Trash2, Check } from "lucide-react"

interface MoodSelectorProps {
  date: Date
  onMoodSaved?: () => void
}

const moods = [
  { emoji: "😊", label: "Vui vẻ", value: "happy", color: "bg-chart-2/10 text-chart-2 hover:bg-chart-2/20" },
  { emoji: "😌", label: "Bình thường", value: "neutral", color: "bg-muted text-muted-foreground hover:bg-muted/80" },
  { emoji: "😔", label: "Buồn", value: "sad", color: "bg-chart-1/10 text-chart-1 hover:bg-chart-1/20" },
  { emoji: "😰", label: "Căng thẳng", value: "stressed", color: "bg-destructive/10 text-destructive hover:bg-destructive/20" },
  { emoji: "🤩", label: "Hứng khởi", value: "excited", color: "bg-accent/10 text-accent hover:bg-accent/20" },
]

export function MoodSelector({ date, onMoodSaved }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [moodId, setMoodId] = useState<string | null>(null)

  useEffect(() => {
    loadMood()
  }, [date])

  const loadMood = () => {
    const existingMood = getMoodByDate(date)
    if (existingMood) {
      setSelectedMood(existingMood.mood)
      setNote(existingMood.note)
      setMoodId(existingMood.id)
      setIsSaved(true)
    } else {
      setSelectedMood(null)
      setNote("")
      setMoodId(null)
      setIsSaved(false)
    }
  }

  const handleSaveMood = async () => {
    if (!selectedMood) return

    setIsLoading(true)
    try {
      const dateString = date.toISOString().split("T")[0]
      const moodData = moods.find((m) => m.value === selectedMood)

      if (moodId) {
        // Update existing mood
        updateMood(moodId, {
          mood: selectedMood,
          note: note.trim(),
          emoji: moodData?.emoji || "😊",
        })
      } else {
        // Add new mood
        const newMood = addMood({
          date: dateString,
          mood: selectedMood,
          note: note.trim(),
          emoji: moodData?.emoji || "😊",
        })
        setMoodId(newMood.id)
      }

      setIsSaved(true)
      onMoodSaved?.()

      // Show success message for 2 seconds
      setTimeout(() => {
        setIsSaved(false)
      }, 2000)
    } catch (error) {
      console.error("Failed to save mood:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMood = () => {
    if (!moodId) return

    try {
      setSelectedMood(null)
      setNote("")
      setMoodId(null)
      setIsSaved(false)
      onMoodSaved?.()
    } catch (error) {
      console.error("Failed to delete mood:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => setSelectedMood(mood.value)}
            className={cn(
              "aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-all",
              mood.color,
              selectedMood === mood.value && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105",
            )}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-xs font-medium">{mood.label}</span>
          </button>
        ))}
      </div>

      {selectedMood !== null && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <Textarea
            placeholder="Ghi chú về tâm trạng hôm nay..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="resize-none"
            rows={3}
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={handleSaveMood}
              disabled={isLoading}
            >
              {isLoading ? "Đang lưu..." : isSaved ? "Đã lưu ✓" : "Lưu tâm trạng"}
            </Button>
            {moodId && (
              <Button
                size="sm"
                variant="outline"
                className="px-3"
                onClick={handleDeleteMood}
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
          {isSaved && (
            <p className="text-sm text-green-600 text-center flex items-center justify-center gap-1">
              <Check className="w-4 h-4" />
              Đã lưu thành công!
            </p>
          )}
        </div>
      )}

      {selectedMood === null && (
        <p className="text-sm text-muted-foreground text-center">Chọn tâm trạng của bạn hôm nay</p>
      )}
    </div>
  )
}