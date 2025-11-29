"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import Link from "next/link"

export function AIChatButton() {
  return (
    <Link href="/chat" className="fixed bottom-6 right-6 z-50">
      <Button size="lg" className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all">
        <MessageCircle className="w-6 h-6" />
      </Button>
    </Link>
  )
}
