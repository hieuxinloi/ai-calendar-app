"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

export type Theme = 
  | "default"
  | "ocean"
  | "sunset"
  | "forest"
  | "purple"
  | "cherry"
  | "midnight"
  | "aurora"
  | "emerald"
  | "rose"

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
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    
    // Remove all theme classes
    root.classList.remove(
      "theme-default",
      "theme-ocean",
      "theme-sunset",
      "theme-forest",
      "theme-purple",
      "theme-cherry",
      "theme-midnight",
      "theme-aurora",
      "theme-emerald",
      "theme-rose"
    )
    
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

  if (!mounted) {
    return <>{children}</>
  }

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

