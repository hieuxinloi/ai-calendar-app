import { NextRequest, NextResponse } from "next/server"
import { getNotes, getNoteById } from "@/backend/lib/services/notes"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const parentId = searchParams.get('parentId')

    if (parentId) {
      // Get child pages
      const allNotes = await getNotes()
      const childNotes = allNotes.filter(note => note.parentId === parentId)
      return NextResponse.json(childNotes)
    }

    // Get all notes
    const notes = await getNotes()
    return NextResponse.json(notes)
  } catch (error: any) {
    console.error("Error fetching notes:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

