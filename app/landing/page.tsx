"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Menu, 
  X, 
  Moon, 
  Sun,
  MessageCircle,
  MapPin,
  Gift,
  Calendar,
  Shield,
  Zap,
  Users,
  TrendingUp,
  CreditCard,
  PiggyBank,
  ArrowRight,
  Lock,
  Smartphone,
  Globe,
  Clock,
  Award,
  CheckCircle,
  Star,
  Download,
  QrCode,
  ChevronDown,
  BarChart3,
  Wallet,
  DollarSign,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  FileText,
  AlertCircle
} from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslation } from "react-i18next"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"

// Mock data
const features = [
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Advanced 256-bit encryption and multi-factor authentication keep your money safe 24/7"
  },
  {
    icon: Zap,
    title: "Instant Transfers",
    description: "Send money in seconds to anyone, anywhere with zero fees on most transactions"
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Full-featured mobile apps for iOS and Android with biometric authentication"
  },
  {
    icon: TrendingUp,
    title: "Smart Insights",
    description: "AI-powered analytics help you understand spending and grow your wealth"
  },
  {
    icon: Users,
    title: "24/7 Support",
    description: "Expert human support available anytime via chat, phone, or email"
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Bank from anywhere with support for 40+ currencies and international transfers"
  }
]

const products = [
  {
    title: "Personal Banking",
    description: "Checking, savings, and investment accounts with competitive rates",
    icon: Wallet,
    features: ["No monthly fees", "High-yield savings", "Free debit card", "Cashback rewards"],
    color: "from-blue-500 to-indigo-600"
  },
  {
    title: "Business Banking",
    description: "Everything your business needs to manage finances and grow",
    icon: Building2,
    features: ["Business checking", "Merchant services", "Payroll solutions", "Business loans"],
    color: "from-green-500 to-emerald-600"
  },
  {
    title: "Investments",
    description: "Build wealth with our comprehensive investment platform",
    icon: TrendingUp,
    features: ["Stocks & ETFs", "Retirement accounts", "Expert advisors", "Low fees"],
    color: "from-purple-500 to-pink-600"
  }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    avatar: "SJ",
    rating: 5,
    quote: "BAMS has transformed how I manage my business finances. The mobile app is incredibly intuitive and the support team is always there when I need them."
  },
  {
    name: "Michael Chen",
    role: "Freelance Designer",
    avatar: "MC",
    rating: 5,
    quote: "I love the instant transfers and the savings account interest rates are the best I've found. Switching to BAMS was the best financial decision I made."
  },
  {
    name: "Emma Williams",
    role: "Marketing Director",
    avatar: "EW",
    rating: 5,
    quote: "The investment platform is easy to use and the financial insights help me make smarter decisions. Plus, the security features give me complete peace of mind."
  }
]

const newsArticles = [
  {
    title: "BAMS Launches AI-Powered Financial Assistant",
    excerpt: "New feature helps customers make smarter financial decisions with personalized insights",
    date: "Nov 20, 2025",
    category: "Product",
    image: "🤖"
  },
  {
    title: "Expanded Global Reach to 50 New Markets",
    excerpt: "BAMS now serves customers in over 150 countries with localized support",
    date: "Nov 15, 2025",
    category: "Expansion",
    image: "🌍"
  },
  {
    title: "Industry-Leading Security Certification Achieved",
    excerpt: "BAMS receives ISO 27001 certification for information security management",
    date: "Nov 10, 2025",
    category: "Security",
    image: "🔒"
  }
]

const faqs = [
  {
    question: "How do I open an account?",
    answer: "Opening an account is simple! Click 'Open Account' and follow the guided process. You'll need a government-issued ID and proof of address. Most accounts are approved within 24 hours."
  },
  {
    question: "Are my deposits insured?",
    answer: "Yes! All deposits are FDIC insured up to $250,000 per depositor. Your money is protected by the full faith and credit of the U.S. government."
  },
  {
    question: "What fees does BAMS charge?",
    answer: "We believe in transparent pricing. Most accounts have no monthly fees, no minimum balance requirements, and no fees for standard transfers. Check our fee schedule for specific services."
  },
  {
    question: "How secure is mobile banking?",
    answer: "We use bank-level 256-bit encryption, biometric authentication, and real-time fraud detection. You can also enable two-factor authentication for additional security."
  },
  {
    question: "Can I access my account internationally?",
    answer: "Absolutely! Access your account from anywhere in the world. We support international transfers and 40+ currencies with competitive exchange rates."
  }
]

