"use client"

import { Node, mergeAttributes } from "@tiptap/core"

export interface InlinePageOptions {
  HTMLAttributes: Record<string, any>
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    inlinePage: {
      /**
       * Insert an inline page block
       */
      setInlinePage: (options: { pageId: string; title: string }) => ReturnType
    }
  }
}

export const InlinePage = Node.create<InlinePageOptions>({
  name: "inlinePage",

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: "block",

  content: "",

  atom: true,

  addAttributes() {
    return {
      pageId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-page-id"),
        renderHTML: (attributes) => {
          if (!attributes.pageId) {
            return {}
          }
          return {
            "data-page-id": attributes.pageId,
          }
        },
      },
      title: {
        default: null,
        parseHTML: (element) => {
          const titleSpan = element.querySelector(".inline-page-title")
          return titleSpan?.textContent || null
        },
        renderHTML: (attributes) => {
          // Title is rendered in the content, not as an attribute
          return {}
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'p[data-page-id]',
        getAttrs: (element) => {
          if (typeof element === 'string') return false
          const pageId = element.getAttribute('data-page-id')
          return pageId ? { pageId } : false
        },
      },
      {
        tag: 'a[href^="/pages/"]',
        getAttrs: (element) => {
          if (typeof element === 'string') return false
          const href = element.getAttribute('href')
          const match = href?.match(/\/pages\/([^\/]+)/)
          if (match) {
            const pageId = match[1]
            return { pageId }
          }
          return false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const pageId = node.attrs.pageId || HTMLAttributes["data-page-id"]
    const title = node.attrs.title || "Untitled"
    
    return [
      "p",
      mergeAttributes(this.options.HTMLAttributes, {
        class: "inline-page-block",
        "data-page-id": pageId,
      }),
      [
        "a",
        {
          href: `/pages/${pageId}`,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "inline-page-link",
        },
        [
          "span",
          { class: "inline-page-icon" },
          "📄",
        ],
        [
          "span",
          { class: "inline-page-title" },
          title,
        ],
      ],
    ]
  },

  addCommands() {
    return {
      setInlinePage:
        (options: { pageId: string; title: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              pageId: options.pageId,
              title: options.title,
            },
          })
        },
    }
  },
})

