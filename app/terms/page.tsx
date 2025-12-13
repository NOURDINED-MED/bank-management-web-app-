"use client"

import { Button } from "@/components/ui/button"
import { Building2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export default function TermsPage() {
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

        <h1 className="text-5xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last Updated: November 26, 2025</p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-3xl font-bold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using BAMS (Banking Account Management System) services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">2. Account Registration</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To use our services, you must:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Be at least 18 years of age</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">3. Account Types and Services</h2>
            <h3 className="text-xl font-semibold mb-3">Personal Banking</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Checking and savings accounts</li>
              <li>Debit cards and credit cards</li>
              <li>Online and mobile banking</li>
              <li>Bill pay and money transfers</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Business Banking</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Business checking and savings</li>
              <li>Merchant services</li>
              <li>Payroll solutions</li>
              <li>Business loans and credit lines</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">4. Fees and Charges</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree to pay all applicable fees as disclosed in our Fee Schedule:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Monthly maintenance fees (may be waived with minimum balance)</li>
              <li>Overdraft and insufficient funds fees</li>
              <li>Wire transfer fees</li>
              <li>ATM fees for out-of-network withdrawals</li>
              <li>International transaction fees</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We reserve the right to change our fees with 30 days' notice.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">5. Transactions and Payments</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you initiate a transaction:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>You authorize us to debit your account for the transaction amount</li>
              <li>Transactions are subject to our fraud prevention measures</li>
              <li>We may place holds on deposits according to our Funds Availability Policy</li>
              <li>International transactions are subject to currency conversion fees</li>
              <li>Disputed transactions must be reported within 60 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">6. User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use our services only for lawful purposes</li>
              <li>Not engage in fraudulent or illegal activities</li>
              <li>Maintain sufficient funds to cover your transactions</li>
              <li>Keep your contact information current</li>
              <li>Review your statements regularly</li>
              <li>Not attempt to breach our security systems</li>
              <li>Not share your account credentials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">7. Account Closure and Suspension</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Suspend or close your account for violation of these terms</li>
              <li>Freeze accounts suspected of fraudulent activity</li>
              <li>Close inactive accounts after 12 months of inactivity</li>
              <li>Refuse service to anyone for any lawful reason</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You may close your account at any time by contacting customer support. Any outstanding balances or fees must be settled before closure.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">8. Liability and Disclaimers</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our services are provided "as is" without warranties of any kind. We are not liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Service interruptions or technical issues</li>
              <li>Losses resulting from unauthorized access (if you failed to secure your account)</li>
              <li>Third-party services or merchant disputes</li>
              <li>Investment losses or market fluctuations</li>
              <li>Indirect, incidental, or consequential damages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">9. Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Any disputes arising from these terms will be resolved through:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Good faith negotiations between you and BAMS</li>
              <li>Binding arbitration if negotiations fail</li>
              <li>Arbitration governed by the American Arbitration Association</li>
              <li>Individual claims only (no class actions)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">10. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content, trademarks, and intellectual property on our platform are owned by BAMS. You may not reproduce, distribute, or create derivative works without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">11. Privacy and Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your use of our services is also governed by our Privacy Policy. We collect, use, and protect your data as described in that policy. By using our services, you consent to such processing.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">12. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may modify these terms at any time. Material changes will be communicated via email or through our website. Continued use of our services after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">13. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms are governed by the laws of the State of New York, United States, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">14. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service:
            </p>
            <div className="bg-muted/50 rounded-lg p-6 mt-4">
              <p className="font-semibold mb-2">BAMS Legal Department</p>
              <p className="text-muted-foreground">Email: legal@bams.com</p>
              <p className="text-muted-foreground">Phone: +1 (800) 123-4567</p>
              <p className="text-muted-foreground">Address: 123 Banking Street, New York, NY 10001</p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">15. Severability</h2>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
            </p>
          </section>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-8">
            <p className="text-sm font-medium mb-2">📄 By using BAMS services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

