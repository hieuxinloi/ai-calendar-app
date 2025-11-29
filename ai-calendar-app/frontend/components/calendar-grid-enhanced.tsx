"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/shared/utils/utils"
import { getTasksByDate, type Task } from "@/backend/lib/services/tasks"
import { Clock, Flag } from "lucide-react"

interface CalendarGridEnhancedProps {
  currentDate: Date
  selectedDate: Date
  onSelectDate: (date: Date) => void
  view: "day" | "week" | "month"
  onTaskClick?: (task: Task) => void
}

// Color coding cho tasks giống Google Calendar
const getTaskColor = (task: Task): string => {
  if (task.completed) return "bg-muted/50 text-muted-foreground"
  
  switch (task.priority) {
    case "high":
      return "bg-destructive/10 text-destructive border-l-4 border-destructive"
    case "medium":
      return "bg-accent/10 text-accent border-l-4 border-accent"
    case "low":
      return "bg-primary/10 text-primary border-l-4 border-primary"
    default:
      return "bg-secondary/10 text-secondary border-l-4 border-secondary"
  }
}

export function CalendarGridEnhanced({ 
  currentDate, 
  selectedDate, 
  onSelectDate, 
  view,
  onTaskClick 
}: CalendarGridEnhancedProps) {
  const [tasksByDate, setTasksByDate] = useState<Map<string, Task[]>>(new Map())

  useEffect(() => {
    loadTasksForMonth()
  }, [currentDate])

  const loadTasksForMonth = async () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const tasksMap = new Map<string, Task[]>()
    
    // Load tasks for all days in month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      try {
        const tasks = await getTasksByDate(date)
        const dateString = date.toISOString().split('T')[0]
        if (tasks && tasks.length > 0) {
          tasksMap.set(dateString, tasks)
        }
      } catch (error) {
        console.error(`Error loading tasks for ${date}:`, error)
      }
    }
    
    setTasksByDate(tasksMap)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
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

  const getTasksForDate = (date: Date | null): Task[] => {
    if (!date) return []
    const dateString = date.toISOString().split('T')[0]
    return tasksByDate.get(dateString) || []
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

  // Month View - Google Calendar style với tasks hiển thị như events
  if (view === "month") {
    return (
      <Card className="p-4 overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-border">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div 
              key={day} 
              className="bg-background text-center text-xs font-medium text-muted-foreground py-2 px-1"
            >
              {day}
            </div>
          ))}

          {/* Calendar days với tasks */}
          {days.map((date, index) => {
            const tasks = getTasksForDate(date)
            const isCurrentDay = isToday(date)
            const isSelectedDay = isSelected(date)
            
            return (
              <div
                key={index}
                className={cn(
                  "bg-background min-h-[80px] sm:min-h-[100px] p-1 border-r border-b border-border",
                  "hover:bg-muted/30 transition-colors",
                  isCurrentDay && "bg-primary/5",
                  isSelectedDay && "ring-2 ring-primary ring-inset"
                )}
              >
                {date ? (
                  <div
                    onClick={() => onSelectDate(date)}
                    className={cn(
                      "w-full h-full cursor-pointer",
                      isCurrentDay && "font-semibold"
                    )}
                  >
                    <div className={cn(
                      "text-sm mb-1 font-medium",
                      isCurrentDay && "text-primary",
                      isSelectedDay && "text-primary font-bold text-base"
                    )}>
                      {date.getDate()}
                    </div>
                    
                    {/* Tasks gộp lại - chỉ hiển thị số lượng */}
                    {tasks.length > 0 && (
                      <div className="mt-1">
                        <div
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded inline-block",
                            "hover:opacity-80 transition-opacity",
                            tasks.length === 1 
                              ? getTaskColor(tasks[0])
                              : "bg-primary/10 text-primary border-l-2 border-primary"
                          )}
                          title={`${tasks.length} công việc`}
                        >
                          {tasks.length === 1 
                            ? (tasks[0].time ? `${tasks[0].time} ` : '') + tasks[0].title
                            : `${tasks.length} việc`
                          }
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full" />
                )}
              </div>
            )
          })}
        </div>
      </Card>
    )
  }

  // Week View - Timeline style giống Google Calendar
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
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-8 border-b border-border">
          {/* Time column header */}
          <div className="border-r border-border p-2 bg-muted/30" />
          
          {/* Day headers */}
          {weekDates.map((date, index) => (
            <div
              key={index}
              className={cn(
                "p-2 text-center border-r border-border last:border-r-0",
                "bg-muted/30",
                isToday(date) && "bg-primary/10"
              )}
            >
              <div className="text-xs text-muted-foreground">{weekDays[index]}</div>
              <div className={cn(
                "text-lg font-semibold",
                isToday(date) && "text-primary"
              )}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline với hours */}
        <div className="max-h-[600px] overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-border/50">
              {/* Time label */}
              <div className="border-r border-border p-1 text-xs text-muted-foreground text-right pr-2 bg-muted/20">
                {hour.toString().padStart(2, '0')}:00
              </div>
              
              {/* Day columns */}
              {weekDates.map((date, dayIndex) => {
                const tasks = getTasksForDate(date)
                const hourTasks = tasks.filter(task => {
                  if (!task.time) return false
                  const [taskHour] = task.time.split(':').map(Number)
                  return taskHour === hour
                })
                
                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "border-r border-border last:border-r-0 min-h-[60px] p-1",
                      "hover:bg-muted/20 transition-colors"
                    )}
                  >
                    {hourTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick?.(task)}
                        className={cn(
                          "text-xs p-1.5 rounded mb-1 cursor-pointer",
                          "hover:opacity-80 transition-opacity",
                          getTaskColor(task)
                        )}
                        title={task.title}
                      >
                        <div className="font-medium truncate">{task.title}</div>
                        {task.time && (
                          <div className="text-[10px] opacity-70">{task.time}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </Card>
    )
  }

  // Day View - Timeline chi tiết giống Google Calendar
  const dayTasks = getTasksForDate(selectedDate)
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <Card className="p-0 overflow-hidden">
      {/* Day header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="text-2xl font-bold mb-1">
          {selectedDate.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <div className="text-sm text-muted-foreground">
          {dayTasks.length} công việc
        </div>
      </div>

      {/* Timeline */}
      <div className="max-h-[700px] overflow-y-auto">
        {hours.map((hour) => {
          const hourTasks = dayTasks.filter(task => {
            if (!task.time) return false
            const [taskHour] = task.time.split(':').map(Number)
            return taskHour === hour
          })
          
          return (
            <div key={hour} className="grid grid-cols-[80px_1fr] border-b border-border/50">
              {/* Time label */}
              <div className="border-r border-border p-2 text-sm text-muted-foreground text-right pr-3 bg-muted/20">
                {hour.toString().padStart(2, '0')}:00
              </div>
              
              {/* Tasks for this hour */}
              <div className="p-2">
                {hourTasks.length > 0 ? (
                  <div className="space-y-2">
                    {hourTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick?.(task)}
                        className={cn(
                          "p-3 rounded-lg cursor-pointer transition-all",
                          "hover:shadow-md hover:scale-[1.02]",
                          getTaskColor(task)
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-medium mb-1">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {task.description}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {task.time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {task.time}
                              </div>
                            )}
                            {task.priority && (
                              <div className="flex items-center gap-1">
                                <Flag className="w-3 h-3" />
                                {task.priority}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-16 border-b border-dashed border-border/30" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

