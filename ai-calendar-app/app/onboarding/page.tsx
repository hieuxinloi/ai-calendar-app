"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, title: "Chào mừng", description: "Bắt đầu hành trình của bạn" },
  { id: 2, title: "Thông tin", description: "Giới thiệu về bạn" },
  { id: 3, title: "Mục tiêu", description: "Bạn muốn đạt được gì" },
  { id: 4, title: "Thói quen", description: "Thời gian làm việc" },
  { id: 5, title: "Hoàn tất", description: "Sẵn sàng bắt đầu" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    goals: [] as string[],
    workTime: "",
    notifications: true,
  })

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding
      router.push("/calendar")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal) ? prev.goals.filter((g) => g !== goal) : [...prev.goals, goal],
    }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 2:
        return formData.name && formData.role
      case 3:
        return formData.goals.length > 0
      case 4:
        return formData.workTime
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-all text-xs sm:text-base",
                    currentStep > step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.id
                        ? "bg-primary text-primary-foreground ring-2 sm:ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 rounded-full transition-all",
                      currentStep > step.id ? "bg-primary" : "bg-muted",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Bước {currentStep} / {steps.length}
            </p>
          </div>
        </div>

        {/* Content Card */}
        <Card className="p-6 sm:p-8 md:p-12">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="text-center space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
                  Chào mừng đến với AI Calendar
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground text-pretty px-2">
                  Lịch thông minh giúp bạn quản lý thời gian hiệu quả hơn với sức mạnh của AI
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2 sm:pt-4">
                <div className="p-3 sm:p-4 rounded-lg bg-primary/5">
                  <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🎯</div>
                  <p className="text-xs sm:text-sm font-medium">Quản lý công việc</p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-secondary/5">
                  <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🤖</div>
                  <p className="text-xs sm:text-sm font-medium">AI trợ lý thông minh</p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-accent/5">
                  <div className="text-xl sm:text-2xl mb-1 sm:mb-2">📊</div>
                  <p className="text-xs sm:text-sm font-medium">Theo dõi năng suất</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {currentStep === 2 && (
            <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Giới thiệu về bạn</h2>
                <p className="text-sm sm:text-base text-muted-foreground px-2">
                  Giúp chúng tôi hiểu bạn hơn để cá nhân hóa trải nghiệm
                </p>
              </div>

              <div className="space-y-4 pt-2 sm:pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm sm:text-base">
                    Tên của bạn
                  </Label>
                  <Input
                    id="name"
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="text-base sm:text-lg h-11 sm:h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm sm:text-base">Bạn là</Label>
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(value: string) => setFormData({ ...formData, role: value })}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student" className="flex-1 cursor-pointer">
                        <div className="font-medium text-sm sm:text-base">Sinh viên</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Quản lý học tập và hoạt động</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="employee" id="employee" />
                      <Label htmlFor="employee" className="flex-1 cursor-pointer">
                        <div className="font-medium text-sm sm:text-base">Nhân viên văn phòng</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Quản lý công việc và dự án</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="freelancer" id="freelancer" />
                      <Label htmlFor="freelancer" className="flex-1 cursor-pointer">
                        <div className="font-medium text-sm sm:text-base">Freelancer</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Quản lý nhiều dự án linh hoạt</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="flex-1 cursor-pointer">
                        <div className="font-medium text-sm sm:text-base">Khác</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Sử dụng cho mục đích cá nhân</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {currentStep === 3 && (
            <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Mục tiêu của bạn</h2>
                <p className="text-sm sm:text-base text-muted-foreground px-2">
                  Chọn những gì bạn muốn cải thiện (chọn nhiều)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2 sm:pt-4">
                {[
                  { id: "productivity", icon: "⚡", title: "Tăng năng suất", desc: "Làm việc hiệu quả hơn" },
                  { id: "organization", icon: "📋", title: "Tổ chức tốt hơn", desc: "Quản lý công việc ngăn nắp" },
                  { id: "balance", icon: "⚖️", title: "Cân bằng cuộc sống", desc: "Work-life balance" },
                  { id: "health", icon: "💪", title: "Sức khỏe", desc: "Tập thể dục, ăn uống" },
                  { id: "learning", icon: "📚", title: "Học tập", desc: "Phát triển kỹ năng mới" },
                  { id: "habits", icon: "🎯", title: "Xây dựng thói quen", desc: "Thói quen tích cực" },
                ].map((goal) => (
                  <div
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all cursor-pointer",
                      formData.goals.includes(goal.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox checked={formData.goals.includes(goal.id)} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{goal.icon}</span>
                          <span className="font-medium">{goal.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{goal.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Work Time */}
          {currentStep === 4 && (
            <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Thời gian làm việc</h2>
                <p className="text-sm sm:text-base text-muted-foreground px-2">
                  Khi nào bạn thường làm việc hiệu quả nhất?
                </p>
              </div>

              <div className="space-y-2.5 sm:space-y-3 pt-2 sm:pt-4">
                <RadioGroup
                  value={formData.workTime}
                  onValueChange={(value: string) => setFormData({ ...formData, workTime: value })}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="morning" id="morning" />
                    <Label htmlFor="morning" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl">🌅</span>
                        <div>
                          <div className="font-medium text-sm sm:text-base">Buổi sáng (6:00 - 12:00)</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            Tôi làm việc tốt nhất vào buổi sáng
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="afternoon" id="afternoon" />
                    <Label htmlFor="afternoon" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl">☀️</span>
                        <div>
                          <div className="font-medium text-sm sm:text-base">Buổi chiều (12:00 - 18:00)</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            Tôi năng suất nhất vào buổi chiều
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="evening" id="evening" />
                    <Label htmlFor="evening" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl">🌙</span>
                        <div>
                          <div className="font-medium text-sm sm:text-base">Buổi tối (18:00 - 24:00)</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Tôi tập trung tốt vào buổi tối</div>
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="flexible" id="flexible" />
                    <Label htmlFor="flexible" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl">🔄</span>
                        <div>
                          <div className="font-medium text-sm sm:text-base">Linh hoạt</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            Thời gian làm việc của tôi thay đổi
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="flex items-center space-x-2 p-3 sm:p-4 rounded-lg bg-muted/50 mt-4 sm:mt-6">
                  <Checkbox
                    id="notifications"
                    checked={formData.notifications}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({ ...formData, notifications: checked })
                    }
                  />
                  <Label htmlFor="notifications" className="cursor-pointer">
                    <div className="font-medium text-sm sm:text-base">Nhận thông báo nhắc nhở</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      AI sẽ nhắc bạn về công việc quan trọng
                    </div>
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Complete */}
          {currentStep === 5 && (
            <div className="text-center space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">Mọi thứ đã sẵn sàng!</h2>
                <p className="text-base sm:text-lg text-muted-foreground text-pretty px-2">
                  AI Calendar đã được cá nhân hóa cho bạn. Hãy bắt đầu quản lý thời gian thông minh hơn.
                </p>
              </div>

              <Card className="p-4 sm:p-6 bg-muted/50 text-left">
                <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Thông tin của bạn:</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tên:</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vai trò:</span>
                    <span className="font-medium capitalize">{formData.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mục tiêu:</span>
                    <span className="font-medium">{formData.goals.length} mục tiêu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thời gian làm việc:</span>
                    <span className="font-medium capitalize">{formData.workTime}</span>
                  </div>
                </div>
              </Card>

              <div className="pt-2 sm:pt-4">
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Bạn sẽ nhận được:</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="p-2.5 sm:p-3 rounded-lg bg-primary/5">
                    <div className="text-lg sm:text-xl mb-0.5 sm:mb-1">🎁</div>
                    <p className="text-[10px] sm:text-xs font-medium">7 ngày dùng thử Pro</p>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-lg bg-secondary/5">
                    <div className="text-lg sm:text-xl mb-0.5 sm:mb-1">🏆</div>
                    <p className="text-[10px] sm:text-xs font-medium">Thành tựu đầu tiên</p>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-lg bg-accent/5">
                    <div className="text-lg sm:text-xl mb-0.5 sm:mb-1">✨</div>
                    <p className="text-[10px] sm:text-xs font-medium">AI cá nhân hóa</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 sm:gap-4 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-border">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="bg-transparent text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Quay lại
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
            >
              {currentStep === steps.length ? (
                <>
                  Bắt đầu
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                </>
              ) : (
                <>
                  Tiếp tục
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Skip Button */}
        {currentStep < steps.length && (
          <div className="text-center mt-3 sm:mt-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/calendar")}
              className="text-muted-foreground text-xs sm:text-sm h-8 sm:h-9"
            >
              Bỏ qua hướng dẫn
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}