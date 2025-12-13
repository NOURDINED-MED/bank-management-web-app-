"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Building2, Search, ArrowLeft, MessageCircle, Mail, Phone, HelpCircle } from "lucide-react"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useState } from "react"

const categories = [
  {
    title: "Account Management",
    icon: "👤",
    topics: [
      "How to open an account",
      "Update personal information",
      "Close my account",
      "Verify my identity"
    ]
  },
  {
    title: "Transactions",
    icon: "💸",
    topics: [
      "Make a transfer",
      "Deposit money",
      "Withdraw funds",
      "Transaction limits"
    ]
  },
  {
    title: "Security",
    icon: "🔒",
    topics: [
      "Enable two-factor authentication",
      "Report suspicious activity",
      "Reset my password",
      "Lost or stolen card"
    ]
  },
  {
    title: "Mobile App",
    icon: "📱",
    topics: [
      "Download the app",
      "Login issues",
      "App features",
      "Update the app"
    ]
  }
]

export default function HelpPage() {
  const { theme, setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/landing" className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                BAMS
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <Link href="/landing">
            <Button variant="secondary" className="mb-6 rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-xl opacity-90 mb-8 max-w-2xl">
            Find answers to common questions or contact our support team
          </p>

          {/* Search */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                className="pl-12 h-14 bg-white dark:bg-slate-900 text-foreground rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {categories.map((category, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-all cursor-pointer">
                <CardHeader>
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.topics.map((topic, topicIdx) => (
                      <li key={topicIdx} className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
                        • {topic}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Options */}
          <div className="bg-muted/50 rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-8 text-center">Still Need Help?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Live Chat</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Chat with our support team
                  </p>
                  <Button className="w-full rounded-full">Start Chat</Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Call Us</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    +1 (800) 123-4567
                  </p>
                  <Button variant="outline" className="w-full rounded-full">Call Now</Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Email Us</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    support@bams.com
                  </p>
                  <Button variant="outline" className="w-full rounded-full">Send Email</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

