"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  ArrowRight,
  Moon,
  Sun,
  CheckCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function ContactPage() {
  const { theme, setTheme } = useTheme()
  const [submitted, setSubmitted] = useState(false)

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      content: "+1 (800) 123-4567",
      subtext: "Mon-Fri, 9AM-6PM EST",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Mail,
      title: "Email",
      content: "support@bams.com",
      subtext: "We'll respond within 24 hours",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: MapPin,
      title: "Location",
      content: "123 Banking Street",
      subtext: "New York, NY 10001",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      content: "Available 24/7",
      subtext: "Instant support",
      color: "from-orange-500 to-red-600"
    }
  ]

  const departments = [
    "General Inquiry",
    "Account Support",
    "Technical Support",
    "Business Banking",
    "Loan Information",
    "Credit Cards",
    "Other"
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
  }

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
              Get in Touch
              <span className="block text-primary mt-2">We're Here to Help</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions? Our team is ready to assist you with all your banking needs
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {contactInfo.map((info, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-xl transition-all">
                <div className={`w-14 h-14 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <info.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{info.title}</h3>
                <p className="font-bold text-lg mb-1">{info.content}</p>
                <p className="text-sm text-muted-foreground">{info.subtext}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Form */}
            <Card className="p-8">
              <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
              
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" required className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" required className="h-12 rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required className="h-12 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="h-12 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <select id="department" className="w-full h-12 rounded-xl border bg-background px-4">
                      {departments.map((dept) => (
                        <option key={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us how we can help you..." 
                      required 
                      className="min-h-[150px] rounded-xl"
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-xl text-base">
                    Send Message
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              )}
            </Card>

            {/* Additional Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Visit Our Office</h2>
                <Card className="p-6 mb-6">
                  <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">BAMS Headquarters</h3>
                  <p className="text-muted-foreground mb-4">
                    123 Banking Street<br />
                    New York, NY 10001<br />
                    United States
                  </p>
                  <Button variant="outline" className="w-full rounded-xl">
                    Get Directions
                  </Button>
                </Card>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Business Hours</h3>
                <Card className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Monday - Friday</p>
                        <p className="text-sm text-muted-foreground">9:00 AM - 6:00 PM EST</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Saturday</p>
                        <p className="text-sm text-muted-foreground">10:00 AM - 4:00 PM EST</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Sunday</p>
                        <p className="text-sm text-muted-foreground">Closed</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Facebook className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Twitter className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Instagram className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Linkedin className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Find quick answers to common questions
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "How do I open an account?",
                a: "You can open an account online in just minutes by clicking the 'Open Account' button and following the simple steps."
              },
              {
                q: "What documents do I need?",
                a: "You'll need a valid government-issued ID, proof of address, and Social Security number."
              },
              {
                q: "Is my money safe with BAMS?",
                a: "Yes! All deposits are FDIC insured up to $250,000 per depositor, and we use bank-level encryption."
              },
              {
                q: "How long does it take to get approved?",
                a: "Most applications are approved within 24 hours. Some may require additional verification."
              }
            ].map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
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
            Join millions of customers who trust BAMS for their banking needs
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

