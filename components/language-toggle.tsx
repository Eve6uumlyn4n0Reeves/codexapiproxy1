"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface LanguageConfig {
  code: "zh" | "en"
  name: string
  displayName: string
}

const languages: LanguageConfig[] = [
  { code: "zh", name: "Chinese", displayName: "中文" },
  { code: "en", name: "English", displayName: "English" },
]

export function LanguageToggle() {
  const [language, setLanguage] = useState<"zh" | "en">("zh")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "zh" | "en"
    if (savedLanguage && ["zh", "en"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }
  }, [])

  const handleLanguageChange = (newLang: "zh" | "en") => {
    setLanguage(newLang)
    localStorage.setItem("language", newLang)
    document.documentElement.lang = newLang

    // 触发语言变更事件
    window.dispatchEvent(new CustomEvent("languageChange", { detail: newLang }))

    console.log("[v0] Language changed to:", newLang)
  }

  const currentLanguage = languages.find((lang) => lang.code === language)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Globe className="h-4 w-4 mr-2" />
          {currentLanguage?.displayName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={language === lang.code ? "bg-accent" : ""}
          >
            {lang.displayName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
