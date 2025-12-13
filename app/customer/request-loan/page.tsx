"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { PiggyBank, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

export default function RequestLoanPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    loanType: "",
    amount: "",
    purpose: "",
    duration: "",
    description: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.loanType || !formData.amount || !formData.purpose || !formData.duration) {
      toast.error("Please fill in all required fields")
      setLoading(false)
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("Loan request submitted successfully! We will review your application and contact you soon.")
      setFormData({
        loanType: "",
        amount: "",
        purpose: "",
        duration: "",
        description: ""
      })
    } catch (error) {
      toast.error("Failed to submit loan request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/customer" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold mb-2">Request a Loan</h1>
            <p className="text-muted-foreground">
              Apply for a personal or business loan with competitive rates
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Application</CardTitle>
                  <CardDescription>
                    Fill out the form below to apply for a loan. All fields marked with * are required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="loanType">Loan Type *</Label>
                      <Select
                        value={formData.loanType}
                        onValueChange={(value) => setFormData({ ...formData, loanType: value })}
                      >
                        <SelectTrigger id="loanType">
                          <SelectValue placeholder="Select loan type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal">Personal Loan</SelectItem>
                          <SelectItem value="business">Business Loan</SelectItem>
                          <SelectItem value="mortgage">Mortgage</SelectItem>
                          <SelectItem value="auto">Auto Loan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Loan Amount ($) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter loan amount"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purpose">Loan Purpose *</Label>
                      <Select
                        value={formData.purpose}
                        onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                      >
                        <SelectTrigger id="purpose">
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home-improvement">Home Improvement</SelectItem>
                          <SelectItem value="debt-consolidation">Debt Consolidation</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="medical">Medical Expenses</SelectItem>
                          <SelectItem value="business-expansion">Business Expansion</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Loan Duration (months) *</Label>
                      <Select
                        value={formData.duration}
                        onValueChange={(value) => setFormData({ ...formData, duration: value })}
                      >
                        <SelectTrigger id="duration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                          <SelectItem value="36">36 months</SelectItem>
                          <SelectItem value="48">48 months</SelectItem>
                          <SelectItem value="60">60 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Additional Information</Label>
                      <Textarea
                        id="description"
                        placeholder="Provide any additional details about your loan request"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Loan Request"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="w-5 h-5" />
                    Loan Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Interest Rates</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>Personal Loan: 8.5% - 12% APR</li>
                      <li>Business Loan: 6.5% - 10% APR</li>
                      <li>Mortgage: 4.5% - 6.5% APR</li>
                      <li>Auto Loan: 5.5% - 9% APR</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Requirements</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Valid identification</li>
                      <li>Proof of income</li>
                      <li>Bank statements (3 months)</li>
                      <li>Credit score check</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Processing Time</h4>
                    <p className="text-sm text-muted-foreground">
                      Most loan applications are reviewed within 2-3 business days. You will be notified via email once a decision has been made.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

