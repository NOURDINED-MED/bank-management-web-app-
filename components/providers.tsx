"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/lib/auth-context"
import { I18nextProvider } from "react-i18next"
import i18n from "@/lib/i18n"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={false}
      disableTransitionOnChange={false}
      storageKey="bams-theme"
    >
      <I18nextProvider i18n={i18n}>
        <SessionProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </SessionProvider>
      </I18nextProvider>
    </ThemeProvider>
  )
}
