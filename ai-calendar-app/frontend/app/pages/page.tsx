"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { UserMenu } from "@/components/auth/user-menu"
import { 
  FileText, 
  Plus, 
  Search, 
  Star,
  Menu,
  Calendar,
  MessageCircle,
} from "lucide-react"
import { getNotes, type Note } from "@/backend/lib/services/notes"
import { createNote } from "@/backend/lib/services/notes"
import { toast } from "sonner"

export default function PagesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    setIsLoading(true)
    try {
      const allNotes = await getNotes()
      // Chỉ hiển thị các page chính (không có parentId)
      const parentNotes = allNotes.filter(note => !note.parentId)
      setNotes(parentNotes)
    } catch (error) {
      console.error("Error loading notes:", error)
      toast.error("Không thể tải danh sách notes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNote = async () => {
    try {
      // Call API route instead of direct server function
      const response = await fetch('/api/notes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: "Untitled",
          content: {},
          isFavorite: false,
          isArchived: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || data.details || `HTTP error! status: ${response.status}`
        toast.error(errorMessage, { duration: 5000 })
        return
      }

      if (data && data.id) {
        router.push(`/pages/${data.id}`)
      } else {
        toast.error("Không thể tạo note mới", { duration: 5000 })
      }
    } catch (error: any) {
      console.error("Error creating note:", error)
      toast.error(error.message || "Không thể tạo note mới. Vui lòng kiểm tra console.", { duration: 5000 })
    }
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const favoriteNotes = filteredNotes.filter(note => note.isFavorite)
  const regularNotes = filteredNotes.filter(note => !note.isFavorite)

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
              <Link href="/" className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold hidden sm:inline">AI Calendar</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/chat">
                <Button variant="ghost" size="icon" className="h-12 w-12">
                  <MessageCircle className="w-6 h-6" />
                </Button>
              </Link>
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-8 py-8 max-w-7xl">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h1 className="text-8xl font-bold mb-8">Tất cả trang</h1>
              <p className="text-3xl text-muted-foreground">
                Quản lý notes và tài liệu của bạn
              </p>
            </div>
            <Button onClick={handleCreateNote} size="lg" className="h-14 px-8 text-xl">
              <Plus className="w-6 h-6 mr-3" />
              Trang mới
            </Button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 text-3xl h-20"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Đang tải...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Favorite Notes */}
              {favoriteNotes.length > 0 && (
                <div>
                  <h2 className="text-6xl font-bold mb-12 flex items-center gap-6">
                    <Star className="w-12 h-12 text-yellow-500 fill-yellow-500" />
                    Yêu thích
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                    {favoriteNotes.map((note) => (
                      <Link key={note.id} href={`/pages/${note.id}`}>
                        <Card className="p-12 hover:shadow-lg transition-shadow cursor-pointer h-full">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-6">
                              {note.icon && (
                                <span className="text-6xl">{note.icon}</span>
                              )}
                              {!note.icon && <FileText className="w-12 h-12 text-muted-foreground" />}
                              <h3 className="text-3xl font-bold line-clamp-1">{note.title}</h3>
                            </div>
                            <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                          </div>
                          <p className="text-2xl text-muted-foreground">
                            {new Date(note.updatedAt).toLocaleDateString("vi-VN")}
                          </p>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Notes */}
              {regularNotes.length > 0 && (
                <div>
                  <h2 className="text-6xl font-bold mb-12">Tất cả notes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                    {regularNotes.map((note) => (
                      <Link key={note.id} href={`/pages/${note.id}`}>
                        <Card className="p-12 hover:shadow-lg transition-shadow cursor-pointer h-full">
                          <div className="flex items-start gap-6 mb-6">
                            {note.icon && (
                              <span className="text-6xl">{note.icon}</span>
                            )}
                            {!note.icon && <FileText className="w-12 h-12 text-muted-foreground" />}
                            <h3 className="text-3xl font-bold line-clamp-1">{note.title}</h3>
                          </div>
                          <p className="text-2xl text-muted-foreground">
                            {new Date(note.updatedAt).toLocaleDateString("vi-VN")}
                          </p>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {filteredNotes.length === 0 && (
                <Card className="p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "Không tìm thấy notes" : "Chưa có notes nào"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Thử tìm kiếm với từ khóa khác"
                      : "Tạo note đầu tiên để bắt đầu"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={handleCreateNote}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo note mới
                    </Button>
                  )}
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

