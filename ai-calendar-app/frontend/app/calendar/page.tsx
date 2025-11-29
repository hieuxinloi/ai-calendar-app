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
import { ThemeSelector } from "@/components/theme-selector"
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
          <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden flex-shrink-0"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <Link href="/" className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-sm sm:text-base hidden xs:inline truncate">AI Calendar</span>
                </Link>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Link href="/chat" className="hidden sm:block">
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </Link>
                <ThemeSelector />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 sm:h-9 sm:w-9 hidden sm:flex"
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setIsAddTaskOpen(true)}
                  className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Thêm việc</span>
                </Button>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-4 sm:gap-6">
            {/* Main Calendar Area */}
            <div className="space-y-6">
            {/* Calendar Controls */}
            <Card className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="h-8 w-8 sm:h-9 sm:w-9">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-8 w-8 sm:h-9 sm:w-9">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl font-bold truncate">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {selectedDate.toLocaleDateString("vi-VN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" onClick={goToToday} className="h-8 text-xs sm:text-sm flex-1 sm:flex-initial">
                    Hôm nay
                  </Button>
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-muted rounded-lg p-0.5 sm:p-1 flex-1 sm:flex-initial">
                    <Button
                      variant={view === "day" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setView("day")}
                      className="h-7 px-2 sm:px-3 text-xs flex-1 sm:flex-initial"
                    >
                      Ngày
                    </Button>
                    <Button
                      variant={view === "week" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setView("week")}
                      className="h-7 px-2 sm:px-3 text-xs flex-1 sm:flex-initial"
                    >
                      Tuần
                    </Button>
                    <Button
                      variant={view === "month" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setView("month")}
                      className="h-7 px-2 sm:px-3 text-xs flex-1 sm:flex-initial"
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
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                <h3 className="text-base sm:text-lg font-semibold truncate">
                  Công việc {selectedDate.toLocaleDateString("vi-VN", { day: "numeric", month: "long" })}
                </h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary flex-shrink-0 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">AI gợi ý</span>
                </Badge>
              </div>
              <TaskList date={selectedDate} />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Mood Tracker */}
            <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Tâm trạng hôm nay</h3>
            <MoodSelector 
              date={selectedDate}
              onMoodSaved={() => setMoodRefresh(prev => prev + 1)}
            />
          </Card>

            {/* Lunar Calendar - Hiển thị thông tin ngày được chọn */}
            <LunarCalendar date={selectedDate} />

            {/* Quick Stats */}
            <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Thống kê tuần này</h3>
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
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <div className="space-y-2 sm:space-y-3">
                <Badge className="bg-primary text-primary-foreground text-xs">Pro</Badge>
                <h3 className="font-semibold text-sm sm:text-base">Nâng cấp lên Pro</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Mở khóa AI sắp xếp tự động, Pomodoro timer và nhiều tính năng khác
                </p>
                <Link href="/payment?plan=pro" className="w-full">
                  <Button size="sm" className="w-full text-xs sm:text-sm h-8 sm:h-9">
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