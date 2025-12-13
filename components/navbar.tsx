"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Building2, LogOut, User, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { DarkModeToggle } from "@/components/dark-mode-toggle"

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { t, i18n } = useTranslation('common')
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en')

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
  ]

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0]

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLang(lng)
    }
    if (i18n.on) {
      i18n.on('languageChanged', handleLanguageChanged)
      return () => {
        i18n.off('languageChanged', handleLanguageChanged)
      }
    }
  }, [i18n])

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage && i18n.changeLanguage(langCode)
    setCurrentLang(langCode)
    localStorage.setItem('language', langCode)
    // Set document direction and language
    document.documentElement.dir = 'ltr'
    document.documentElement.lang = langCode
  }

  const handleLogout = async () => {
    // Start logout (non-blocking) and redirect immediately
    logout().catch(() => {}) // Fire and forget
    
    // Redirect immediately without waiting
    router.push("/")
    // Force a hard reload to clear all state (reduced delay for faster logout)
    setTimeout(() => {
      window.location.href = "/"
    }, 50)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-600 dark:text-red-400"
      case "teller":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      case "customer":
        return "bg-green-500/10 text-green-600 dark:text-green-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary w-10 h-10 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">{t('nav.title')}</h1>
            {user && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(user.role)}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DarkModeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="hidden md:inline">{currentLanguage.flag} {currentLanguage.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={i18n.language === lang.code ? "bg-accent" : ""}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  {t('nav.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}
