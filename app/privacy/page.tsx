"use client"

import { Button } from "@/components/ui/button"
import { Building2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export default function PrivacyPage() {
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

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/landing">
          <Button variant="outline" className="mb-6 rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-5xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last Updated: November 26, 2025</p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-3xl font-bold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              At BAMS (Banking Account Management System), we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our banking services, website, and mobile applications.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect information that identifies you, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Full name, date of birth, and government-issued ID</li>
              <li>Contact information (email, phone, address)</li>
              <li>Social Security Number or Tax ID</li>
              <li>Employment and income information</li>
              <li>Account credentials and authentication data</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Financial Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Account balances and transaction history</li>
              <li>Payment card information</li>
              <li>Credit history and scores</li>
              <li>Investment portfolio data</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Device information and IP addresses</li>
              <li>Browser type and operating system</li>
              <li>Pages visited and features used</li>
              <li>Location data (with your permission)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide and maintain your banking services</li>
              <li>Process transactions and send notifications</li>
              <li>Verify your identity and prevent fraud</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Improve our services and develop new features</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Provide customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">4. Information Sharing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Service Providers:</strong> Third parties who help us operate our business</li>
              <li><strong>Financial Partners:</strong> Payment processors and credit bureaus</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We never sell your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>256-bit AES encryption for data in transit and at rest</li>
              <li>Multi-factor authentication</li>
              <li>Regular security audits and penetration testing</li>
              <li>Employee training on data protection</li>
              <li>24/7 fraud monitoring</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data (subject to legal requirements)</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data in a portable format</li>
              <li>Object to certain data processing activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">7. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to improve your experience, analyze usage patterns, and prevent fraud. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our services are not directed to individuals under 18. We do not knowingly collect personal information from children. If you believe a child has provided us with information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">9. International Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material changes via email or through our website. Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or want to exercise your rights, please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-6 mt-4">
              <p className="font-semibold mb-2">BAMS Privacy Team</p>
              <p className="text-muted-foreground">Email: privacy@bams.com</p>
              <p className="text-muted-foreground">Phone: +1 (800) 123-4567</p>
              <p className="text-muted-foreground">Address: 123 Banking Street, New York, NY 10001</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

