"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { UserMenu } from "@/components/auth/user-menu"
import { ThemeSelector } from "@/components/theme-selector"
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
          <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-5">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-6 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9 sm:h-12 sm:w-12 flex-shrink-0"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <Menu className="w-5 h-5 sm:w-7 sm:h-7" />
                </Button>
                <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-primary-foreground" />
                  </div>
                  <span className="text-base sm:text-xl font-bold hidden sm:inline truncate">AI Calendar</span>
                </Link>
              </div>

              <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
                <Link href="/chat" className="hidden sm:block">
                  <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-12 sm:w-12">
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>
                </Link>
                <ThemeSelector />
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-8xl font-bold mb-2 sm:mb-4 lg:mb-8">Tất cả trang</h1>
              <p className="text-base sm:text-xl lg:text-2xl xl:text-3xl text-muted-foreground">
                Quản lý notes và tài liệu của bạn
              </p>
            </div>
            <Button 
              onClick={handleCreateNote} 
              size="lg" 
              className="h-10 sm:h-12 lg:h-14 px-4 sm:px-6 lg:px-8 text-sm sm:text-base lg:text-xl w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 sm:mr-2 lg:mr-3" />
              <span>Trang mới</span>
            </Button>
          </div>

          {/* Search */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 sm:pl-12 lg:pl-14 text-base sm:text-xl lg:text-2xl xl:text-3xl h-12 sm:h-16 lg:h-20"
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
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 sm:mb-8 lg:mb-12 flex items-center gap-3 sm:gap-4 lg:gap-6">
                    <Star className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                    <span>Yêu thích</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
                    {favoriteNotes.map((note) => (
                      <Link key={note.id} href={`/pages/${note.id}`}>
                        <Card className="p-4 sm:p-6 lg:p-8 xl:p-12 hover:shadow-lg transition-shadow cursor-pointer h-full">
                          <div className="flex items-start justify-between mb-3 sm:mb-4 lg:mb-6 gap-2">
                            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 min-w-0 flex-1">
                              {note.icon && (
                                <span className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl flex-shrink-0">{note.icon}</span>
                              )}
                              {!note.icon && <FileText className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-muted-foreground flex-shrink-0" />}
                              <h3 className="text-base sm:text-xl lg:text-2xl xl:text-3xl font-bold line-clamp-2 min-w-0">{note.title}</h3>
                            </div>
                            <Star className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                          </div>
                          <p className="text-xs sm:text-sm lg:text-lg xl:text-2xl text-muted-foreground">
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
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 sm:mb-8 lg:mb-12">Tất cả notes</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
                    {regularNotes.map((note) => (
                      <Link key={note.id} href={`/pages/${note.id}`}>
                        <Card className="p-4 sm:p-6 lg:p-8 xl:p-12 hover:shadow-lg transition-shadow cursor-pointer h-full">
                          <div className="flex items-start gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4 lg:mb-6">
                            {note.icon && (
                              <span className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl flex-shrink-0">{note.icon}</span>
                            )}
                            {!note.icon && <FileText className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-muted-foreground flex-shrink-0" />}
                            <h3 className="text-base sm:text-xl lg:text-2xl xl:text-3xl font-bold line-clamp-2 min-w-0">{note.title}</h3>
                          </div>
                          <p className="text-xs sm:text-sm lg:text-lg xl:text-2xl text-muted-foreground">
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
                <Card className="p-6 sm:p-8 lg:p-12 text-center">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    {searchQuery ? "Không tìm thấy notes" : "Chưa có notes nào"}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">
                    {searchQuery
                      ? "Thử tìm kiếm với từ khóa khác"
                      : "Tạo note đầu tiên để bắt đầu"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={handleCreateNote} size="sm" className="sm:size-default">
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

