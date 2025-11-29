"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Sparkles, ArrowLeft, Mic, ImageIcon } from "lucide-react"
import Link from "next/link"
import { ChatMessage } from "@/components/chat-message"
import { SuggestedPrompts } from "@/components/suggested-prompts"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Xin chào! Mình là trợ lý AI của bạn. Mình có thể giúp bạn quản lý lịch trình, tìm thời gian rảnh, hoặc gợi ý kế hoạch cho ngày hôm nay. Bạn cần mình giúp gì?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(input),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const getAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes("rảnh") || lowerInput.includes("free")) {
      return "Dựa trên lịch của bạn, bạn có thời gian rảnh vào:\n\n• Hôm nay: 15:00 - 17:30\n• Ngày mai: 10:00 - 12:00, 16:00 - 18:00\n• Thứ 5: Cả ngày rảnh\n\nBạn muốn mình thêm việc gì vào những khung giờ này không?"
    }

    if (lowerInput.includes("hôm nay") || lowerInput.includes("today")) {
      return "Hôm nay bạn có 5 công việc:\n\n✓ Họp team buổi sáng (9:00) - Đã hoàn thành\n• Hoàn thành báo cáo dự án (14:00)\n• Tập gym (18:00)\n• Đọc sách 30 phút (21:00)\n• Chuẩn bị bài thuyết trình\n\nBạn đang làm tốt lắm! Còn 4 việc nữa thôi."
    }

    if (lowerInput.includes("gợi ý") || lowerInput.includes("suggest")) {
      return "Dựa trên thói quen của bạn, mình gợi ý:\n\n🌅 Buổi sáng (7:00-9:00): Tập thể dục, ăn sáng healthy\n💼 Buổi trưa (9:00-12:00): Làm việc quan trọng nhất\n🍽️ Buổi chiều (14:00-17:00): Họp, gặp gỡ, công việc nhóm\n🌙 Buổi tối (19:00-22:00): Thư giãn, học tập, phát triển bản thân\n\nBạn muốn mình tạo lịch chi tiết không?"
    }

    if (lowerInput.includes("năng suất") || lowerInput.includes("productivity")) {
      return "Tuần này bạn đã hoàn thành 67% công việc! 🎉\n\nThống kê:\n• Thời gian tập trung: 8.5 giờ/ngày\n• Công việc hoàn thành: 12/18\n• Tâm trạng trung bình: Vui vẻ 😊\n\nGợi ý cải thiện:\n1. Nghỉ giải lao 5 phút mỗi giờ\n2. Ưu tiên 3 việc quan trọng nhất mỗi ngày\n3. Tắt thông báo khi làm việc quan trọng"
    }

    if (lowerInput.includes("tâm trạng") || lowerInput.includes("mood")) {
      return "Tuần này tâm trạng của bạn khá tích cực! 😊\n\n• Thứ 2: Vui vẻ\n• Thứ 3: Bình thường\n• Thứ 4: Vui vẻ\n• Thứ 5: Hứng khởi\n• Hôm nay: Chưa cập nhật\n\nMình nhận thấy bạn thường vui vẻ hơn vào đầu tuần. Hãy duy trì nhé!"
    }

    return "Mình hiểu rồi! Để mình giúp bạn với điều đó. Bạn có thể cho mình thêm chi tiết không? Hoặc bạn có thể hỏi mình về:\n\n• Lịch trình và thời gian rảnh\n• Gợi ý kế hoạch ngày\n• Thống kê năng suất\n• Phân tích tâm trạng\n• Thêm/sửa công việc"
  }

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Link href="/calendar">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-sm sm:text-base truncate">AI Trợ Lý</h1>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Đang hoạt động</span>
                </div>
              </div>
            </div>
          </div>

          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs flex-shrink-0">
            <Sparkles className="w-3 h-3 mr-1" />
            <span className="hidden xs:inline">AI</span>
          </Badge>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-3xl">
          {messages.length === 1 && (
            <div className="mb-6 sm:mb-8">
              <SuggestedPrompts onPromptClick={handlePromptClick} />
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isTyping && (
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                </div>
                <Card className="p-3 sm:p-4 max-w-[85%] sm:max-w-[80%]">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                  </div>
                </Card>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-3xl">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Hỏi AI về lịch trình..."
                className="pr-16 sm:pr-20 min-h-[44px] sm:min-h-[48px] resize-none text-sm sm:text-base"
              />
              <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 sm:gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                  <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                  <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              size="icon"
              className="h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-2">
            AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
          </p>
        </div>
      </div>
    </div>
  )
}
