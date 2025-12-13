"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Building2,
  Briefcase,
  TrendingUp,
  Shield,
  Users,
  Globe,
  CreditCard,
  Wallet,
  LineChart,
  ArrowRight,
  CheckCircle,
  Moon,
  Sun,
  Package,
  Zap
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function BusinessBankingPage() {
  const { theme, setTheme } = useTheme()

  const solutions = [
    {
      icon: Briefcase,
      title: "Business Checking",
      description: "Streamline your business finances with our feature-rich checking accounts",
      features: ["Unlimited transactions", "Online banking", "Mobile deposits", "No monthly fees"],
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: TrendingUp,
      title: "Business Savings",
      description: "Grow your business reserves with competitive interest rates",
      features: ["High yield returns", "Flexible access", "Automated transfers", "FDIC insured"],
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: CreditCard,
      title: "Business Credit Cards",
      description: "Powerful cards with rewards designed for business spending",
      features: ["Cash back rewards", "Expense tracking", "Employee cards", "Travel benefits"],
      color: "from-purple-500 to-pink-600"
    }
  ]

  const services = [
    {
      icon: LineChart,
      title: "Merchant Services",
      description: "Accept payments anywhere with our secure payment processing solutions",
      image: "💳"
    },
    {
      icon: Globe,
      title: "International Banking",
      description: "Expand globally with foreign exchange and international wire services",
      image: "🌍"
    },
    {
      icon: Shield,
      title: "Payroll Services",
      description: "Simplify payroll management with our automated solutions",
      image: "💰"
    },
    {
      icon: Package,
      title: "Cash Management",
      description: "Optimize your cash flow with our treasury management tools",
      image: "📊"
    }
  ]

  const benefits = [
    {
      icon: Users,
      title: "Dedicated Support",
      description: "Get personalized service from business banking specialists"
    },
    {
      icon: Zap,
      title: "Fast Approvals",
      description: "Quick decisions on loans and credit applications"
    },
    {
      icon: Shield,
      title: "Fraud Protection",
      description: "Advanced security to protect your business accounts"
    },
    {
      icon: TrendingUp,
      title: "Growth Tools",
      description: "Financial insights and tools to help your business grow"
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
      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">For Businesses</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Business Banking
              <span className="block text-primary mt-2">Built for Growth</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Comprehensive financial solutions to help your business thrive and succeed
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="rounded-full h-14 px-8">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8">
                Schedule Consultation
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
              <div>
                <p className="text-3xl font-bold text-primary">50K+</p>
                <p className="text-sm text-muted-foreground">Business Clients</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">$10B+</p>
                <p className="text-sm text-muted-foreground">Loans Funded</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">99%</p>
                <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Business Solutions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything your business needs to manage finances efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all border-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${solution.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <solution.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{solution.title}</h3>
                <p className="text-muted-foreground mb-6">{solution.description}</p>
                <ul className="space-y-3 mb-6">
                  {solution.features.map((feature, idx) => (
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

      {/* Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Additional Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Specialized services to support your business operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all text-center">
                <div className="text-5xl mb-4">{service.image}</div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                <Button variant="link" className="p-0">
                  Learn More →
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose BAMS Business Banking?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide the tools and support your business needs to succeed
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Options */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Business Loans & Lines of Credit</h2>
              <p className="text-lg text-muted-foreground">
                Flexible financing options to fuel your business growth
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-4">Term Loans</h3>
                <p className="text-muted-foreground mb-6">
                  Fixed or variable rate loans for equipment, expansion, or working capital
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Up to $5 million</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Flexible terms up to 10 years</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Competitive rates from 4.5%</span>
                  </li>
                </ul>
                <Link href="/login">
                  <Button className="w-full rounded-full">Apply Now</Button>
                </Link>
              </Card>

              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-4">Lines of Credit</h3>
                <p className="text-muted-foreground mb-6">
                  Flexible access to funds when you need them for cash flow management
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Up to $1 million</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Draw as needed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Only pay for what you use</span>
                  </li>
                </ul>
                <Link href="/login">
                  <Button className="w-full rounded-full">Apply Now</Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Partner with BAMS for comprehensive business banking solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="rounded-full h-14 px-8">
                Open Business Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="rounded-full h-14 px-8 border-white text-white hover:bg-white hover:text-primary">
              Talk to an Expert
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

