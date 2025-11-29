"use client"

import { Extension } from "@tiptap/core"
import { ReactRenderer } from "@tiptap/react"
import { Suggestion, SuggestionOptions } from "@tiptap/suggestion"
import tippy from "tippy.js"
import "tippy.js/dist/tippy.css"
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Table as TableIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  Minus,
  CheckSquare,
} from "lucide-react"
import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from "react"
import { cn } from "@/shared/utils/utils"

interface CommandItemProps {
  title: string
  description: string
  icon: React.ReactNode
  onSelect: () => void
  isActive?: boolean
}

const CommandItem = ({ title, description, icon, onSelect, isActive }: CommandItemProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded transition-colors",
        isActive 
          ? "bg-primary/10 text-primary border-l-2 border-primary" 
          : "hover:bg-muted/50 text-foreground"
      )}
      onClick={onSelect}
      onMouseEnter={() => {
        // Prevent hover from interfering with keyboard selection
      }}
    >
      <div className={cn(
        "flex-shrink-0 w-5 h-5 flex items-center justify-center",
        isActive ? "text-primary" : "text-muted-foreground"
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn(
          "font-medium text-sm",
          isActive ? "text-primary" : "text-foreground"
        )}>
          {title}
        </div>
        <div className={cn(
          "text-xs truncate",
          isActive ? "text-primary/70" : "text-muted-foreground"
        )}>
          {description}
        </div>
      </div>
    </div>
  )
}

interface SlashCommandListProps {
  items: Array<{
    title: string
    description: string
    icon: React.ReactNode
    command: (props: { editor: any; range: any }) => void
  }>
  command: (props: { editor: any; range: any; props: any }) => void
  editor: any
  range?: any
  onExit?: () => void
}

const SlashCommandList = forwardRef<any, SlashCommandListProps>(
  ({ items, command, editor, range, onExit }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const itemRefs = useRef<(HTMLDivElement | null)[]>([])

    const selectItem = (index: number) => {
      const item = items[index]
      if (item && editor) {
        try {
          // Use range from props or get from editor selection
          let commandRange = range
          
          if (!commandRange && editor.state?.selection) {
            const selection = editor.state.selection
            commandRange = {
              from: selection.from,
              to: selection.to,
            }
          }
          
          // If still no range, try to get from current position
          if (!commandRange && editor.state) {
            const { $from } = editor.state.selection
            commandRange = {
              from: $from.start(),
              to: $from.end(),
            }
          }
          
          console.log("Executing command:", { 
            item: item.title, 
            range: commandRange,
            hasEditor: !!editor,
            hasCommand: !!command
          })
          
          // Call item command directly - this is more reliable
          console.log("Calling item command directly:", { 
            item: item.title,
            hasCommand: !!item.command,
            range: commandRange
          })
          
          if (item.command) {
            try {
              item.command({ editor, range: commandRange || {} })
              console.log("Item command executed successfully")
            } catch (error) {
              console.error("Error executing item command:", error)
            }
          } else {
            console.warn("Item command is not available")
          }
          
          // Also call the wrapper command if available (for Suggestion extension)
          if (command) {
            console.log("Also calling wrapper command")
            try {
              command({
                editor,
                range: commandRange || {},
                props: item,
              })
            } catch (error) {
              console.error("Error executing wrapper command:", error)
            }
          }
          
          // Close the menu after selecting
          if (onExit) {
            onExit()
          }
        } catch (error) {
          console.error("Error executing command:", error)
        }
      } else {
        console.warn("Cannot select item:", { hasItem: !!item, hasEditor: !!editor })
      }
    }

    const upHandler = () => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length)
    }

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % items.length)
    }

    const enterHandler = () => {
      selectItem(selectedIndex)
    }

    useEffect(() => setSelectedIndex(0), [items])

    // Scroll selected item into view
    useEffect(() => {
      const selectedItem = itemRefs.current[selectedIndex]
      if (selectedItem) {
        selectedItem.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        })
      }
    }, [selectedIndex])

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          event.preventDefault()
          upHandler()
          return true
        }

        if (event.key === "ArrowDown") {
          event.preventDefault()
          downHandler()
          return true
        }

        if (event.key === "Enter") {
          event.preventDefault()
          enterHandler()
          return true
        }

        return false
      },
    }))

    return (
      <div className="z-50 min-w-[280px] max-w-[320px] max-h-[300px] overflow-y-auto rounded-lg border border-border bg-background shadow-lg p-1.5">
        {items.length ? (
          items.map((item, index) => (
            <div
              key={index}
              ref={(el) => {
                itemRefs.current[index] = el
              }}
            >
              <CommandItem
                title={item.title}
                description={item.description}
                icon={item.icon}
                onSelect={() => selectItem(index)}
                isActive={index === selectedIndex}
              />
            </div>
          ))
        ) : (
          <div className="px-3 py-2 text-sm text-muted-foreground">Không tìm thấy</div>
        )}
      </div>
    )
  }
)

