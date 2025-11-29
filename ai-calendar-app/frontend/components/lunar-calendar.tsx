"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LunarCalendarProps {
  date: Date
}

interface LunarDate {
  lunarDay: number
  lunarMonth: number
  canChi: string
  auspiciousHours: string
  goodDay: string
}

interface LunarAPIResponse {
  data: {
    day: number
    month: number
    year: number
    heavenlyStems: string
    earthlyBranches: string
    sexagenaryCycle: string
  }
  code: string
}

// Sử dụng API open.oapi.vn để lấy lịch âm chính xác
async function getLunarDateFromAPI(date: Date): Promise<LunarDate | null> {
  try {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    const response = await fetch('https://open.oapi.vn/date/convert-to-lunar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        day,
        month,
        year,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const result: LunarAPIResponse = await response.json()
    
    if (result.code === 'success' && result.data) {
      // Giờ hoàng đạo (tạm thời, có thể lấy từ API khác nếu có)
      const auspiciousHours = [
        "7h-9h, 13h-15h",
        "8h-10h, 14h-16h",
        "9h-11h, 15h-17h",
        "6h-8h, 12h-14h",
        "10h-12h, 16h-18h"
      ]
      const hoursIndex = day % auspiciousHours.length
      
      // Ngày tốt (tạm thời, có thể lấy từ API khác nếu có)
      const goodDays = [
        "Khai trương, ký hợp đồng",
        "Cưới hỏi, động thổ",
        "Xuất hành, mua sắm",
        "Khai trương, nhập trạch",
        "Cưới hỏi, khai trương"
      ]
      const goodDayIndex = day % goodDays.length
      
      return {
        lunarDay: result.data.day,
        lunarMonth: result.data.month,
        canChi: result.data.sexagenaryCycle || `${result.data.heavenlyStems} ${result.data.earthlyBranches}`,
        auspiciousHours: auspiciousHours[hoursIndex],
        goodDay: goodDays[goodDayIndex],
      }
    }
  } catch (error) {
    console.error('Error fetching lunar date from API:', error)
  }
  
  return null
}

export function LunarCalendar({ date }: LunarCalendarProps) {
  const [lunar, setLunar] = useState<LunarDate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    setIsLoading(true)
    setError(null)
    
    getLunarDateFromAPI(date)
      .then(apiLunar => {
        if (apiLunar) {
          setLunar(apiLunar)
        } else {
          setError('Không thể lấy thông tin lịch âm')
        }
      })
      .catch((err) => {
        console.error('Error loading lunar date:', err)
        setError('Lỗi khi tải lịch âm')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [date])
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Lịch Âm</h3>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Đang tải...</div>
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : lunar ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ngày âm lịch</span>
            <span className="font-medium">
              {lunar.lunarDay} tháng {lunar.lunarMonth}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Can Chi</span>
            <span className="font-medium">{lunar.canChi}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Giờ hoàng đạo</span>
            <span className="font-medium">{lunar.auspiciousHours}</span>
          </div>
          <div className="pt-3 border-t border-border">
            <Badge variant="secondary" className="bg-secondary/10 text-secondary">
              Ngày tốt: {lunar.goodDay}
            </Badge>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Không có dữ liệu</div>
      )}
    </Card>
  )
}

