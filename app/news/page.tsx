"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  Moon,
  Sun,
  TrendingUp,
  Shield,
  Smartphone,
  Award,
  Users,
  Globe
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function NewsPage() {
  const { theme, setTheme } = useTheme()

  const featuredNews = {
    title: "BAMS Launches Revolutionary Digital Banking Platform",
    excerpt: "Experience the future of banking with our new AI-powered platform designed to simplify your financial life",
    category: "Product Launch",
    date: "November 25, 2025",
    readTime: "5 min read",
    image: "🚀"
  }

  const newsArticles = [
    {
      title: "BAMS Recognized as Best Digital Bank 2025",
      excerpt: "Industry leaders award BAMS for innovation in mobile banking and customer service excellence",
      category: "Awards",
      date: "November 20, 2025",
      readTime: "3 min read",
      icon: Award,
      color: "from-yellow-500 to-orange-600"
    },
    {
      title: "New Security Features Protect Your Accounts",
      excerpt: "Advanced biometric authentication and AI-powered fraud detection now available to all customers",
      category: "Security",
      date: "November 15, 2025",
      readTime: "4 min read",
      icon: Shield,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "BAMS Expands to 50 New Countries",
      excerpt: "Global expansion brings our innovative banking services to millions of new customers worldwide",
      category: "Expansion",
      date: "November 10, 2025",
      readTime: "6 min read",
      icon: Globe,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Mobile App Update Brings New Features",
      excerpt: "Enhanced user interface and new features make banking easier than ever on your smartphone",
      category: "Technology",
      date: "November 5, 2025",
      readTime: "3 min read",
      icon: Smartphone,
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "BAMS Reaches 2 Million Customer Milestone",
      excerpt: "Thank you to our growing community for trusting us with your financial journey",
      category: "Company",
      date: "November 1, 2025",
      readTime: "4 min read",
      icon: Users,
      color: "from-red-500 to-pink-600"
    },
    {
      title: "Q3 2025 Financial Results Exceed Expectations",
      excerpt: "Strong growth across all segments demonstrates continued customer confidence",
      category: "Financial",
      date: "October 28, 2025",
      readTime: "7 min read",
      icon: TrendingUp,
      color: "from-cyan-500 to-blue-600"
    }
  ]

  const categories = [
    "All News",
    "Product Launch",
    "Awards",
    "Security",
    "Technology",
    "Company",
    "Financial"
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/landing" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-primary to-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                BAMS
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Link href="/login">
                <Button className="rounded-full">
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              News & Updates
              <span className="block text-primary mt-2">Stay Informed</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get the latest news, updates, and insights from BAMS
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All News" ? "default" : "outline"}
                size="sm"
                className="rounded-full whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden hover:shadow-xl transition-all border-2">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              <div className="flex items-center justify-center text-9xl">
                {featuredNews.image}
              </div>
              <div className="flex flex-col justify-center">
                <Badge className="w-fit mb-4">{featuredNews.category}</Badge>
                <h2 className="text-3xl font-bold mb-4">{featuredNews.title}</h2>
                <p className="text-muted-foreground mb-6">{featuredNews.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {featuredNews.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {featuredNews.readTime}
                  </div>
                </div>
                <Button className="w-fit rounded-full">
                  Read Full Story
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Latest News</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.map((article, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-all group cursor-pointer">
                <div className={`w-14 h-14 bg-gradient-to-br ${article.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <article.icon className="w-7 h-7 text-white" />
                </div>
                <Badge variant="outline" className="mb-3">
                  {article.category}
                </Badge>
                <h3 className="text-xl font-bold mb-3 line-clamp-2">{article.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {article.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </div>
                </div>
                <Button variant="link" className="p-0 h-auto group-hover:gap-2 transition-all">
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="p-12 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Subscribe to our newsletter and get the latest news and updates delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border bg-background"
              />
              <Button className="rounded-xl px-8">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Join BAMS?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Experience the future of banking with our innovative solutions
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="rounded-full h-14 px-8">
              Open Account Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

