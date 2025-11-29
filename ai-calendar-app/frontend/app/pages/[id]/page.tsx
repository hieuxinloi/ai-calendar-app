"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
import { TipTapEditor, type TipTapEditorRef } from "@/components/tiptap-editor"

export default function NotePage() {
  const params = useParams()
  const router = useRouter()
  const noteId = params.id as string
  
  const [note, setNote] = useState<Note | null>(null)
  const editorRef = useRef<TipTapEditorRef>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState<any>(null)
  const [originalTitle, setOriginalTitle] = useState("")
  const [originalContent, setOriginalContent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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
        let loadedContent = loadedNote.content || null
        
        // Sync inline page block titles with database and remove deleted pages
        // Handle both string (HTML) and object (JSON) formats
        console.log('Content type:', typeof loadedContent)
        console.log('Content value:', loadedContent)
        
        let contentToSync = loadedContent
        if (typeof loadedContent === 'object' && loadedContent !== null) {
          // If content is object, convert to HTML string for processing
          // TipTap can work with JSON, but we need HTML string to use regex
          // For now, skip sync if it's an object - we'll need to handle this differently
          console.log('Content is object format, skipping regex sync')
          console.log('Content object:', JSON.stringify(loadedContent).substring(0, 500))
        } else if (typeof loadedContent === 'string' && loadedContent) {
          contentToSync = loadedContent
          // Log content to debug format
          console.log('Content to sync (first 500 chars):', contentToSync.substring(0, 500))
          console.log('Full content length:', contentToSync.length)
          console.log('Content includes "data-page-id":', contentToSync.includes('data-page-id'))
          console.log('Content includes "inline-page":', contentToSync.includes('inline-page'))
        } else {
          console.log('Content is empty or invalid:', loadedContent)
        }
        
        // Only process if contentToSync is a string
        if (typeof contentToSync === 'string' && contentToSync) {
          // Try multiple regex patterns to find inline page blocks
          // Pattern 1: With data-page-id attribute
          let pageBlockRegex = /<p[^>]*data-page-id="([^"]+)"[^>]*>.*?<span[^>]*class="[^"]*inline-page-title[^"]*">([^<]*)<\/span>.*?<\/p>/gs
          let matches = [...contentToSync.matchAll(pageBlockRegex)]
          
          // Pattern 2: Parse from href="/pages/{id}" in inline-page-link
          if (matches.length === 0) {
            pageBlockRegex = /<a[^>]*href="\/pages\/([^"]+)"[^>]*class="[^"]*inline-page-link[^"]*"[^>]*>.*?<span[^>]*class="[^"]*inline-page-title[^"]*">([^<]*)<\/span>.*?<\/a>/gs
            matches = [...contentToSync.matchAll(pageBlockRegex)]
          }
          
          // Pattern 3: More flexible - find any link to /pages/ with inline-page-title
          if (matches.length === 0) {
            pageBlockRegex = /href="\/pages\/([^"]+)"[^>]*>.*?<span[^>]*class="[^"]*inline-page-title[^"]*">([^<]*)<\/span>/gs
            matches = [...contentToSync.matchAll(pageBlockRegex)]
          }
          
          // Pattern 4: Even more flexible - find /pages/ links near inline-page elements
          if (matches.length === 0) {
            pageBlockRegex = /\/pages\/([^"\/]+).*?inline-page-title[^>]*>([^<]+)</gs
            matches = [...contentToSync.matchAll(pageBlockRegex)]
          }
          
          console.log('Found inline page blocks:', matches.length)
          if (matches.length > 0) {
            console.log('Matches:', matches.map(m => ({ id: m[1], title: m[2] })))
          } else {
            // Log a sample of content to see what format it's in
            const hasInlinePage = contentToSync.includes('inline-page') || contentToSync.includes('/pages/')
            const sample = hasInlinePage 
              ? contentToSync.substring(Math.max(0, contentToSync.indexOf('inline-page') - 100), contentToSync.indexOf('inline-page') + 300)
              : 'No inline-page or /pages/ found in content'
            console.log('Sample content:', sample)
          }
          
          // Fetch titles for all referenced pages and check if they exist
          const pageIdToTitle = new Map<string, string>()
          const deletedPageIds = new Set<string>()
          
          for (const match of matches) {
            const pageId = match[1]
            const currentTitle = match[2]
            
            console.log(`Processing page block: ID=${pageId}, Current Title="${currentTitle}"`)
            
            if (!pageIdToTitle.has(pageId) && !deletedPageIds.has(pageId)) {
              try {
                const childNote = await getNoteById(pageId)
                if (childNote) {
                  console.log(`Page ${pageId} exists with title: "${childNote.title}"`)
                  // Always update title to ensure sync
                  pageIdToTitle.set(pageId, childNote.title)
                } else {
                  console.log(`Page ${pageId} does not exist, marking for deletion`)
                  // Page doesn't exist, mark for deletion
                  deletedPageIds.add(pageId)
                }
              } catch (error) {
                console.error(`Error fetching page ${pageId}:`, error)
                // If error fetching, assume page doesn't exist
                deletedPageIds.add(pageId)
              }
            }
          }
          
          // Update content with correct titles
          if (pageIdToTitle.size > 0) {
            console.log(`Updating ${pageIdToTitle.size} page block titles`)
            for (const [pageId, newTitle] of pageIdToTitle.entries()) {
              // Try multiple patterns to replace title
              // Pattern 1: With data-page-id
              let specificPageRegex = new RegExp(
                `(<p[^>]*data-page-id="${pageId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>.*?<span[^>]*class="[^"]*inline-page-title[^"]*">)([^<]*)(</span>.*?</p>)`,
                'gs'
              )
              if (contentToSync.match(specificPageRegex)) {
                contentToSync = contentToSync.replace(specificPageRegex, (match, prefix, oldTitle, suffix) => {
                  console.log(`Replacing title for page ${pageId}: "${oldTitle}" -> "${newTitle}"`)
                  return prefix + newTitle + suffix
                })
                continue
              }
              
              // Pattern 2: From href="/pages/{id}"
              specificPageRegex = new RegExp(
                `(<a[^>]*href="/pages/${pageId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>.*?<span[^>]*class="[^"]*inline-page-title[^"]*">)([^<]*)(</span>.*?</a>)`,
                'gs'
              )
              if (contentToSync.match(specificPageRegex)) {
                contentToSync = contentToSync.replace(specificPageRegex, (match, prefix, oldTitle, suffix) => {
                  console.log(`Replacing title for page ${pageId}: "${oldTitle}" -> "${newTitle}"`)
                  return prefix + newTitle + suffix
                })
                continue
              }
              
              // Pattern 3: More flexible - find /pages/{id} and replace nearby title
              specificPageRegex = new RegExp(
                `(href="/pages/${pageId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>.*?<span[^>]*class="[^"]*inline-page-title[^"]*">)([^<]*)(</span>)`,
                'gs'
              )
              contentToSync = contentToSync.replace(specificPageRegex, (match, prefix, oldTitle, suffix) => {
                console.log(`Replacing title for page ${pageId}: "${oldTitle}" -> "${newTitle}"`)
                return prefix + newTitle + suffix
              })
            }
          }
          
          // Remove deleted page blocks
          if (deletedPageIds.size > 0) {
            console.log(`Removing ${deletedPageIds.size} deleted page blocks`)
            for (const deletedPageId of deletedPageIds) {
              // Try multiple patterns to remove deleted blocks
              // Pattern 1: With data-page-id
              let deletePageRegex = new RegExp(
                `<p[^>]*data-page-id="${deletedPageId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>.*?<\/p>\\s*`,
                'gs'
              )
              if (contentToSync.match(deletePageRegex)) {
                contentToSync = contentToSync.replace(deletePageRegex, '')
                continue
              }
              
              // Pattern 2: From href="/pages/{id}"
              deletePageRegex = new RegExp(
                `<p[^>]*>.*?<a[^>]*href="/pages/${deletedPageId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*class="[^"]*inline-page-link[^"]*"[^>]*>.*?<\/a>.*?<\/p>\\s*`,
                'gs'
              )
              contentToSync = contentToSync.replace(deletePageRegex, '')
            }
          }
          
          // Update loadedContent with synced version
          loadedContent = contentToSync
          
          // If content was modified (titles updated or pages deleted), save it
          if (pageIdToTitle.size > 0 || deletedPageIds.size > 0) {
            // Update content in database to persist changes
            try {
              const updatedNote = await updateNote(noteId, {
                content: loadedContent,
              })
              if (updatedNote) {
                // Update note state with synced content
                setNote(updatedNote)
                // Update loadedContent to use synced version
                loadedContent = updatedNote.content || loadedContent
              }
            } catch (error) {
              console.error("Error saving synced content:", error)
            }
          }
        }
        
        setTitle(loadedTitle)
        // Set content after sync to ensure TipTapEditor receives updated content
        setContent(loadedContent)
        setOriginalTitle(loadedTitle)
        setOriginalContent(loadedContent)
        setHasChanges(false)
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

  const handleSave = useCallback(async () => {
    if (!note || !hasChanges) return
    
    setIsSaving(true)
    try {
      // If title changed, update inline page blocks in content that reference this page
      let updatedContent = content
      if (title !== originalTitle && content) {
        // Find all inline page blocks with this page's ID and update their title
        const contentStr = typeof content === 'string' ? content : ''
        // Use regex to find and replace title in inline-page-block with matching data-page-id
        // Match: <p class="inline-page-block" data-page-id="xxx">...<span class="inline-page-title">old title</span>...</p>
        const pageBlockRegex = new RegExp(
          `(<p[^>]*class="[^"]*inline-page-block[^"]*"[^>]*data-page-id="${noteId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>.*?<span[^>]*class="[^"]*inline-page-title[^"]*">)([^<]*)(</span>.*?</p>)`,
          'gs'
        )
        updatedContent = contentStr.replace(pageBlockRegex, (match, prefix, oldTitle, suffix) => {
          return prefix + title + suffix
        })
        
        // Also update content state so TipTapEditor will sync
        setContent(updatedContent)
      }
      
      const updated = await updateNote(noteId, {
        title,
        content: updatedContent || "",
      })
      
      if (updated) {
        setNote(updated)
        setOriginalTitle(title)
        setOriginalContent(updatedContent)
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
  }, [note, noteId, title, content, originalTitle, hasChanges])

  // Poll for child page title changes and sync to editor
  useEffect(() => {
    if (!note || !editorRef.current) return
    
    const syncChildPageTitles = async () => {
      const editor = editorRef.current?.getEditor()
      if (!editor) return
      
      // Get all inline page nodes from editor
      const inlinePageNodes: Array<{ pageId: string; pos: number; currentTitle: string }> = []
      editor.state.doc.descendants((node: any, pos: number) => {
        if (node.type.name === 'inlinePage' && node.attrs.pageId) {
          inlinePageNodes.push({
            pageId: node.attrs.pageId,
            pos,
            currentTitle: node.attrs.title || 'Untitled'
          })
        }
      })
      
      if (inlinePageNodes.length === 0) return
      
      // Check if any titles need updating
      for (const { pageId, pos, currentTitle } of inlinePageNodes) {
        try {
          const childNote = await getNoteById(pageId)
          if (childNote && childNote.title !== currentTitle) {
            // Update the node title
            editorRef.current?.updateInlinePageTitle(pageId, childNote.title)
            console.log(`Synced title for page ${pageId}: "${currentTitle}" -> "${childNote.title}"`)
          }
        } catch (error) {
          // Page might be deleted, ignore
        }
      }
    }
    
    // Poll every 3 seconds to check for title changes
    const intervalId = setInterval(syncChildPageTitles, 3000)
    
    return () => clearInterval(intervalId)
  }, [note])

  // Sync: When content changes, check if inline page block titles were edited and update child pages
  useEffect(() => {
    if (!content || typeof content !== 'string' || !note || content === originalContent) return
    
    // Find all inline page blocks
    const pageBlockRegex = /href="\/pages\/([^"]+)"[^>]*>.*?<span[^>]*class="[^"]*inline-page-title[^"]*">([^<]*)<\/span>/gs
    const matches = [...content.matchAll(pageBlockRegex)]
    
    if (matches.length > 0) {
      // Check if any titles were edited (different from database)
      matches.forEach(async (match) => {
        const pageId = match[1]
        const editorTitle = match[2]
        
        try {
          const childNote = await getNoteById(pageId)
          if (childNote && childNote.title !== editorTitle) {
            // Title was edited in editor, update child page
            console.log(`Updating child page ${pageId} title from "${childNote.title}" to "${editorTitle}"`)
            await updateNote(pageId, { title: editorTitle })
            toast.success(`Đã cập nhật tên page con: ${editorTitle}`)
          }
        } catch (error) {
          console.error(`Error updating child page ${pageId}:`, error)
        }
      })
    }
  }, [content, originalContent, note])

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
          <div className="container mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4 overflow-hidden">
            <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 min-w-0">
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

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 flex-shrink-0"
                onClick={handleToggleFavorite}
              >
                <Star 
                  className={`w-6 h-6 ${note.isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} 
                />
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || !hasChanges} 
                className="h-12 px-3 sm:px-6 text-sm sm:text-lg whitespace-nowrap flex-shrink-0"
              >
                <Save className="w-4 h-4 sm:w-6 sm:h-6 mr-1.5 sm:mr-3 flex-shrink-0" />
                <span className="hidden sm:inline">{isSaving ? "Đang lưu..." : hasChanges ? "Lưu" : "Đã lưu"}</span>
                <span className="sm:hidden">{hasChanges ? "Lưu" : "Đã lưu"}</span>
              </Button>
              <Link href="/chat">
                <Button variant="ghost" size="icon" className="h-12 w-12 flex-shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </Button>
              </Link>
              <div className="flex-shrink-0">
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Editor - Notion Style */}
        <div className="w-full overflow-visible">
          <div className="max-w-7xl mx-auto px-28 py-16 overflow-visible">
            {/* Title Input - Notion style */}
            <div className="mb-8 overflow-visible pt-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled"
                className="text-9xl font-bold border-none shadow-none p-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50 rounded-none h-auto leading-[1.1] overflow-visible w-full"
              />
            </div>

            {/* TipTap Editor - Clean Notion style */}
            <div className="mt-2">
              <TipTapEditor
                ref={editorRef}
                key={`editor-${noteId}-${note?.updatedAt}`}
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

