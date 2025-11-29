import { NextRequest, NextResponse } from "next/server"
import { createNote } from "@/backend/lib/services/notes"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, isFavorite, isArchived, parentId } = body

    const newNote = await createNote({
      userId: "", // Will be set by backend
      title: title || "Untitled",
      content: content || {},
      isFavorite: isFavorite || false,
      isArchived: isArchived || false,
      parentId: parentId || undefined,
    })

    if (!newNote) {
      return NextResponse.json(
        { error: "Failed to create note. Please check if the database table 'pages' exists." },
        { status: 500 }
      )
    }

    return NextResponse.json(newNote)
  } catch (error: any) {
    console.error("Error creating note:", error)
    console.error("Error stack:", error?.stack)
    const errorMessage = error.message || "Internal server error"
    const isTableMissing = errorMessage.includes('relation "public.pages" does not exist') || 
                          errorMessage.includes('Could not find the table') ||
                          errorMessage.includes('schema cache')
    
    return NextResponse.json(
      { 
        error: isTableMissing 
          ? "Bảng 'pages' chưa được tạo trong database. Vui lòng chạy SQL schema."
          : errorMessage,
        details: isTableMissing
          ? "Cách khắc phục:\n1. Mở Supabase Dashboard → SQL Editor\n2. Copy toàn bộ nội dung từ file frontend/NOTES_SCHEMA.sql\n3. Paste và chạy SQL\n4. Refresh trang này"
          : undefined
      },
      { status: 500 }
    )
  }
}

