"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Flag, Tag, FileText, Link as LinkIcon } from "lucide-react"
import { addTask } from "@/backend/lib/services/tasks"
import { getNotes, type Note } from "@/backend/lib/services/notes"
import { useEffect } from "react"
import Link from "next/link"

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date
  onTaskAdded?: () => void
}

export function AddTaskDialog({ open, onOpenChange, selectedDate, onTaskAdded }: AddTaskDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [time, setTime] = useState("")
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium")
  const [category, setCategory] = useState("")
  const [linkedPageId, setLinkedPageId] = useState<string>("")
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadNotes()
    }
  }, [open])

  const loadNotes = async () => {
    try {
      const allNotes = await getNotes()
      setNotes(allNotes)
    } catch (error) {
      console.error("Error loading notes:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!title.trim()) return

    setIsLoading(true)
    
    try {
      const dateString = selectedDate.toISOString().split("T")[0]
      
      const newTask = await addTask({
        title: title.trim(),
        description: description.trim(),
        time,
        priority,
        category,
        completed: false,
        date: dateString,
        linkedPageId: linkedPageId === "none" ? undefined : linkedPageId || undefined,
      })
      
      if (!newTask) {
        throw new Error("Failed to add task")
      }

      // Reset form
      setTitle("")
      setDescription("")
      setTime("")
      setPriority("medium")
      setCategory("")
      setLinkedPageId("")
      
      // Notify parent
      onTaskAdded?.()
      
      // Close dialog
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to add task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm công việc mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input
              id="title"
              placeholder="Nhập tên công việc..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Thêm mô tả chi tiết..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ngày</Label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{selectedDate.toLocaleDateString("vi-VN")}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Thời gian</Label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="border-0 p-0 h-auto focus-visible:ring-0"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Độ ưu tiên</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)} disabled={isLoading}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Select value={category} onValueChange={setCategory} disabled={isLoading}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <SelectValue placeholder="Chọn danh mục" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Công việc</SelectItem>
                  <SelectItem value="study">Học tập</SelectItem>
                  <SelectItem value="health">Sức khỏe</SelectItem>
                  <SelectItem value="personal">Cá nhân</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedPage">Liên kết với tài liệu</Label>
            <Select value={linkedPageId} onValueChange={setLinkedPageId} disabled={isLoading}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  <SelectValue placeholder="Chọn tài liệu (tùy chọn)" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không liên kết</SelectItem>
                {notes.map((note) => (
                  <SelectItem key={note.id} value={note.id}>
                    <div className="flex items-center gap-2">
                      {note.icon && <span>{note.icon}</span>}
                      <span>{note.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {linkedPageId && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                <Link href={`/pages/${linkedPageId}`} className="hover:underline">
                  Xem tài liệu
                </Link>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Đang lưu..." : "Thêm công việc"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
