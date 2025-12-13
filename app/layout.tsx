import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BAMS - Banking Application Management System",
  description: "Secure banking platform for customers, tellers, and administrators",
  icons: {
    icon: [
      { url: "/bank-logo.png", type: "image/png" },
      { url: "/bank-logo.svg", type: "image/svg+xml" },
      { url: "/bank-logo.jpg", type: "image/jpeg" },
    ],
    shortcut: "/icon.svg",
    apple: "/bank-logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