SlashCommandList.displayName = "SlashCommandList"

const getSuggestionItems = ({ query, editor }: { query?: string; editor?: any }) => {
  const items = [
    {
      title: "Heading 1",
      description: "Tiêu đề lớn",
      icon: <Heading1 className="w-4 h-4" />,
      command: ({ editor, range }: { editor: any; range: any }) => {
        console.log("Heading 1 command called:", { hasEditor: !!editor, range })
        try {
          if (!editor) {
            console.error("Editor is not available")
            return
          }
          
          // Get current selection to understand the context
          const selection = editor.state.selection
          console.log("Current selection:", {
            from: selection.from,
            to: selection.to,
            empty: selection.empty
          })
          
          if (range && range.from !== undefined && range.to !== undefined) {
            console.log("Deleting range and setting heading:", { from: range.from, to: range.to })
            // Delete the "/" and any text after it, then set heading
            const result = editor.chain()
              .focus()
              .deleteRange({ from: range.from, to: range.to })
              .setHeading({ level: 1 })
              .run()
            console.log("Heading 1 set with range, result:", result)
          } else {
            console.log("Setting heading without range")
            // Just set heading at current position
            const result = editor.chain().focus().setHeading({ level: 1 }).run()
            console.log("Heading 1 set without range, result:", result)
          }
          
          // Verify heading was applied
          const isHeading = editor.isActive('heading', { level: 1 })
          console.log("Is heading 1 active after command:", isHeading)
        } catch (error) {
          console.error("Error setting Heading 1:", error)
        }
      },
    },
    {
      title: "Heading 2",
      description: "Tiêu đề vừa",
      icon: <Heading2 className="w-4 h-4" />,
      command: ({ editor, range }: { editor: any; range: any }) => {
        console.log("Heading 2 command called:", { hasEditor: !!editor, range })
        try {
          if (range && range.from !== undefined && range.to !== undefined) {
            editor.chain().focus().deleteRange({ from: range.from, to: range.to }).setHeading({ level: 2 }).run()
            console.log("Heading 2 set with range")
          } else {
            editor.chain().focus().setHeading({ level: 2 }).run()
            console.log("Heading 2 set without range")
          }
        } catch (error) {
          console.error("Error setting Heading 2:", error)
        }
      },
    },
    {
      title: "Heading 3",
      description: "Tiêu đề nhỏ",
      icon: <Heading3 className="w-4 h-4" />,
      command: ({ editor, range }: { editor: any; range: any }) => {
        console.log("Heading 3 command called:", { hasEditor: !!editor, range })
        try {
          if (range && range.from !== undefined && range.to !== undefined) {
            editor.chain().focus().deleteRange({ from: range.from, to: range.to }).setHeading({ level: 3 }).run()
            console.log("Heading 3 set with range")
          } else {
            editor.chain().focus().setHeading({ level: 3 }).run()
            console.log("Heading 3 set without range")
          }
        } catch (error) {
          console.error("Error setting Heading 3:", error)
        }
      },
    },
    {
      title: "Bullet List",
      description: "Danh sách dấu đầu dòng",
      icon: <List className="w-4 h-4" />,
      command: ({ editor, range }: { editor: any; range: any }) => {
        if (range && range.from !== undefined && range.to !== undefined) {
          editor.chain().focus().deleteRange({ from: range.from, to: range.to }).toggleBulletList().run()
        } else {
          editor.chain().focus().toggleBulletList().run()
        }
      },
    },
    {
      title: "Numbered List",
      description: "Danh sách đánh số",
      icon: <ListOrdered className="w-4 h-4" />,
      command: ({ editor, range }: { editor: any; range: any }) => {
        if (range && range.from !== undefined && range.to !== undefined) {
          editor.chain().focus().deleteRange({ from: range.from, to: range.to }).toggleOrderedList().run()
        } else {
          editor.chain().focus().toggleOrderedList().run()
        }
      },
    },
    {
      title: "To-do List",
      description: "Danh sách công việc",
      icon: <CheckSquare className="w-4 h-4" />,
      command: ({ editor, range }: { editor: any; range: any }) => {
        // StarterKit có TaskList, nhưng nếu không có thì dùng bullet list
        if (range && range.from !== undefined && range.to !== undefined) {
          if (editor.can().toggleTaskList()) {
            editor.chain().focus().deleteRange({ from: range.from, to: range.to }).toggleTaskList().run()
          } else {
            editor.chain().focus().deleteRange({ from: range.from, to: range.to }).toggleBulletList().run()
          }
        } else {
          if (editor.can().toggleTaskList()) {
            editor.chain().focus().toggleTaskList().run()
          } else {
            editor.chain().focus().toggleBulletList().run()
          }
        }
      },
    },
    {
      title: "Quote",
      description: "Trích dẫn",
      icon: <Quote className="w-4 h-4" />,
      command: ({ editor, range }: { editor: any; range: any }) => {
        if (range && range.from !== undefined && range.to !== undefined) {
          editor.chain().focus().deleteRange({ from: range.from, to: range.to }).toggleBlockquote().run()
        } else {
          editor.chain().focus().toggleBlockquote().run()
        }
      },
    },
    {
      title: "Code Block",
      description: "Khối mã",
      icon: <Code className="w-4 h-4" />,
      command: ({ editor, range }: { editor: any; range: any }) => {
        if (range && range.from !== undefined && range.to !== undefined) {
          editor.chain().focus().deleteRange({ from: range.from, to: range.to }).toggleCodeBlock().run()
        } else {
          editor.chain().focus().toggleCodeBlock().run()
        }
      },
    },
    {
      title: "Table",
      description: "Bảng",
      icon: <TableIcon className="w-4 h-4" />,
      command: ({ editor, range }: { editor: any; range: any }) => {
        if (range && range.from !== undefined && range.to !== undefined) {
          editor.chain().focus().deleteRange({ from: range.from, to: range.to }).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        } else {
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      },
    },
    {
      title: "Image",
      description: "Chèn ảnh",
      icon: <ImageIcon className="w-4 h-4" />,
      command: ({ editor, range }: { editor: any; range: any }) => {
        if (range && range.from !== undefined && range.to !== undefined) {
          editor.chain().focus().deleteRange({ from: range.from, to: range.to }).run()
        }
        const url = window.prompt("Nhập URL ảnh:")
        if (url) {
          editor.chain().focus().setImage({ src: url }).run()
        }
      },
    },
    {
      title: "Link",
      description: "Chèn liên kết",
      icon: <LinkIcon className="w-4 h-4" />,
      command: ({ editor, range }: { editor: any; range: any }) => {
        if (range && range.from !== undefined && range.to !== undefined) {
          editor.chain().focus().deleteRange({ from: range.from, to: range.to }).run()
        }
        const url = window.prompt("Nhập URL:")
        if (url) {
          editor.chain().focus().setLink({ href: url }).run()
        }
      },
    },
    {
      title: "Divider",
      description: "Đường phân cách",
      icon: <Minus className="w-4 h-4" />,
      command: ({ editor, range }: { editor: any; range: any }) => {
        if (range && range.from !== undefined && range.to !== undefined) {
          editor.chain().focus().deleteRange({ from: range.from, to: range.to }).setHorizontalRule().run()
        } else {
          editor.chain().focus().setHorizontalRule().run()
        }
      },
    },
    {
      title: "Paragraph",
      description: "Đoạn văn",
      icon: <FileText className="w-4 h-4" />,
      command: ({ editor, range }: { editor: any; range: any }) => {
        if (range && range.from !== undefined && range.to !== undefined) {
          editor.chain().focus().deleteRange({ from: range.from, to: range.to }).setParagraph().run()
        } else {
          editor.chain().focus().setParagraph().run()
        }
      },
    },
    {
      title: "Page",
      description: "Tạo page con",
      icon: <FileText className="w-4 h-4" />,
      command: ({ editor, range }: { editor: any; range: any }) => {
        if (range && range.from !== undefined && range.to !== undefined) {
          editor.chain().focus().deleteRange({ from: range.from, to: range.to }).run()
        }
        // Get current page ID from URL
        const currentPath = window.location.pathname
        const pageIdMatch = currentPath.match(/\/pages\/([^\/]+)/)
        if (pageIdMatch) {
          const parentId = pageIdMatch[1]
          // Create child page
          fetch('/api/notes/create', {
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
          .then(res => res.json())
          .then(newNote => {
            if (newNote?.id && editor) {
              // Use the custom InlinePage command
              try {
                if (editor.chain && typeof editor.chain === 'function') {
                  editor.chain().focus().setInlinePage({ 
                    pageId: newNote.id, 
                    title: "Untitled" 
                  }).run()
                } else {
                  // Fallback to HTML if command not available
                  const pageBlockHTML = `<p class="inline-page-block" data-page-id="${newNote.id}"><a href="/pages/${newNote.id}" target="_blank" rel="noopener noreferrer" class="inline-page-link"><span class="inline-page-icon">📄</span><span class="inline-page-title">Untitled</span></a></p>`
                  setTimeout(() => {
                    try {
                      editor.chain().focus().insertContent(pageBlockHTML).run()
                    } catch (error) {
                      console.error("Error inserting page block:", error)
                    }
                  }, 100)
                }
              } catch (error) {
                console.error("Error inserting inline page:", error)
              }
            }
          })
          .catch(error => {
            console.error("Error creating child page:", error)
          })
        }
      },
    },
  ]

  if (query) {
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
    )
  }

  return items
}

export const SlashCommand = Extension.create<{}, {}>({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: (params: any) => {
          // Safely destructure - don't assume editor exists
          const editor = params?.editor
          const range = params?.range
          const props = params?.props
          
          console.log("Suggestion command callback:", { 
            hasEditor: !!editor, 
            hasRange: !!range, 
            range: range,
            hasProps: !!props,
            itemTitle: props?.title,
            hasCommand: !!props?.command
          })
          
          // The command is already executed in selectItem, so we don't need to execute it again here
          // This callback is just for Suggestion extension's internal handling
          if (props && props.command && editor) {
            // Call the item's command function with editor and range
            try {
              props.command({ editor, range })
              console.log("Suggestion command executed successfully")
            } catch (error) {
              console.error("Error executing suggestion command:", error)
            }
          } else {
            // This is expected - the command is executed in selectItem, not here
            // Only log if we're missing critical info
            if (!editor) {
              console.warn("Cannot execute command: editor is missing")
            }
          }
        },
        items: (props: any) => {
          // Safely handle editor prop - don't destructure if undefined
          const query = props?.query || ""
          const editor = props?.editor
          return getSuggestionItems({ query, editor })
        },
        render: () => {
          let component: ReactRenderer | null = null
          let popup: any
          let editorInstance: any = null
          let currentRange: any = null
          let exitHandler: (() => void) | null = null

          // Helper function to create renderer
          const createRenderer = (props: any) => {
            // Store range for later use
            currentRange = props.range
            
            // Create exit handler to close popup
            exitHandler = () => {
              if (popup && popup[0]) {
                popup[0].hide()
              }
            }
            console.log("createRenderer called", { 
              hasEditorInstance: !!editorInstance,
              hasChain: !!editorInstance?.chain,
              hasClientRect: !!props.clientRect 
            })
            
            if (!editorInstance || !editorInstance.chain) {
              console.warn("Cannot create renderer: editor not ready")
              return
            }
            
            const items = getSuggestionItems({ query: props.query || "", editor: editorInstance })
            console.log("Suggestion items:", items.length)

            try {
              // Create ReactRenderer - ensure editor is fully initialized
              component = new ReactRenderer(SlashCommandList, {
                editor: editorInstance,
                props: {
                  items,
                  command: props.command,
                  editor: editorInstance,
                  range: currentRange, // Pass range to component
                  onExit: exitHandler, // Pass exit handler to close popup
                },
              })
              console.log("ReactRenderer created successfully")
            } catch (error) {
              console.error("Error creating ReactRenderer:", error)
              return
            }

            if (!props.clientRect) {
              console.warn("No clientRect, cannot show popup")
              return
            }

            try {
              if (typeof window === 'undefined') {
                console.warn("Window is undefined, cannot create tippy popup")
                return
              }
              
              if (!tippy || typeof tippy !== 'function') {
                console.error("Tippy is not available or not a function:", typeof tippy)
                return
              }
              
              const tippyInstance = tippy(document.body, {
                getReferenceClientRect: props.clientRect as any,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              })
              popup = Array.isArray(tippyInstance) ? tippyInstance : [tippyInstance]
              console.log("Tippy popup created:", popup)
            } catch (error) {
              console.error("Error creating tippy popup:", error)
            }
          }

          return {
            onStart: (props: any) => {
              console.log("SlashCommand onStart called", { props })
              
              // Safely get editor from props
              if (!props || !props.editor) {
                console.warn("Editor is undefined in slash command onStart")
                return
              }
              
              editorInstance = props.editor
              // Store range from props for later use
              currentRange = props.range
              
              if (!editorInstance) {
                console.warn("Editor instance is null")
                return
              }
              
              // Safely check editor properties
              const hasChain = editorInstance && typeof editorInstance.chain !== 'undefined'
              const hasIsEditable = editorInstance && typeof editorInstance.isEditable !== 'undefined'
              const isEditableValue = hasIsEditable ? editorInstance.isEditable : undefined
              
              console.log("Editor instance:", { 
                hasChain,
                hasIsEditable,
                isEditable: isEditableValue
              })
              
              // Wait for editor to be fully initialized
              if (!hasIsEditable || !hasChain) {
                console.log("Editor not ready, retrying...")
                // Retry after a short delay
                setTimeout(() => {
                  if (props.editor && props.editor.chain && typeof props.editor.isEditable !== 'undefined') {
                    editorInstance = props.editor
                    createRenderer(props)
                  } else {
                    console.warn("Editor still not ready after retry")
                  }
                }, 50)
                return
              }
              
              console.log("Creating renderer...")
              createRenderer(props)
            },

            onUpdate(props: any) {
              if (!component) {
                return
              }
              
              // Update editor instance if provided
              if (props.editor) {
                editorInstance = props.editor
              }
              
              if (!editorInstance) {
                return
              }
              
              // Update range if provided
              if (props.range) {
                currentRange = props.range
                console.log("Range updated in onUpdate:", props.range)
              }
              
              const items = getSuggestionItems({ query: props.query || "", editor: editorInstance })

              try {
                component.updateProps({
                  items,
                  command: props.command,
                  editor: editorInstance,
                  range: props.range || currentRange, // Pass range to component
                })
              } catch (error) {
                console.error("Error updating ReactRenderer:", error)
              }

              if (!props.clientRect) {
                return
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              })
            },

            onKeyDown(props: any) {
              if (props.event.key === "Escape") {
                if (popup && popup[0]) {
                  popup[0].hide()
                }
                return true
              }

              if (component && component.ref) {
                return component.ref.onKeyDown(props)
              }
              return false
            },

            onExit() {
              if (popup && popup[0]) {
                popup[0].destroy()
              }
              if (component) {
                component.destroy()
              }
            },
          }
        },
      } as SuggestionOptions,
    }
  },

  addProseMirrorPlugins() {
    if (typeof window === 'undefined') {
      return []
    }
    try {
      // Ensure Suggestion is a function
      if (typeof Suggestion !== 'function') {
        console.error("Suggestion is not a function:", typeof Suggestion)
        return []
      }
      
      // Get editor from extension storage
      const editor = this.editor
      
      // Don't create plugin if editor is not ready
      if (!editor || typeof editor.isEditable === 'undefined') {
        console.warn("Editor not ready, skipping Suggestion plugin creation")
        return []
      }
      
      // Create suggestion options with editor explicitly passed
      // This ensures editor is always available in all callbacks
      const suggestionOptions = {
        ...this.options.suggestion,
        // Explicitly pass editor to ensure it's available
        editor: editor,
      }
      
      // Create the plugin with editor bound
      const plugin = Suggestion(suggestionOptions)
      
      // Wrap plugin to ensure editor is always available in apply method
      if (plugin && plugin.spec) {
        const originalApply = plugin.spec.apply
        const editorRef = editor // Capture editor reference
        
        plugin.spec.apply = function(tr: any, value: any, oldState: any, newState: any) {
          // Ensure editor is available before applying
          if (!editorRef || typeof editorRef.isEditable === 'undefined') {
            return value
          }
          
          try {
            // Call original apply with editor context
            return originalApply.call(this, tr, value, oldState, newState)
          } catch (error) {
            // If error occurs due to editor being undefined, return value unchanged
            if (error instanceof TypeError && error.message.includes('isEditable')) {
              console.warn("Editor not available in Suggestion plugin apply, skipping")
              return value
            }
            throw error
          }
        }
      }
      
      return [plugin]
    } catch (error) {
      console.error("Error creating Suggestion plugin:", error)
      return []
    }
  },
  
  // Add onCreate to ensure editor is available
  onCreate() {
    // Editor is now available, we can use it
    const editor = this.editor
    if (editor && typeof editor.isEditable !== 'undefined') {
      console.log("SlashCommand extension created with editor")
    }
  },
})

