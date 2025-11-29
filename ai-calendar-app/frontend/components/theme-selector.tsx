"use client"

import { useTheme } from "@/lib/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Palette, Check } from "lucide-react"
import { cn } from "@/shared/utils/utils"

const themes = [
  { id: "default" as const, name: "Mặc định", color: "bg-gradient-to-br from-blue-400 to-pink-400" },
  { id: "ocean" as const, name: "Đại dương", color: "bg-gradient-to-br from-cyan-400 to-blue-500" },
  { id: "sunset" as const, name: "Hoàng hôn", color: "bg-gradient-to-br from-orange-400 to-pink-500" },
  { id: "forest" as const, name: "Rừng xanh", color: "bg-gradient-to-br from-green-400 to-emerald-500" },
  { id: "purple" as const, name: "Tím mơ", color: "bg-gradient-to-br from-purple-400 to-indigo-500" },
  { id: "cherry" as const, name: "Anh đào", color: "bg-gradient-to-br from-pink-400 to-rose-500" },
  { id: "midnight" as const, name: "Nửa đêm", color: "bg-gradient-to-br from-slate-700 to-slate-900" },
  { id: "aurora" as const, name: "Cực quang", color: "bg-gradient-to-br from-teal-400 to-cyan-500" },
  { id: "emerald" as const, name: "Ngọc lục", color: "bg-gradient-to-br from-emerald-400 to-green-500" },
  { id: "rose" as const, name: "Hoa hồng", color: "bg-gradient-to-br from-rose-400 to-pink-500" },
]

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="w-4 h-4" />
          <span className="sr-only">Chọn theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold">Chọn theme</div>
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className={cn(
              "w-4 h-4 rounded-full border-2 border-border",
              themeOption.color
            )} />
            <span className="flex-1">{themeOption.name}</span>
            {theme === themeOption.id && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

