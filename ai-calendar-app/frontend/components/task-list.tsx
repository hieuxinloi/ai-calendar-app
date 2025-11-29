"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Clock, Flag, Link as LinkIcon, FileText } from "lucide-react"
import { cn } from "@/shared/utils/utils"
import { getTasksByDate, deleteTask, updateTask, type Task } from "@/backend/lib/services/tasks"
import { getNoteById, type Note } from "@/backend/lib/services/notes"
import Link from "next/link"

interface TaskListProps {
  date: Date
  onTasksChange?: (tasks: Task[]) => void
}

export function TaskList({ date, onTasksChange }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [linkedNotes, setLinkedNotes] = useState<Map<string, Note>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [date])

  const loadTasks = async () => {
    setIsLoading(true)
    try {
      const tasksForDate = await getTasksByDate(date)
      setTasks(tasksForDate || [])
      onTasksChange?.(tasksForDate || [])
      
      // Load linked notes
      const notesMap = new Map<string, Note>()
      for (const task of tasksForDate || []) {
        if (task.linkedPageId) {
          try {
            const note = await getNoteById(task.linkedPageId)
            if (note) {
              notesMap.set(task.id, note)
            }
          } catch (error) {
            console.error(`Error loading note ${task.linkedPageId}:`, error)
          }
        }
      }
      setLinkedNotes(notesMap)
    } catch (error) {
      console.error('Error loading tasks:', error)
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleTask = async (id: string, completed: boolean) => {
    await updateTask(id, { completed: !completed })
    loadTasks()
  }

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id)
    loadTasks()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-destructive"
      case "medium":
        return "text-accent"
      case "low":
        return "text-muted-foreground"
      default:
        return "text-muted-foreground"
    }
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "work":
        return "bg-primary/10 text-primary"
      case "study":
        return "bg-secondary/10 text-secondary"
      case "health":
        return "bg-accent/10 text-accent"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case "work":
        return "Công việc"
      case "study":
        return "Học tập"
      case "health":
        return "Sức khỏe"
      case "personal":
        return "Cá nhân"
      default:
        return category
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Chưa có công việc nào</p>
        <p className="text-sm text-muted-foreground mt-1">Thêm việc mới để bắt đầu</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={cn(
            "flex items-start gap-3 p-4 rounded-lg border border-border transition-colors",
            "hover:bg-muted/50",
            task.completed && "opacity-60"
          )}
        >
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => handleToggleTask(task.id, task.completed)}
            className="mt-1"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>
                {task.title}
              </h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mt-1 -mr-2 hover:text-destructive"
                onClick={() => handleDeleteTask(task.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {task.time && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{task.time}</span>
                </div>
              )}
              {task.priority && (
                <div className="flex items-center gap-1">
                  <Flag className={cn("w-3 h-3", getPriorityColor(task.priority))} />
                  <span className="text-xs">{task.priority === "high" ? "Cao" : task.priority === "medium" ? "Trung bình" : "Thấp"}</span>
                </div>
              )}
              {task.category && (
                <Badge variant="secondary" className={cn("text-xs", getCategoryColor(task.category))}>
                  {getCategoryLabel(task.category)}
                </Badge>
              )}
              {task.linkedPageId && linkedNotes.has(task.id) && (
                <Link 
                  href={`/pages/${task.linkedPageId}`}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span className="flex items-center gap-1">
                    {linkedNotes.get(task.id)?.icon && (
                      <span>{linkedNotes.get(task.id)?.icon}</span>
                    )}
                    {linkedNotes.get(task.id)?.title || "Tài liệu"}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
