"use client"

import { Card } from "@/components/ui/card"
import { Sparkles, User } from "lucide-react"
import { cn } from "@/shared/utils/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex items-start gap-2 sm:gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          isUser ? "bg-muted" : "bg-gradient-to-br from-primary to-secondary",
        )}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn("flex flex-col gap-1 max-w-[85%] sm:max-w-[80%]", isUser && "items-end")}>
        <Card className={cn("p-3 sm:p-4", isUser && "bg-primary text-primary-foreground")}>
          <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{message.content}</div>
        </Card>
        <span className="text-[10px] sm:text-xs text-muted-foreground px-1">
          {message.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  )
}
