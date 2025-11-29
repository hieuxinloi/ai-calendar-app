"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CalendarGridProps {
  currentDate: Date
  selectedDate: Date
  onSelectDate: (date: Date) => void
  view: "day" | "week" | "month"
}

export function CalendarGrid({ currentDate, selectedDate, onSelectDate, view }: CalendarGridProps) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date: Date | null) => {
    if (!date) return false
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

  // Sample tasks for demo
  const hasTasks = (date: Date | null) => {
    if (!date) return false
    return date.getDate() % 3 === 0 // Demo: every 3rd day has tasks
  }

  if (view === "month") {
    return (
      <Card className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((date, index) => (
            <button
              key={index}
              onClick={() => date && onSelectDate(date)}
              disabled={!date}
              className={cn(
                "aspect-square rounded-lg p-2 text-sm transition-colors relative",
                "hover:bg-muted disabled:opacity-0 disabled:cursor-default",
                isToday(date) && "bg-primary/10 font-semibold",
                isSelected(date) && "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {date && (
                <>
                  <span>{date.getDate()}</span>
                  {hasTasks(date) && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      <div className="w-1 h-1 rounded-full bg-secondary" />
                      <div className="w-1 h-1 rounded-full bg-accent" />
                    </div>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </Card>
    )
  }

  if (view === "week") {
    const getWeekDays = () => {
      const week = []
      const startOfWeek = new Date(selectedDate)
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())

      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek)
        day.setDate(startOfWeek.getDate() + i)
        week.push(day)
      }
      return week
    }

    const weekDates = getWeekDays()

    return (
      <Card className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => (
            <button
              key={index}
              onClick={() => onSelectDate(date)}
              className={cn(
                "rounded-lg p-3 text-center transition-colors",
                "hover:bg-muted",
                isToday(date) && "bg-primary/10",
                isSelected(date) && "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              <div className="text-xs text-muted-foreground mb-1">{weekDays[index]}</div>
              <div className="text-lg font-semibold">{date.getDate()}</div>
              {hasTasks(date) && (
                <div className="flex gap-0.5 justify-center mt-2">
                  <div className="w-1 h-1 rounded-full bg-secondary" />
                  <div className="w-1 h-1 rounded-full bg-accent" />
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>
    )
  }

  // Day view
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">{selectedDate.getDate()}</div>
          <div className="text-muted-foreground">
            {selectedDate.toLocaleDateString("vi-VN", { weekday: "long", month: "long", year: "numeric" })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">5</div>
            <div className="text-sm text-muted-foreground">Công việc</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-secondary">3</div>
            <div className="text-sm text-muted-foreground">Hoàn thành</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
