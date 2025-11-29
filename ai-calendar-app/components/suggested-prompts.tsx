"use client"

import { cn } from "@/lib/utils"

import { Card } from "@/components/ui/card"
import { Calendar, TrendingUp, Lightbulb, Heart, Clock } from "lucide-react"

interface SuggestedPromptsProps {
  onPromptClick: (prompt: string) => void
}

const prompts = [
  {
    icon: Clock,
    title: "Thời gian rảnh",
    prompt: "Mình rảnh khi nào trong tuần này?",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Calendar,
    title: "Lịch hôm nay",
    prompt: "Hôm nay mình có việc gì?",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Lightbulb,
    title: "Gợi ý kế hoạch",
    prompt: "Gợi ý kế hoạch cho ngày mai",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: TrendingUp,
    title: "Năng suất",
    prompt: "Phân tích năng suất tuần này",
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    icon: Heart,
    title: "Tâm trạng",
    prompt: "Tâm trạng của mình thế nào tuần này?",
    color: "bg-chart-4/10 text-chart-4",
  },
]

export function SuggestedPrompts({ onPromptClick }: SuggestedPromptsProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="text-center space-y-1.5 sm:space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold">Mình có thể giúp gì cho bạn?</h2>
        <p className="text-sm sm:text-base text-muted-foreground px-2">Chọn một gợi ý hoặc hỏi bất cứ điều gì</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {prompts.map((prompt, index) => (
          <Card
            key={index}
            className="p-3.5 sm:p-4 cursor-pointer hover:shadow-md transition-all hover:scale-105 active:scale-95"
            onClick={() => onPromptClick(prompt.prompt)}
          >
            <div className="space-y-2.5 sm:space-y-3">
              <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center", prompt.color)}>
                <prompt.icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-0.5 sm:mb-1 text-sm sm:text-base">{prompt.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{prompt.prompt}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
