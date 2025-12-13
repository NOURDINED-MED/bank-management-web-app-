"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, Shield, Lock, Eye, Award, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export default function SecurityPage() {
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
          <h1 className="text-5xl font-bold mb-4">Security & Privacy</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Your security is our top priority. Learn how we protect your money and data
          </p>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How We Keep You Safe</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <Card>
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">256-bit Encryption</h3>
                <p className="text-muted-foreground mb-4">
                  All your data is protected with military-grade 256-bit AES encryption, both in transit and at rest.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">End-to-end encryption for all transactions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Secure socket layer (SSL) certificates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Encrypted data storage</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-950/30 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Fraud Detection</h3>
                <p className="text-muted-foreground mb-4">
                  Advanced AI algorithms monitor your account 24/7 to detect and prevent fraudulent activity.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Real-time transaction monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Instant fraud alerts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Zero liability protection</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-950/30 rounded-full flex items-center justify-center mb-4">
                  <Eye className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Multi-Factor Authentication</h3>
                <p className="text-muted-foreground mb-4">
                  Add an extra layer of security with two-factor authentication via SMS, email, or authenticator apps.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Biometric authentication (Face ID, Touch ID)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">One-time passwords (OTP)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Device verification</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Compliance & Insurance</h3>
                <p className="text-muted-foreground mb-4">
                  We meet the highest industry standards and your deposits are fully insured.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">FDIC insured up to $250,000</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">ISO 27001 certified</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">PCI DSS compliant</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Security Tips */}
          <div className="bg-muted/50 rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-8">Stay Safe Online</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold mb-3">✅ Do:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Use strong, unique passwords</li>
                  <li>• Enable two-factor authentication</li>
                  <li>• Keep your contact information updated</li>
                  <li>• Review your account regularly</li>
                  <li>• Log out after each session</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">❌ Don't:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Share your password with anyone</li>
                  <li>• Click suspicious links in emails</li>
                  <li>• Use public Wi-Fi for banking</li>
                  <li>• Save passwords in your browser</li>
                  <li>• Ignore security alerts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Questions About Security?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Our security team is here to help
          </p>
          <Link href="/contact">
            <Button size="lg" className="rounded-full">
              Contact Security Team
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

