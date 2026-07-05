"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"dark" | "light">("dark")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const match = document.cookie.match(new RegExp('(^| )recolt-theme=([^;]+)'))
    if (match && (match[2] === 'dark' || match[2] === 'light')) {
      setTheme(match[2] as "dark" | "light")
    } else {
      if (document.documentElement.classList.contains('dark')) {
        setTheme("dark")
      } else {
        setTheme("light")
      }
    }
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark")
          setTheme(isDark ? "dark" : "light")
        }
      })
    })
    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    document.cookie = `recolt-theme=${newTheme}; path=/; max-age=31536000`
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  if (!mounted) return <div className="w-9 h-9" />

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center rounded-md p-2 hover:bg-foreground/5 transition-colors relative w-9 h-9"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  )
}
