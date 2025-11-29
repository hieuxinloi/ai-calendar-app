"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Moon,
  Sun,
  Menu,
  Sparkles,
  MessageCircle,
} from "lucide-react"
import { CalendarGridEnhanced } from "@/components/calendar-grid-enhanced"
import { Sidebar } from "@/components/sidebar"
import { TaskList } from "@/components/task-list"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { MoodSelector } from "@/components/mood-selector"
import { LunarCalendar } from "@/components/lunar-calendar"
import { UserMenu } from "@/components/auth/user-menu"
import Link from "next/link"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<"day" | "week" | "month">("month")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [moodRefresh, setMoodRefresh] = useState(0)

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ]

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Notion style */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold hidden sm:inline">AI Calendar</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/chat">
              <Button variant="ghost" size="icon">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button size="sm" onClick={() => setIsAddTaskOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Thêm việc</span>
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Calendar Area */}
          <div className="space-y-6">
            {/* Calendar Controls */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate.toLocaleDateString("vi-VN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Hôm nay
                  </Button>
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    <Button
                      variant={view === "day" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setView("day")}
                      className="h-7 px-3"
                    >
                      Ngày
                    </Button>
                    <Button
                      variant={view === "week" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setView("week")}
                      className="h-7 px-3"
                    >
                      Tuần
                    </Button>
                    <Button
                      variant={view === "month" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setView("month")}
                      className="h-7 px-3"
                    >
                      Tháng
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Calendar Grid - Google Calendar style */}
            <CalendarGridEnhanced
              currentDate={currentDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              view={view}
              onTaskClick={(task) => {
                // Có thể mở dialog để edit task
                console.log('Task clicked:', task)
              }}
            />

            {/* Tasks for selected date */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Công việc {selectedDate.toLocaleDateString("vi-VN", { day: "numeric", month: "long" })}
                </h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI gợi ý
                </Badge>
              </div>
              <TaskList date={selectedDate} />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mood Tracker */}
            <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tâm trạng hôm nay</h3>
            <MoodSelector 
              date={selectedDate}
              onMoodSaved={() => setMoodRefresh(prev => prev + 1)}
            />
          </Card>

            {/* Lunar Calendar - Hiển thị thông tin ngày được chọn */}
            <LunarCalendar date={selectedDate} />

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Thống kê tuần này</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Hoàn thành</span>
                    <span className="text-sm font-medium">12/18 việc</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "67%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Thời gian tập trung</span>
                    <span className="text-sm font-medium">8.5 giờ</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: "85%" }} />
                  </div>
                </div>
                <div className="pt-3 border-t border-border">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Clock className="w-4 h-4 mr-2" />
                    Xem báo cáo chi tiết
                  </Button>
                </div>
              </div>
            </Card>

            {/* Upgrade CTA */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <div className="space-y-3">
                <Badge className="bg-primary text-primary-foreground">Pro</Badge>
                <h3 className="font-semibold">Nâng cấp lên Pro</h3>
                <p className="text-sm text-muted-foreground">
                  Mở khóa AI sắp xếp tự động, Pomodoro timer và nhiều tính năng khác
                </p>
                <Link href="/payment?plan=pro" className="w-full">
                  <Button size="sm" className="w-full">
                    Nâng cấp ngay
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog 
        open={isAddTaskOpen} 
        onOpenChange={setIsAddTaskOpen} 
        selectedDate={selectedDate}
        onTaskAdded={() => {
          // Reload page hoặc trigger re-render
          window.location.reload()
        }}
      />
      </div>
    </div>
  )
}