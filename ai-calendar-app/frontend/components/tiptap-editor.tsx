"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { TextStyle } from "@tiptap/extension-text-style"
import { FontFamily } from "@tiptap/extension-font-family"
import { Color } from "@tiptap/extension-color"
import { TextAlign } from "@tiptap/extension-text-align"
import { Image } from "@tiptap/extension-image"
import { Link } from "@tiptap/extension-link"
import { SlashCommand } from "./slash-command"
import { useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table as TableIcon,
  Undo,
  Redo,
  Plus,
  Minus,
} from "lucide-react"

interface TipTapEditorProps {
  initialContent?: any
  onChange?: (content: any) => void
  editable?: boolean
}

export function TipTapEditor({ 
  initialContent, 
  onChange,
  editable = true 
}: TipTapEditorProps) {
  // Parse initial content
  const parsedContent = useMemo(() => {
    if (!initialContent) return ""
    
    try {
      // If it's already HTML string
      if (typeof initialContent === 'string') {
        return initialContent
      }
      
      // If it's JSON format, convert to HTML
      if (typeof initialContent === 'object') {
        // For now, just return empty and let TipTap handle it
        return ""
      }
      
      return ""
    } catch {
      return ""
    }
  }, [initialContent])

  // Debounce onChange to avoid too many updates
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastContentRef = useRef<string>("")

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        // Disable default heading để customize
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      // Re-enable extensions one by one to find the problematic one
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'tiptap-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
        },
      }),
      SlashCommand,
    ],
    content: parsedContent,
    editable,
    onUpdate: (params: any) => {
      // Safely get editor from params - don't destructure if undefined
      const editorInstance = params?.editor
      if (!editorInstance || !onChange) {
        return
      }
      
      try {
        const html = editorInstance.getHTML()
        
        // Only trigger onChange if content actually changed
        if (html !== lastContentRef.current) {
          lastContentRef.current = html
          
          // Clear previous timeout
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current)
          }
          
          // Debounce onChange call (500ms delay)
          debounceTimeoutRef.current = setTimeout(() => {
            onChange(html)
          }, 500)
        }
      } catch (error) {
        console.error("Error in onUpdate:", error)
      }
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none',
        'data-placeholder': 'Nhấn "/" để chèn block...',
      },
    },
  })

  // Inject heading styles to ensure they're applied
  useEffect(() => {
    const styleId = 'tiptap-heading-styles'
    if (document.getElementById(styleId)) {
      return // Already injected
    }
    
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .tiptap-content h1,
      .tiptap-content .ProseMirror h1,
      .ProseMirror h1,
      .tiptap-editor h1 {
        font-size: 2rem !important;
        font-weight: 700 !important;
        margin: 1rem 0 !important;
        line-height: 1.2 !important;
        color: var(--foreground) !important;
      }
      .tiptap-content h2,
      .tiptap-content .ProseMirror h2,
      .ProseMirror h2,
      .tiptap-editor h2 {
        font-size: 1.5rem !important;
        font-weight: 600 !important;
        margin: 0.875rem 0 !important;
        line-height: 1.3 !important;
        color: var(--foreground) !important;
      }
      .tiptap-content h3,
      .tiptap-content .ProseMirror h3,
      .ProseMirror h3,
      .tiptap-editor h3 {
        font-size: 1.25rem !important;
        font-weight: 600 !important;
        margin: 0.75rem 0 !important;
        line-height: 1.4 !important;
        color: var(--foreground) !important;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Only update content if editor is fully initialized
    if (!editor) {
      return
    }
    
    // Use a small delay to ensure editor is fully ready
    const timeoutId = setTimeout(() => {
      // Check if editor is fully ready - ensure isEditable exists
      if (!editor || typeof editor.isEditable === 'undefined' || !editor.commands) {
        return
      }
      
      // Check if editor has required methods
      if (typeof editor.getHTML !== 'function' || typeof editor.commands.setContent !== 'function') {
        return
      }
      
      if (parsedContent) {
        try {
          const currentContent = editor.getHTML()
          if (currentContent !== parsedContent) {
            // Ensure editor is still valid before calling setContent
            if (editor && editor.commands && typeof editor.isEditable !== 'undefined') {
              editor.commands.setContent(parsedContent)
            }
          }
        } catch (error) {
          console.error("Error setting content:", error)
        }
      }
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [parsedContent, editor])

  if (!editor) {
    return <div className="p-4 text-muted-foreground">Đang tải editor...</div>
  }

  const addImage = () => {
    const url = window.prompt('Nhập URL ảnh:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    const url = window.prompt('Nhập URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const addTableRow = () => {
    editor.chain().focus().addRowAfter().run()
  }

  const deleteTableRow = () => {
    editor.chain().focus().deleteRow().run()
  }

  const addTableColumn = () => {
    editor.chain().focus().addColumnAfter().run()
  }

  const deleteTableColumn = () => {
    editor.chain().focus().deleteColumn().run()
  }

  const setFontSize = (size: string) => {
    // TipTap không có font size extension, dùng CSS inline style
    editor.chain().focus().setMark('textStyle', { fontSize: size }).run()
  }

  const setFontFamily = (font: string) => {
    editor.chain().focus().setFontFamily(font).run()
  }

  return (
    <div className="tiptap-wrapper">
      {/* Toolbar - Hidden by default, show on selection */}
      {editable && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30 hidden">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              data-active={editor.isActive('bold')}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              data-active={editor.isActive('italic')}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              data-active={editor.isActive('underline')}
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              data-active={editor.isActive('strike')}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              data-active={editor.isActive('heading', { level: 1 })}
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              data-active={editor.isActive('heading', { level: 2 })}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              data-active={editor.isActive('heading', { level: 3 })}
            >
              <Heading3 className="h-4 w-4" />
            </Button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              data-active={editor.isActive('bulletList')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              data-active={editor.isActive('orderedList')}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              data-active={editor.isActive('blockquote')}
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              data-active={editor.isActive('codeBlock')}
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              data-active={editor.isActive({ textAlign: 'left' })}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              data-active={editor.isActive({ textAlign: 'center' })}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              data-active={editor.isActive({ textAlign: 'right' })}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Font Controls */}
          <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
            <Select
              value={editor.getAttributes('textStyle').fontSize || '14px'}
              onValueChange={setFontSize}
            >
              <SelectTrigger className="h-8 w-20 text-xs">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12px">12px</SelectItem>
                <SelectItem value="14px">14px</SelectItem>
                <SelectItem value="16px">16px</SelectItem>
                <SelectItem value="18px">18px</SelectItem>
                <SelectItem value="20px">20px</SelectItem>
                <SelectItem value="24px">24px</SelectItem>
                <SelectItem value="32px">32px</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
              onValueChange={setFontFamily}
            >
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Insert */}
          <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={addLink}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={addImage}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={addTable}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Table Controls */}
          {editor.isActive('table') && (
            <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={addTableRow}
                title="Thêm hàng"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={deleteTableRow}
                title="Xóa hàng"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={addTableColumn}
                title="Thêm cột"
              >
                <Plus className="h-4 w-4 rotate-90" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={deleteTableColumn}
                title="Xóa cột"
              >
                <Minus className="h-4 w-4 rotate-90" />
              </Button>
            </div>
          )}

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Editor Content - Notion style clean */}
      <div className="tiptap-content min-h-[400px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

