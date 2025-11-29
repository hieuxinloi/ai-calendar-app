"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { UserMenu } from "@/components/auth/user-menu"
import { 
  Menu,
  Calendar,
  MessageCircle,
  Star,
  Save,
  ArrowLeft,
  Plus,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { getNoteById, updateNote, toggleFavorite, createNote, type Note } from "@/backend/lib/services/notes"
import { toast } from "sonner"
import { TipTapEditor } from "@/components/tiptap-editor"

export default function NotePage() {
  const params = useParams()
  const router = useRouter()
  const noteId = params.id as string
  
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState<any>(null)
  const [originalTitle, setOriginalTitle] = useState("")
  const [originalContent, setOriginalContent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [childPages, setChildPages] = useState<Note[]>([])
  const [isLoadingChildren, setIsLoadingChildren] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (noteId) {
      loadNote()
    }
  }, [noteId])

  const loadNote = async () => {
    setIsLoading(true)
    try {
      const loadedNote = await getNoteById(noteId)
      if (loadedNote) {
        setNote(loadedNote)
        const loadedTitle = loadedNote.title
        const loadedContent = loadedNote.content || null
        setTitle(loadedTitle)
        setContent(loadedContent)
        setOriginalTitle(loadedTitle)
        setOriginalContent(loadedContent)
        setHasChanges(false)
        // Load child pages
        loadChildPages(noteId)
      } else {
        toast.error("Không tìm thấy note")
        router.push("/pages")
      }
    } catch (error) {
      console.error("Error loading note:", error)
      toast.error("Không thể tải note")
    } finally {
      setIsLoading(false)
    }
  }

  const loadChildPages = async (parentId: string) => {
    setIsLoadingChildren(true)
    try {
      const response = await fetch(`/api/notes?parentId=${parentId}`)
      if (response.ok) {
        const children = await response.json()
        setChildPages(children)
      }
    } catch (error) {
      console.error("Error loading child pages:", error)
    } finally {
      setIsLoadingChildren(false)
    }
  }

  const handleSave = useCallback(async () => {
    if (!note || !hasChanges) return
    
    setIsSaving(true)
    try {
      const updated = await updateNote(noteId, {
        title,
        content: content || "",
      })
      
      if (updated) {
        setNote(updated)
        setOriginalTitle(title)
        setOriginalContent(content)
        setHasChanges(false)
        toast.success("Đã lưu")
      } else {
        toast.error("Không thể lưu")
      }
    } catch (error) {
      console.error("Error saving note:", error)
      toast.error("Không thể lưu note")
    } finally {
      setIsSaving(false)
    }
  }, [note, noteId, title, content, hasChanges])

  // Check for changes and auto-save
  useEffect(() => {
    if (!note) return
    
    const titleChanged = title !== originalTitle
    const contentChanged = content !== originalContent
    
    const hasActualChanges = titleChanged || contentChanged
    setHasChanges(hasActualChanges)

    // Auto-save when there are changes (debounced)
    if (hasActualChanges) {
      const timeoutId = setTimeout(() => {
        handleSave()
      }, 1500) // Auto-save after 1.5 seconds of inactivity

      return () => clearTimeout(timeoutId)
    }
  }, [title, content, originalTitle, originalContent, note, handleSave])

  // Auto-save before leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ""
        // Try to save synchronously (may not work in all browsers)
        handleSave()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasChanges, handleSave])

  const handleCreateChildPage = async () => {
    try {
      const response = await fetch('/api/notes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Untitled",
          content: {},
          isFavorite: false,
          isArchived: false,
          parentId: noteId,
        }),
      })
      const newPage = await response.json()
      if (newPage?.id) {
        loadChildPages(noteId)
        toast.success("Đã tạo page con")
      }
    } catch (error) {
      console.error("Error creating child page:", error)
      toast.error("Không thể tạo page con")
    }
  }

  const handleToggleFavorite = async () => {
    if (!note) return
    
    try {
      const updated = await toggleFavorite(noteId)
      if (updated) {
        setNote(updated)
        toast.success(updated.isFavorite ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích")
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast.error("Không thể cập nhật")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    )
  }

  if (!note) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-80">
        {/* Header */}
        <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
          <div className="container mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-12 w-12"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="w-7 h-7" />
              </Button>
              <Link href="/pages">
                <Button variant="ghost" size="icon" className="h-12 w-12">
                  <ArrowLeft className="w-7 h-7" />
                </Button>
              </Link>
              <Link href="/" className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold hidden sm:inline">AI Calendar</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12"
                onClick={handleToggleFavorite}
              >
                <Star 
                  className={`w-6 h-6 ${note.isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} 
                />
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !hasChanges} className="h-12 px-6 text-lg">
                <Save className="w-6 h-6 mr-3" />
                {isSaving ? "Đang lưu..." : hasChanges ? "Lưu" : "Đã lưu"}
              </Button>
              <Link href="/chat">
                <Button variant="ghost" size="icon" className="h-12 w-12">
                  <MessageCircle className="w-6 h-6" />
                </Button>
              </Link>
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Editor - Notion Style */}
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-28 py-16">
            {/* Title Input - Notion style */}
            <div className="mb-8">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled"
                className="text-9xl font-bold border-none shadow-none p-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Child Pages - Nested pages (inline in content) */}
            {childPages.length > 0 && (
              <div className="mb-8 space-y-5">
                {childPages.map((child) => (
                  <Link
                    key={child.id}
                    href={`/pages/${child.id}`}
                    className="flex items-center gap-6 px-5 py-5 rounded hover:bg-muted transition-colors group"
                  >
                    {child.icon ? (
                      <span className="text-5xl">{child.icon}</span>
                    ) : (
                      <FileText className="w-10 h-10 text-muted-foreground" />
                    )}
                    <span className="flex-1 text-3xl text-muted-foreground group-hover:text-foreground">{child.title}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* TipTap Editor - Clean Notion style */}
            <div className="mt-2">
              <TipTapEditor
                initialContent={content}
                onChange={(newContent) => {
                  // Only update if content actually changed
                  if (newContent !== content) {
                    setContent(newContent)
                  }
                }}
                editable={true}
              />
            </div>

            {/* Save status indicator */}
            <div className="mt-12 text-2xl text-muted-foreground flex items-center justify-between">
              <span>
                {isSaving ? (
                  "Đang lưu..."
                ) : hasChanges ? (
                  <span className="text-orange-500">Có thay đổi chưa lưu</span>
                ) : (
                  `Đã lưu: ${new Date(note.updatedAt).toLocaleString("vi-VN")}`
                )}
              </span>
              {hasChanges && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Lưu ngay
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