const pricingPlans = [
  {
    name: "Basic",
    price: "$0",
    period: "/month",
    description: "Perfect for getting started with digital banking",
    features: [
      "Free checking account",
      "1 free ATM withdrawal/month",
      "Mobile & web banking",
      "Debit card included",
      "1% cashback",
      "Email support",
      "Basic budgeting tools",
      "Standard security"
    ],
    popular: false,
    cta: "Get Started"
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/month",
    description: "Advanced features for power users",
    features: [
      "Everything in Basic",
      "Unlimited ATM withdrawals",
      "3% cashback on all purchases",
      "Priority 24/7 support",
      "Advanced analytics",
      "Investment tools",
      "Savings goals tracker",
      "Multi-currency accounts",
      "No foreign transaction fees"
    ],
    popular: true,
    cta: "Start Free Trial"
  },
  {
    name: "Business",
    price: "$29.99",
    period: "/month",
    description: "Complete solution for growing businesses",
    features: [
      "Everything in Premium",
      "5% cashback for business",
      "Unlimited team members",
      "Payroll integration",
      "Invoice management",
      "Expense tracking",
      "API access",
      "Dedicated account manager",
      "Business credit line",
      "Accounting software integration"
    ],
    popular: false,
    cta: "Contact Sales"
  }
]

const exchangeRates = [
  { from: "USD", to: "EUR", rate: 0.92, change: "+0.12%" },
  { from: "USD", to: "GBP", rate: 0.79, change: "-0.08%" },
  { from: "USD", to: "JPY", rate: 149.50, change: "+0.24%" },
  { from: "USD", to: "CAD", rate: 1.35, change: "-0.05%" },
  { from: "USD", to: "AUD", rate: 1.52, change: "+0.18%" }
]

const partners = [
  { name: "VISA", icon: "💳" },
  { name: "Mastercard", icon: "💳" },
  { name: "Apple Pay", icon: "" },
  { name: "Google Pay", icon: "🔷" },
  { name: "PayPal", icon: "🅿️" },
  { name: "FDIC Insured", icon: "🏛️" }
]

const awards = [
  { title: "Best Mobile Banking App", year: "2025" },
  { title: "Top Customer Service", year: "2024" },
  { title: "Most Innovative Fintech", year: "2024" }
]

// Components
function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <Card className="p-6 hover:shadow-lg transition-all border-2 hover:border-primary/50 group">
      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </Card>
  )
}

