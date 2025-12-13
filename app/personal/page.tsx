"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Building2,
  CreditCard,
  PiggyBank,
  Shield,
  TrendingUp,
  Wallet,
  Home,
  Car,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  Moon,
  Sun
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function PersonalBankingPage() {
  const { theme, setTheme } = useTheme()

  const accounts = [
    {
      icon: Wallet,
      title: "Checking Account",
      description: "Everyday banking made simple with no monthly fees and unlimited transactions",
      features: ["No monthly fees", "Free debit card", "Mobile banking", "ATM access"],
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: PiggyBank,
      title: "Savings Account",
      description: "Grow your money with competitive interest rates and flexible access",
      features: ["High interest rates", "No minimum balance", "Easy transfers", "FDIC insured"],
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: TrendingUp,
      title: "Investment Account",
      description: "Build wealth with our comprehensive investment solutions",
      features: ["Diverse portfolio", "Expert advisors", "Low fees", "Real-time tracking"],
      color: "from-purple-500 to-pink-600"
    }
  ]

  const loans = [
    {
      icon: Home,
      title: "Home Loans",
      description: "Competitive mortgage rates for your dream home",
      rate: "3.25%",
      color: "bg-blue-500"
    },
    {
      icon: Car,
      title: "Auto Loans",
      description: "Fast approval for new and used vehicles",
      rate: "2.99%",
      color: "bg-green-500"
    },
    {
      icon: GraduationCap,
      title: "Student Loans",
      description: "Invest in your education with flexible terms",
      rate: "4.50%",
      color: "bg-purple-500"
    }
  ]

  const cards = [
    {
      title: "Rewards Card",
      description: "Earn 2% cash back on every purchase",
      benefits: ["No annual fee", "Travel insurance", "Purchase protection"],
      image: "💳"
    },
    {
      title: "Premium Card",
      description: "Exclusive perks and 5% cash back on select categories",
      benefits: ["Airport lounge access", "Concierge service", "No foreign fees"],
      image: "💎"
    },
    {
      title: "Student Card",
      description: "Build credit while earning rewards",
      benefits: ["No credit history needed", "Low rates", "Financial education"],
      image: "🎓"
    }
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
      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Personal Banking
              <span className="block text-primary mt-2">Designed for You</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover banking solutions tailored to your personal financial goals and lifestyle
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="rounded-full h-14 px-8">
                  Open Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8">
                Compare Accounts
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Accounts Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Personal Accounts</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the account that fits your financial needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {accounts.map((account, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all border-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${account.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <account.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{account.title}</h3>
                <p className="text-muted-foreground mb-6">{account.description}</p>
                <ul className="space-y-3 mb-6">
                  {account.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <Button className="w-full rounded-full">
                    Learn More
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Credit Cards */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Credit Cards</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find the perfect card for your spending habits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {cards.map((card, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all">
                <div className="text-6xl mb-4">{card.image}</div>
                <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
                <p className="text-muted-foreground mb-6">{card.description}</p>
                <ul className="space-y-2 mb-6">
                  {card.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <Button variant="outline" className="w-full rounded-full">
                    Apply Now
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Loans Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Personal Loans</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Competitive rates for all your borrowing needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loans.map((loan, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-all text-center">
                <div className={`w-20 h-20 ${loan.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <loan.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{loan.title}</h3>
                <p className="text-muted-foreground mb-4">{loan.description}</p>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Starting from</p>
                  <p className="text-4xl font-bold text-primary">{loan.rate}</p>
                  <p className="text-sm text-muted-foreground">APR</p>
                </div>
                <Link href="/login">
                  <Button className="w-full rounded-full">
                    Get Pre-Approved
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Open your personal account today and start achieving your financial goals
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

