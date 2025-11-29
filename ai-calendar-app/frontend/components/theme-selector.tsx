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
  { id: "default" as const, name: "Mặc định", colors: ["#60a5fa", "#f472b6", "#facc15"] },
  { id: "neon-cyberpunk" as const, name: "Neon Cyberpunk", colors: ["#00F5FF", "#FF00FF", "#00FF41"] },
  { id: "pastel-dream" as const, name: "Pastel Dream", colors: ["#FFB3D9", "#B3D9FF", "#D9B3FF"] },
  { id: "minimalist-zen" as const, name: "Minimalist Zen", colors: ["#2C3E50", "#E8E8E8", "#95A5A6"] },
  { id: "ocean-depths" as const, name: "Ocean Depths", colors: ["#006994", "#00CED1", "#20B2AA"] },
  { id: "sunset-paradise" as const, name: "Sunset Paradise", colors: ["#FF6B6B", "#FFA07A", "#FFD93D"] },
  { id: "forest-canopy" as const, name: "Forest Canopy", colors: ["#2D5016", "#6B8E23", "#90EE90"] },
  { id: "lavender-fields" as const, name: "Lavender Fields", colors: ["#9B59B6", "#E8D5FF", "#DDA0DD"] },
  { id: "midnight-galaxy" as const, name: "Midnight Galaxy", colors: ["#6C5CE7", "#A29BFE", "#FD79A8"] },
  { id: "cherry-blossom" as const, name: "Cherry Blossom", colors: ["#FFB7C5", "#FFE4E1", "#FF69B4"] },
  { id: "desert-mirage" as const, name: "Desert Mirage", colors: ["#D2691E", "#F4A460", "#FF8C00"] },
  { id: "arctic-frost" as const, name: "Arctic Frost", colors: ["#87CEEB", "#B0E0E6", "#E0F6FF"] },
  { id: "tropical-paradise" as const, name: "Tropical Paradise", colors: ["#00CED1", "#FFD700", "#FF6347"] },
  { id: "vintage-paper" as const, name: "Vintage Paper", colors: ["#8B4513", "#DEB887", "#CD853F"] },
  { id: "electric-storm" as const, name: "Electric Storm", colors: ["#9400D3", "#00BFFF", "#FF1493"] },
  { id: "mint-fresh" as const, name: "Mint Fresh", colors: ["#00FA9A", "#98FB98", "#00CED1"] },
  { id: "golden-hour" as const, name: "Golden Hour", colors: ["#FFD700", "#FFA500", "#FF8C00"] },
  { id: "crystal-palace" as const, name: "Crystal Palace", colors: ["#E6E6FA", "#F0F8FF", "#B0C4DE"] },
  { id: "coffee-shop" as const, name: "Coffee Shop", colors: ["#6F4E37", "#D2691E", "#8B4513"] },
  { id: "neon-noir" as const, name: "Neon Noir", colors: ["#FF00FF", "#00FFFF", "#FFFF00"] },
  { id: "meadow-spring" as const, name: "Meadow Spring", colors: ["#90EE90", "#98FB98", "#FFB6C1"] },
  { id: "steampunk-brass" as const, name: "Steampunk Brass", colors: ["#CD7F32", "#B87333", "#8B4513"] },
  { id: "aurora-borealis" as const, name: "Aurora Borealis", colors: ["#00CED1", "#9370DB", "#20B2AA"] },
  { id: "candy-shop" as const, name: "Candy Shop", colors: ["#FF69B4", "#FFD700", "#00CED1"] },
  { id: "monochrome-elegance" as const, name: "Monochrome Elegance", colors: ["#000000", "#808080", "#C0C0C0"] },
  { id: "rainbow-spectrum" as const, name: "Rainbow Spectrum", colors: ["#FF0000", "#FF7F00", "#FFFF00"] },
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
      <DropdownMenuContent align="end" className="w-64 sm:w-72 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
        <div className="px-2 py-1.5 text-xs sm:text-sm font-semibold sticky top-0 bg-background z-10 border-b">
          Chọn theme ({themes.length})
        </div>
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="flex -space-x-0.5 sm:-space-x-1 overflow-hidden flex-shrink-0">
              {themeOption.colors.map((color, i) => (
                <div
                  key={i}
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="flex-1 text-xs sm:text-sm truncate">{themeOption.name}</span>
            {theme === themeOption.id && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