function ProductCard({ title, description, icon: Icon, features, color }: any) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div 
      className="perspective-1000 h-80"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front */}
        <Card className={`absolute inset-0 backface-hidden bg-gradient-to-br ${color} text-white border-0`}>
          <CardContent className="p-8 flex flex-col justify-between h-full">
            <div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{title}</h3>
              <p className="text-white/90">{description}</p>
            </div>
            <p className="text-sm text-white/70">Hover to see features →</p>
          </CardContent>
        </Card>

        {/* Back */}
        <Card className="absolute inset-0 backface-hidden rotate-y-180 border-2">
          <CardContent className="p-8 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-4">Key Features</h3>
              <ul className="space-y-3">
                {features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/login">
              <Button className="w-full rounded-full">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TestimonialCard({ name, role, avatar, rating, quote }: any) {
  return (
    <Card className="p-6 h-full hover:shadow-xl transition-all">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold">
          {avatar}
        </div>
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
      <div className="flex gap-1 mb-3">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-muted-foreground italic">"{quote}"</p>
    </Card>
  )
}

function DashboardPreview() {
  return (
    <Card className="overflow-hidden border-2 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <CardTitle>Your Dashboard Preview</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold text-green-600">$45,280</p>
              </div>
              <Wallet className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-blue-600">+$3,420</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-4 bg-purple-50 dark:bg-purple-950/20 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Savings Goal</p>
                <p className="text-2xl font-bold text-purple-600">78%</p>
              </div>
              <PiggyBank className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Simple Chart Mockup */}
        <div className="bg-muted/30 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium mb-3">Spending Overview</p>
          <div className="flex items-end gap-2 h-32">
            <div className="flex-1 bg-primary/60 rounded-t" style={{height: '45%'}}></div>
            <div className="flex-1 bg-primary/70 rounded-t" style={{height: '65%'}}></div>
            <div className="flex-1 bg-primary/80 rounded-t" style={{height: '55%'}}></div>
            <div className="flex-1 bg-primary rounded-t" style={{height: '85%'}}></div>
            <div className="flex-1 bg-primary/70 rounded-t" style={{height: '70%'}}></div>
            <div className="flex-1 bg-primary/60 rounded-t" style={{height: '50%'}}></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <p className="text-sm font-medium mb-3">Recent Transactions</p>
          <div className="space-y-2">
            {[
              { name: "Coffee Shop", amount: "-$4.50", type: "expense" },
              { name: "Salary Deposit", amount: "+$3,200", type: "income" },
              { name: "Grocery Store", amount: "-$85.20", type: "expense" }
            ].map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'income' ? 'bg-green-100 dark:bg-green-950/30' : 'bg-red-100 dark:bg-red-950/30'
                  }`}>
                    <DollarSign className={`w-4 h-4 ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <span className="text-sm">{tx.name}</span>
                </div>
                <span className={`font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="overflow-hidden">
      <button
        className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="font-semibold pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-muted-foreground animate-in slide-in-from-top">
          {answer}
        </div>
      )}
    </Card>
  )
}

function NewsCard({ title, excerpt, date, category, image }: any) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all group cursor-pointer">
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center text-6xl">
        {image}
      </div>
      <CardContent className="p-6">
        <Badge className="mb-3">{category}</Badge>
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{excerpt}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{date}</span>
          <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
        </div>
      </CardContent>
    </Card>
  )
}

function CountUpAnimation({ end, duration = 2000, suffix = "" }: { end: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let startTime: number | null = null
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / duration, 1)
            setCount(Math.floor(progress * end))
            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [end, duration, hasAnimated])

  return <span ref={ref}>{count}{suffix}</span>
}

function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(50000)
  const [interestRate, setInterestRate] = useState(5.5)
  const [loanTerm, setLoanTerm] = useState(5)

  const calculateEMI = () => {
    const principal = loanAmount
    const rate = interestRate / 12 / 100
    const time = loanTerm * 12
    const emi = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1)
    return emi.toFixed(2)
  }

  const totalPayment = (parseFloat(calculateEMI()) * loanTerm * 12).toFixed(2)
  const totalInterest = (parseFloat(totalPayment) - loanAmount).toFixed(2)

  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl">Loan Calculator</CardTitle>
        <p className="text-sm text-muted-foreground">Calculate your monthly EMI and total interest</p>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="space-y-6">
          {/* Loan Amount */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Loan Amount</label>
              <span className="text-sm font-bold text-primary">${loanAmount.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="500000"
              step="5000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>$5K</span>
              <span>$500K</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Interest Rate (Annual)</label>
              <span className="text-sm font-bold text-primary">{interestRate}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1%</span>
              <span>20%</span>
            </div>
          </div>

          {/* Loan Term */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Loan Term</label>
              <span className="text-sm font-bold text-primary">{loanTerm} years</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={loanTerm}
              onChange={(e) => setLoanTerm(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1 year</span>
              <span>30 years</span>
            </div>
          </div>

          {/* Results */}
          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-6 space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Monthly EMI</span>
              <span className="text-2xl font-bold text-primary">${calculateEMI()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Payment</span>
              <span className="text-lg font-semibold">${parseFloat(totalPayment).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Interest</span>
              <span className="text-lg font-semibold text-orange-600">${parseFloat(totalInterest).toLocaleString()}</span>
            </div>
          </div>

          <Link href="/login">
            <Button className="w-full rounded-full" size="lg">
              Apply for Loan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cookieConsent, setCookieConsent] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const { theme, setTheme } = useTheme()
  const { t, ready } = useTranslation('common')

  useEffect(() => {
    setMounted(true)

    // Show sticky bar after scrolling 50%
    const handleScroll = () => {
      const scrolled = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollPercentage = scrolled / (documentHeight - windowHeight)
      
      setShowStickyBar(scrollPercentage > 0.5)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null
  }

  const navItems = [
    { name: "Home", href: "/landing" },
    { name: "Personal", href: "/personal" },
    { name: "Business", href: "/business" },
    { name: "News", href: "/news" },
    { name: "Contact", href: "/contact" }
  ]

  const floatingActions = [
    { icon: MessageCircle, label: "Chat", color: "bg-blue-600 hover:bg-blue-700" },
    { icon: MapPin, label: "Locations", color: "bg-green-600 hover:bg-green-700" },
    { icon: Gift, label: "Offers", color: "bg-orange-600 hover:bg-orange-700" },
    { icon: Calendar, label: "Appointments", color: "bg-purple-600 hover:bg-purple-700" }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/landing" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-primary to-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                BAMS
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>

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

              <Link href="/login">
                <Button className="hidden md:flex items-center gap-2 rounded-full shadow-lg hover:shadow-xl transition-all">
                  {t('landing.openAccount')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t animate-in slide-in-from-top">
              <div className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link href="/login">
                  <Button className="w-full mt-2" onClick={() => setMobileMenuOpen(false)}>
                    {t('landing.openAccount')}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{t('landing.trustedBy')}</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  {t('landing.title')}
                  <span className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    {t('landing.titleHighlight')}
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  {t('landing.subtitle')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto rounded-full text-base h-14 px-8 shadow-lg hover:shadow-xl transition-all">
                    {t('landing.getStarted')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full text-base h-14 px-8">
                  {t('landing.learnMore')}
                </Button>
              </div>

              {/* Stats with Count-up Animation */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t">
                <div>
                  <p className="text-3xl font-bold text-primary">
                    <CountUpAnimation end={2} suffix="M+" />
                  </p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">
                    <CountUpAnimation end={50} suffix="B+" />
                  </p>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">
                    <CountUpAnimation end={150} suffix="+" />
                  </p>
                  <p className="text-sm text-muted-foreground">Countries</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators & Partners */}
      <section className="py-12 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-8">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Trusted By Over 2 Million Customers Worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {partners.map((partner, idx) => (
                <div key={idx} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <span className="text-3xl">{partner.icon}</span>
                  <span className="font-semibold text-lg">{partner.name}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {awards.map((award, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium">
                    {award.title} {award.year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Exchange Rates */}
      <section className="py-8 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-semibold">Live Exchange Rates</span>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              {exchangeRates.map((rate, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {rate.from}/{rate.to}:
                  </span>
                  <span className="text-sm font-bold text-primary">{rate.rate}</span>
                  <span className={`text-xs ${rate.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {rate.change}
                  </span>
                </div>
              ))}
              <span className="text-xs text-muted-foreground">Updated 2m ago</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('landing.whyChoose')}</h2>
            <p className="text-lg text-muted-foreground">
              {t('landing.whyChooseSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Product Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('landing.ourServices')}</h2>
            <p className="text-lg text-muted-foreground">
              {t('landing.ourServicesSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of satisfied customers who trust BAMS
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Promo */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-12 p-12">
              <div className="text-white">
                <Badge className="bg-white/20 text-white border-0 mb-4">New Release</Badge>
                <h2 className="text-4xl font-bold mb-4">Bank Anywhere with Our Mobile App</h2>
                <p className="text-white/90 mb-8">
                  Experience the full power of BAMS in your pocket. Manage accounts, transfer money, deposit checks, and more with our award-winning mobile apps.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    "Instant account access with Face ID",
                    "Mobile check deposit",
                    "Real-time notifications",
                    "Budgeting tools & insights"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button size="lg" variant="secondary" className="rounded-full">
                    <Download className="w-5 h-5 mr-2" />
                    Download for iOS
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary">
                    <Download className="w-5 h-5 mr-2" />
                    Download for Android
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-xl">
                    <QrCode className="w-16 h-16 text-primary" />
                  </div>
                  <p className="text-sm text-white/80">Scan to download</p>
                </div>
              </div>

              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  {/* Screenshot 1 - Dashboard */}
                  <div className="aspect-[9/16] bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl border-4 border-slate-800 p-4 shadow-2xl overflow-hidden">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center text-xs mb-4 text-slate-600 dark:text-slate-400">
                      <span className="font-medium">9:41</span>
                      <div className="flex gap-1 items-center">
                        <div className="w-4 h-3 border border-current rounded-sm"></div>
                        <div className="w-2 h-3 bg-current rounded-sm"></div>
                      </div>
                    </div>

                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Welcome back,</h3>
                      <p className="text-lg font-bold text-primary">John Smith</p>
                    </div>

                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-4 mb-4 text-white shadow-lg">
                      <p className="text-xs opacity-90 mb-1">Total Balance</p>
                      <p className="text-2xl font-bold mb-3">$47,285.00</p>
                      <div className="flex justify-between text-xs">
                        <div>
                          <p className="opacity-80">Income</p>
                          <p className="font-semibold">+$5,420</p>
                        </div>
                        <div className="text-right">
                          <p className="opacity-80">Expenses</p>
                          <p className="font-semibold">-$2,180</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { icon: "↗", label: "Send", color: "bg-blue-500" },
                        { icon: "↙", label: "Request", color: "bg-green-500" },
                        { icon: "⟳", label: "Bills", color: "bg-purple-500" }
                      ].map((action, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <div className={`${action.color} w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow`}>
                            {action.icon}
                          </div>
                          <span className="text-[9px] text-slate-600 dark:text-slate-400">{action.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Recent Transactions */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Recent Activity</h4>
                      <div className="space-y-2">
                        {[
                          { name: "Netflix", amount: "-$12.99", icon: "▶", color: "bg-red-500" },
                          { name: "Salary", amount: "+$3,500", icon: "💰", color: "bg-green-500" }
                        ].map((txn, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-2">
                            <div className={`${txn.color} w-8 h-8 rounded-lg flex items-center justify-center text-sm`}>
                              {txn.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-800 dark:text-white truncate">{txn.name}</p>
                              <p className="text-[9px] text-slate-500">Today</p>
                            </div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">{txn.amount}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Screenshot 2 - Transactions */}
                  <div className="aspect-[9/16] bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl border-4 border-slate-800 p-4 shadow-2xl overflow-hidden">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center text-xs mb-4 text-slate-600 dark:text-slate-400">
                      <span className="font-medium">9:41</span>
                      <div className="flex gap-1 items-center">
                        <div className="w-4 h-3 border border-current rounded-sm"></div>
                        <div className="w-2 h-3 bg-current rounded-sm"></div>
                      </div>
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-slate-800 dark:text-white">Transactions</h3>
                      <button className="text-xs text-primary font-medium">Filter</button>
                    </div>

                    {/* Date Tabs */}
                    <div className="flex gap-2 mb-4 overflow-x-auto">
                      {["Today", "Week", "Month", "Year"].map((tab, idx) => (
                        <button
                          key={idx}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                            idx === 0
                              ? "bg-primary text-white"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* Transaction List */}
                    <div className="space-y-2">
                      {[
                        { name: "Amazon.com", category: "Shopping", amount: "-$156.00", time: "10:24 AM", icon: "🛒", color: "bg-orange-500" },
                        { name: "Starbucks", category: "Food & Drink", amount: "-$8.50", time: "08:15 AM", icon: "☕", color: "bg-green-600" },
                        { name: "Uber", category: "Transport", amount: "-$24.30", time: "Yesterday", icon: "🚗", color: "bg-black" },
                        { name: "Payroll Deposit", category: "Income", amount: "+$3,500.00", time: "2 days ago", icon: "💼", color: "bg-blue-600" },
                        { name: "Netflix", category: "Entertainment", amount: "-$12.99", time: "3 days ago", icon: "▶", color: "bg-red-600" },
                        { name: "Electricity Bill", category: "Utilities", amount: "-$89.00", time: "4 days ago", icon: "⚡", color: "bg-yellow-500" }
                      ].map((txn, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-3">
                          <div className={`${txn.color} w-10 h-10 rounded-xl flex items-center justify-center text-white shadow`}>
                            {txn.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{txn.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{txn.category} • {txn.time}</p>
                          </div>
                          <p className={`text-xs font-bold ${txn.amount.startsWith('+') ? 'text-green-600' : 'text-slate-800 dark:text-white'}`}>
                            {txn.amount}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Screenshot 3 - Cards */}
                  <div className="aspect-[9/16] bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl border-4 border-slate-800 p-4 shadow-2xl overflow-hidden">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center text-xs mb-4 text-slate-600 dark:text-slate-400">
                      <span className="font-medium">9:41</span>
                      <div className="flex gap-1 items-center">
                        <div className="w-4 h-3 border border-current rounded-sm"></div>
                        <div className="w-2 h-3 bg-current rounded-sm"></div>
                      </div>
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-slate-800 dark:text-white">My Cards</h3>
                      <button className="text-primary text-xl font-bold">+</button>
                    </div>

                    {/* Card Display */}
                    <div className="mb-4 relative h-44">
                      {/* Main Card */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-2xl p-4 text-white shadow-xl">
                        <div className="flex justify-between items-start mb-8">
                          <div className="w-10 h-7 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded opacity-90"></div>
                          <span className="text-xs font-medium">VISA</span>
                        </div>
                        <div className="space-y-3">
                          <p className="text-base font-mono tracking-wider">****  ****  ****  8742</p>
                          <div className="flex justify-between text-xs">
                            <div>
                              <p className="opacity-70 text-[9px]">CARD HOLDER</p>
                              <p className="font-semibold">JOHN SMITH</p>
                            </div>
                            <div className="text-right">
                              <p className="opacity-70 text-[9px]">EXPIRES</p>
                              <p className="font-semibold">12/26</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Second Card (Peek) */}
                      <div className="absolute right-0 top-2 w-16 h-40 bg-gradient-to-br from-slate-700 to-slate-900 rounded-r-2xl shadow-lg"></div>
                    </div>

                    {/* Card Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: "Balance", value: "$12,450" },
                        { label: "Limit", value: "$25,000" },
                        { label: "Spent", value: "$8,340" }
                      ].map((stat, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-2 text-center">
                          <p className="text-[9px] text-slate-500 mb-1">{stat.label}</p>
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Card Actions */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Quick Actions</h4>
                      {[
                        { icon: "🔒", label: "Lock Card", color: "text-red-600" },
                        { icon: "📋", label: "View Details", color: "text-blue-600" },
                        { icon: "⚙", label: "Card Settings", color: "text-slate-600" }
                      ].map((action, idx) => (
                        <button key={idx} className="w-full bg-white dark:bg-slate-800 rounded-xl p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                          <span className="text-lg">{action.icon}</span>
                          <span className={`text-xs font-medium ${action.color} dark:text-white`}>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Screenshot 4 - Profile */}
                  <div className="aspect-[9/16] bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl border-4 border-slate-800 p-4 shadow-2xl overflow-hidden">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center text-xs mb-4 text-slate-600 dark:text-slate-400">
                      <span className="font-medium">9:41</span>
                      <div className="flex gap-1 items-center">
                        <div className="w-4 h-3 border border-current rounded-sm"></div>
                        <div className="w-2 h-3 bg-current rounded-sm"></div>
                      </div>
                    </div>

                    {/* Profile Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        JS
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-slate-800 dark:text-white">John Smith</h3>
                        <p className="text-xs text-slate-500">john.smith@email.com</p>
                        <p className="text-[10px] text-primary font-medium mt-0.5">Premium Member</p>
                      </div>
                      <button className="text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {[
                        { label: "Accounts", value: "3", icon: "🏦", color: "from-blue-500 to-cyan-500" },
                        { label: "Cards", value: "2", icon: "💳", color: "from-purple-500 to-pink-500" },
                        { label: "Transactions", value: "847", icon: "📊", color: "from-green-500 to-emerald-500" },
                        { label: "Savings", value: "$45K", icon: "💰", color: "from-orange-500 to-red-500" }
                      ].map((stat, idx) => (
                        <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-3 text-white shadow-lg`}>
                          <div className="text-2xl mb-1">{stat.icon}</div>
                          <p className="text-xs opacity-90">{stat.label}</p>
                          <p className="text-lg font-bold">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-1">
                      {[
                        { icon: "👤", label: "Personal Information", color: "text-blue-600" },
                        { icon: "🔔", label: "Notifications", badge: "3", color: "text-purple-600" },
                        { icon: "🔒", label: "Security & Privacy", color: "text-green-600" },
                        { icon: "💬", label: "Help & Support", color: "text-orange-600" },
                        { icon: "⚙", label: "Settings", color: "text-slate-600" }
                      ].map((item, idx) => (
                        <button key={idx} className="w-full bg-white dark:bg-slate-800 rounded-xl p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                          <span className="text-xl">{item.icon}</span>
                          <span className={`text-xs font-medium ${item.color} dark:text-white flex-1 text-left`}>{item.label}</span>
                          {item.badge && (
                            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
                          )}
                          <span className="text-slate-400 text-xs">›</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-lg text-muted-foreground">
              Simple, transparent pricing that grows with you. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <Card key={idx} className={`relative p-8 ${plan.popular ? 'border-primary border-2 shadow-xl scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="px-0 pt-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="px-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/login">
                    <Button 
                      className={`w-full rounded-full ${plan.popular ? '' : 'variant-outline'}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            All plans include 24/7 customer support and 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Your Security is Our Priority</h2>
            <p className="text-lg text-muted-foreground">
              Industry-leading security and compliance standards protect your money 24/7
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Lock, title: "256-bit Encryption", description: "Military-grade encryption protects all data" },
              { icon: Shield, title: "Fraud Detection", description: "AI-powered monitoring catches suspicious activity" },
              { icon: Award, title: "FDIC Insured", description: "Deposits insured up to $250,000" },
              { icon: CheckCircle, title: "ISO Certified", description: "ISO 27001 security certification" }
            ].map((item, idx) => (
              <Card key={idx} className="p-6 text-center">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8">
            {["FDIC", "SSL", "ISO 27001", "PCI DSS"].map((badge) => (
              <div key={badge} className="w-24 h-24 bg-background border-2 rounded-lg flex items-center justify-center font-bold text-sm">
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about BAMS
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* Loan Calculator */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Calculate Your Loan</h2>
            <p className="text-lg text-muted-foreground">
              Plan your finances with our interactive loan calculator
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <LoanCalculator />
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Latest News & Updates</h2>
            <p className="text-lg text-muted-foreground">
              Stay informed with the latest from BAMS
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {newsArticles.map((article, index) => (
              <NewsCard key={index} {...article} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/news">
              <Button variant="outline" size="lg" className="rounded-full">
                View All News
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Mail className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-4xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl mb-8 opacity-90">
              Get exclusive financial tips, product updates, and special offers delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button 
                size="lg" 
                variant="secondary" 
                className="rounded-full px-8 whitespace-nowrap"
              >
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <p className="text-sm mt-4 opacity-80">
              Join 50,000+ subscribers. Unsubscribe anytime.
            </p>
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Weekly tips</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Exclusive offers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">No spam</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/90 to-blue-600/90 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">{t('landing.readyToStart')}</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {t('landing.readyToStartSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto rounded-full text-base h-14 px-8 shadow-lg hover:shadow-xl">
                {t('landing.openAccountNow')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full text-base h-14 px-8 border-white text-white hover:bg-white hover:text-primary">
              {t('landing.contactUs')}
            </Button>
          </div>
        </div>
      </section>

      {/* Floating Action Buttons */}
      <div className="fixed right-6 bottom-24 z-40 flex flex-col gap-3">
        {floatingActions.map((action, index) => (
          <button
            key={index}
            className={`${action.color} text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group relative`}
            title={action.label}
            aria-label={action.label}
          >
            <action.icon className="w-6 h-6" />
            <span className="absolute right-16 bg-background text-foreground px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Cookie Consent Bar */}
      {cookieConsent && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-2xl">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                  By clicking "Accept All", you consent to our use of cookies.{" "}
                  <Link href="#privacy" className="text-primary hover:underline font-medium">
                    Learn more
                  </Link>
                </p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setCookieConsent(false)}
                  className="flex-1 md:flex-none"
                >
                  Refuse
                </Button>
                <Button
                  onClick={() => setCookieConsent(false)}
                  className="flex-1 md:flex-none"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-primary to-blue-600 w-10 h-10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">BAMS</span>
              </div>
              <p className="text-sm mb-6 max-w-sm">
                Your trusted partner for comprehensive banking solutions. Serving millions of customers worldwide with secure, innovative financial services.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: Facebook, href: "#" },
                  { icon: Twitter, href: "#" },
                  { icon: Instagram, href: "#" },
                  { icon: Linkedin, href: "#" }
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    className="w-10 h-10 bg-slate-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors"
                    aria-label="Social media link"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-white font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/personal" className="hover:text-primary transition-colors">
                    Personal Banking
                  </Link>
                </li>
                <li>
                  <Link href="/business" className="hover:text-primary transition-colors">
                    Business Banking
                  </Link>
                </li>
                <li>
                  <Link href="/personal" className="hover:text-primary transition-colors">
                    Credit Cards
                  </Link>
                </li>
                <li>
                  <Link href="/personal" className="hover:text-primary transition-colors">
                    Loans
                  </Link>
                </li>
                <li>
                  <Link href="/personal" className="hover:text-primary transition-colors">
                    Investments
                  </Link>
                </li>
                <li>
                  <Link href="/personal" className="hover:text-primary transition-colors">
                    Insurance
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-primary transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="hover:text-primary transition-colors">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors">
                    Partners
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors">
                    Investors
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support & Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/help" className="hover:text-primary transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-primary transition-colors">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-primary transition-colors">
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="border-t border-slate-800 pt-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium mb-1">Phone</p>
                  <p className="text-sm">+1 (800) 123-4567</p>
                  <p className="text-xs">Mon-Fri, 9AM-6PM EST</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium mb-1">Email</p>
                  <p className="text-sm">support@bams.com</p>
                  <p className="text-xs">24/7 response time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium mb-1">Headquarters</p>
                  <p className="text-sm">123 Banking Street</p>
                  <p className="text-xs">New York, NY 10001</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} BAMS. All rights reserved. Member FDIC. Equal Housing Lender.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/help" className="hover:text-primary transition-colors">Accessibility</Link>
              <span>|</span>
              <Link href="/landing" className="hover:text-primary transition-colors">Sitemap</Link>
              <span>|</span>
              <Link href="/terms" className="hover:text-primary transition-colors">Disclosures</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky CTA Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary text-white py-4 shadow-2xl z-50 animate-in slide-in-from-bottom">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="font-bold text-lg">Ready to start banking smarter?</p>
              <p className="text-sm opacity-90">Join 2M+ customers who trust BAMS</p>
            </div>
            <div className="flex gap-3">
              <Link href="/login">
                <Button size="lg" variant="secondary" className="rounded-full shadow-lg">
                  Open Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full bg-transparent border-white text-white hover:bg-white hover:text-primary"
                onClick={() => setShowStickyBar(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Live Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-primary to-blue-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all z-50 flex items-center justify-center group hover:scale-110"
        aria-label="Live Chat"
      >
        {showChat ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        )}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* Chat Widget */}
      {showChat && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-background border shadow-2xl rounded-2xl z-50 animate-in slide-in-from-bottom">
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Live Support</p>
                <p className="text-xs opacity-90">We typically reply in minutes</p>
              </div>
            </div>
            <button onClick={() => setShowChat(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 h-96 overflow-y-auto space-y-4">
            <div className="bg-muted rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">👋 Hi! How can we help you today?</p>
              <p className="text-xs text-muted-foreground mt-1">Support Team • Just now</p>
            </div>
            <div className="bg-primary text-white rounded-lg p-3 max-w-[80%] ml-auto">
              <p className="text-sm">Hello! I have a question about opening an account.</p>
              <p className="text-xs opacity-80 mt-1">You • Just now</p>
            </div>
            <div className="bg-muted rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">I'd be happy to help! Opening an account is quick and easy. What would you like to know?</p>
              <p className="text-xs text-muted-foreground mt-1">Support Team • Just now</p>
            </div>
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="icon" className="rounded-full">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Or call us at +1 (800) 123-4567
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
}
