"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Clock, ArrowLeft, Briefcase } from "lucide-react"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

const jobs = [
  {
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "New York, NY",
    type: "Full-time",
    description: "Build beautiful, performant web applications for millions of users"
  },
  {
    title: "Product Manager",
    department: "Product",
    location: "Remote",
    type: "Full-time",
    description: "Lead product strategy and development for our mobile banking platform"
  },
  {
    title: "Customer Support Specialist",
    department: "Support",
    location: "Multiple Locations",
    type: "Full-time",
    description: "Help customers resolve issues and provide exceptional service"
  },
  {
    title: "Security Engineer",
    department: "Security",
    location: "San Francisco, CA",
    type: "Full-time",
    description: "Protect customer data and ensure our systems are secure"
  }
]

export default function CareersPage() {
  const { theme, setTheme } = useTheme()

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
          <h1 className="text-5xl font-bold mb-4">Careers at BAMS</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Join our team and help shape the future of banking
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Work With Us</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3">💰 Competitive Pay</h3>
                <p className="text-muted-foreground">
                  Industry-leading salaries, equity packages, and annual bonuses
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3">🏥 Health Benefits</h3>
                <p className="text-muted-foreground">
                  Comprehensive medical, dental, and vision coverage for you and your family
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3">🌴 Work-Life Balance</h3>
                <p className="text-muted-foreground">
                  Flexible hours, remote work options, and unlimited PTO
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Open Positions */}
          <h2 className="text-3xl font-bold mb-8">Open Positions</h2>
          <div className="space-y-4">
            {jobs.map((job, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{job.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {job.department}
                        </Badge>
                        <Badge variant="outline">
                          <MapPin className="w-3 h-3 mr-1" />
                          {job.location}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {job.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{job.description}</p>
                    </div>
                    <Button className="ml-4 rounded-full">Apply Now</Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

