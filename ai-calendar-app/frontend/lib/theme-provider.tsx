"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

export type Theme = 
  | "default"
  | "neon-cyberpunk"
  | "pastel-dream"
  | "minimalist-zen"
  | "ocean-depths"
  | "sunset-paradise"
  | "forest-canopy"
  | "lavender-fields"
  | "midnight-galaxy"
  | "cherry-blossom"
  | "desert-mirage"
  | "arctic-frost"
  | "tropical-paradise"
  | "vintage-paper"
  | "electric-storm"
  | "mint-fresh"
  | "golden-hour"
  | "crystal-palace"
  | "coffee-shop"
  | "neon-noir"
  | "meadow-spring"
  | "steampunk-brass"
  | "aurora-borealis"
  | "candy-shop"
  | "monochrome-elegance"
  | "rainbow-spectrum"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("default")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("app-theme") as Theme
    if (savedTheme) {
      setThemeState(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Apply default theme on initial mount
      applyTheme("default")
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    
    // Remove all theme classes
    const allThemes = [
      "theme-default",
      "theme-neon-cyberpunk",
      "theme-pastel-dream",
      "theme-minimalist-zen",
      "theme-ocean-depths",
      "theme-sunset-paradise",
      "theme-forest-canopy",
      "theme-lavender-fields",
      "theme-midnight-galaxy",
      "theme-cherry-blossom",
      "theme-desert-mirage",
      "theme-arctic-frost",
      "theme-tropical-paradise",
      "theme-vintage-paper",
      "theme-electric-storm",
      "theme-mint-fresh",
      "theme-golden-hour",
      "theme-crystal-palace",
      "theme-coffee-shop",
      "theme-neon-noir",
      "theme-meadow-spring",
      "theme-steampunk-brass",
      "theme-aurora-borealis",
      "theme-candy-shop",
      "theme-monochrome-elegance",
      "theme-rainbow-spectrum"
    ]
    root.classList.remove(...allThemes)
    
    // Add new theme class (only if not default)
    if (newTheme !== "default") {
      root.classList.add(`theme-${newTheme}`)
    }
    
    // Save to localStorage
    localStorage.setItem("app-theme", newTheme)
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    applyTheme(newTheme)
  }

  // Always provide the context, even before mounting
  // This prevents the "useTheme must be used within a ThemeProvider" error
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

