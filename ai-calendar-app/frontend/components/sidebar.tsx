"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Calendar, 
  FileText, 
  LayoutGrid, 
  List, 
  MessageCircle,
  Settings,
  Sparkles,
  ChevronRight,
  Plus,
  Folder,
  Star,
  Lock,
  MoreHorizontal
} from "lucide-react"
import { cn } from "@/shared/utils/utils"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { getNotes, type Note } from "@/backend/lib/services/notes"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set(["workspace"]))
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoadingNotes, setIsLoadingNotes] = useState(true)
  const [sortBy, setSortBy] = useState<"lastEdited" | "name" | "created">("lastEdited")
  const [showLimit, setShowLimit] = useState<number>(10)

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      const allNotes = await getNotes()
      setNotes(allNotes)
      // Auto-expand pages that have children
      const pagesWithChildren = allNotes.filter(note => 
        allNotes.some(child => child.parentId === note.id)
      )
      setExpandedPages(prev => {
        const newSet = new Set(prev)
        pagesWithChildren.forEach(note => newSet.add(note.id))
        return newSet
      })
    } catch (error) {
      console.error("Error loading notes:", error)
    } finally {
      setIsLoadingNotes(false)
    }
  }

  // Group notes by parent
  const getParentNotes = () => {
    let filtered = notes.filter(note => !note.parentId)
    
    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title)
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "lastEdited":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })
    
    // Limit
    return filtered.slice(0, showLimit)
  }
  
  const parentNotes = getParentNotes()
  const getChildNotes = (parentId: string) => 
    notes.filter(note => note.parentId === parentId)

  const handleCreatePage = async (parentId?: string) => {
    try {
      const response = await fetch('/api/notes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Untitled",
          content: {},
          isFavorite: false,
          isArchived: false,
          parentId: parentId || null,
        }),
      })
      const newNote = await response.json()
      if (newNote?.id) {
        await loadNotes()
        window.location.href = `/pages/${newNote.id}`
      }
    } catch (error) {
      console.error("Error creating page:", error)
    }
  }

  const handleCreateChildPage = async (parentId: string) => {
    try {
      const response = await fetch('/api/notes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Untitled",
          content: {},
          isFavorite: false,
          isArchived: false,
          parentId: parentId,
        }),
      })
      const newNote = await response.json()
      if (newNote?.id) {
        await loadNotes()
        window.location.href = `/pages/${newNote.id}`
      }
    } catch (error) {
      console.error("Error creating child page:", error)
    }
  }

  const handleRenamePage = async (noteId: string, currentTitle: string) => {
    const newTitle = window.prompt("Nhập tên mới:", currentTitle)
    if (newTitle && newTitle !== currentTitle && newTitle.trim()) {
      try {
        const { updateNote } = await import("@/backend/lib/services/notes")
        await updateNote(noteId, { title: newTitle.trim() })
        await loadNotes()
      } catch (error) {
        console.error("Error renaming note:", error)
      }
    }
  }

  const handleDeletePage = async (noteId: string) => {
    if (window.confirm("Bạn có chắc muốn xóa page này? Tất cả pages con cũng sẽ bị xóa.")) {
      try {
        const { deleteNote } = await import("@/backend/lib/services/notes")
        await deleteNote(noteId)
        await loadNotes()
      } catch (error) {
        console.error("Error deleting note:", error)
      }
    }
  }

  const togglePage = (pageId: string) => {
    setExpandedPages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(pageId)) {
        newSet.delete(pageId)
      } else {
        newSet.add(pageId)
      }
      return newSet
    })
  }

  const isExpanded = (pageId: string) => expandedPages.has(pageId)

  // Recursive component to render nested pages
  const renderPageItem = (note: Note, level: number = 0) => {
    const children = getChildNotes(note.id)
    const hasChildren = children.length > 0
    const isNoteExpanded = isExpanded(note.id)
    const isActive = pathname === `/pages/${note.id}`
    
    return (
      <div key={note.id} className="space-y-0.5">
        {/* Page Item */}
        <div
          className={cn(
            "group flex items-center gap-3 px-4 py-3 rounded text-xl transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
            level > 0 && "ml-4"
          )}
          style={{ paddingLeft: `${8 + level * 16}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                togglePage(note.id)
              }}
              className="p-0.5 hover:bg-sidebar-accent rounded flex-shrink-0"
            >
              <ChevronRight
                className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform",
                  isNoteExpanded && "rotate-90"
                )}
              />
            </button>
          ) : (
            <div className="w-4 h-4 flex-shrink-0" />
          )}
          <Link
            href={`/pages/${note.id}`}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            {note.icon ? (
              <span className="text-2xl flex-shrink-0">{note.icon}</span>
            ) : (
              <FileText className="w-7 h-7 flex-shrink-0 text-muted-foreground" />
            )}
            <span className="truncate text-xl text-muted-foreground">{note.title}</span>
          </Link>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCreateChildPage(note.id)
              }}
              className="p-1 hover:bg-sidebar-accent rounded"
              title="Tạo page con"
            >
              <Plus className="w-5 h-5 text-muted-foreground" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 hover:bg-sidebar-accent rounded"
                >
                  <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleRenamePage(note.id, note.title)}>
                  Đổi tên
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => {
                  try {
                    const { toggleFavorite } = await import("@/backend/lib/services/notes")
                    await toggleFavorite(note.id)
                    await loadNotes()
                  } catch (error) {
                    console.error("Error toggling favorite:", error)
                  }
                }}>
                  {note.isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeletePage(note.id)}
                  className="text-destructive"
                >
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Child Pages - Recursive */}
        {hasChildren && isNoteExpanded && (
          <div className="space-y-0.5">
            {children.map((child) => renderPageItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const navItems = [
    {
      icon: Calendar,
      label: "Lịch",
      href: "/calendar",
      active: pathname === "/calendar"
    },
    {
      icon: MessageCircle,
      label: "AI Chat",
      href: "/chat",
      active: pathname === "/chat"
    },
    {
      icon: LayoutGrid,
      label: "Tất cả trang",
      href: "/pages",
      active: pathname === "/pages"
    },
  ]

  const pages = [
    {
      id: "workspace",
      label: "Workspace",
      icon: Folder,
      children: [
        { id: "tasks", label: "Tasks", icon: List },
        { id: "notes", label: "Notes", icon: FileText },
        { id: "projects", label: "Projects", icon: Folder },
      ]
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: Star,
      children: [
        { id: "important", label: "Important", icon: Star },
      ]
    }
  ]

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-sidebar border-r border-sidebar-border z-40 transition-transform duration-200",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">AI Calendar</span>
          </Link>
          
          <Button 
            size="lg" 
            className="w-full justify-start gap-3 h-14 text-lg" 
            onClick={async () => {
              try {
                const response = await fetch('/api/notes/create', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: "Untitled",
                    content: {},
                    isFavorite: false,
                    isArchived: false,
                  }),
                })
                const newNote = await response.json()
                if (newNote?.id) {
                  window.location.href = `/pages/${newNote.id}`
                }
              } catch (error) {
                console.error("Error creating note:", error)
              }
            }}
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg">Trang mới</span>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1 mb-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-base transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    item.active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-lg">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Private Section - Giống Notion */}
          <div className="space-y-1 mb-4">
            <div className="px-3 py-2 text-base font-semibold text-muted-foreground uppercase">
              Private
            </div>
            <Collapsible
              open={isExpanded("workspace")}
              onOpenChange={(open) => {
                if (open !== isExpanded("workspace")) {
                  togglePage("workspace")
                }
              }}
            >
              <div className="flex items-center group">
                <Link 
                  href="/pages"
                  className={cn(
                    "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-base transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    pathname === "/pages" && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <Folder className="w-6 h-6" />
                  <span className="flex-1 text-left text-lg">Workspace</span>
                </Link>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCreatePage()
                    }}
                    className="p-1.5 hover:bg-sidebar-accent rounded"
                    title="Tạo page mới"
                  >
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 hover:bg-sidebar-accent rounded"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <span>Sort</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem 
                            onClick={() => setSortBy("lastEdited")}
                            className={sortBy === "lastEdited" ? "bg-accent" : ""}
                          >
                            Last edited
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setSortBy("name")}
                            className={sortBy === "name" ? "bg-accent" : ""}
                          >
                            Name
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setSortBy("created")}
                            className={sortBy === "created" ? "bg-accent" : ""}
                          >
                            Created
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <span>Show</span>
                          <span className="ml-auto">{showLimit}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {[10, 20, 30, 50, 100].map((limit) => (
                            <DropdownMenuItem 
                              key={limit}
                              onClick={() => setShowLimit(limit)}
                              className={showLimit === limit ? "bg-accent" : ""}
                            >
                              {limit}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CollapsibleTrigger asChild>
                  <button 
                    className="px-2 py-2 rounded-lg text-base transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <ChevronRight 
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isExpanded("workspace") && "rotate-90"
                      )} 
                    />
                  </button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="ml-2 space-y-0.5 mt-1">
                  {isLoadingNotes ? (
                    <div className="px-3 py-1 text-sm text-muted-foreground">Đang tải...</div>
                  ) : parentNotes.length === 0 ? (
                    <div className="px-3 py-1 text-sm text-muted-foreground">Chưa có pages</div>
                  ) : (
                    parentNotes.map((note) => renderPageItem(note, 0))
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Favorites Section */}
          {notes.some(note => note.isFavorite) && (
            <div className="space-y-1 mb-4">
              <div className="px-3 py-2 text-sm font-semibold text-muted-foreground uppercase">
                Favorites
              </div>
              <div className="ml-6 space-y-0.5">
                {notes
                  .filter(note => note.isFavorite)
                  .map((note) => (
                    <Link
                      key={note.id}
                      href={`/pages/${note.id}`}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded text-base transition-colors",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        pathname === `/pages/${note.id}` && "bg-sidebar-accent text-sidebar-accent-foreground",
                        "text-muted-foreground"
                      )}
                    >
                      {note.icon ? (
                        <span className="text-lg">{note.icon}</span>
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      <span className="truncate flex-1">{note.title}</span>
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-base transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              pathname === "/settings" && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <Settings className="w-4 h-4" />
            <span>Cài đặt</span>
          </Link>
        </div>
      </div>
    </aside>
    </>
  )
}

