"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, UserPlus, Save, Loader2, Eye, Copy, Check, ExternalLink } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

export default function CreateCustomerPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [createdCustomer, setCreatedCustomer] = useState<any>(null)
  const [tempPassword, setTempPassword] = useState("")
  const [passwordCopied, setPasswordCopied] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    accountType: "checking",
    initialBalance: "0",
    onlinePaymentsEnabled: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!user?.id) {
      toast.error("You must be logged in to create customers")
      return
    }

    // Validate required fields
    if (!formData.name || !formData.email) {
      setError("Name and email are required")
      toast.error("Name and email are required")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      toast.error("Please enter a valid email address")
      return
    }

    // Validate initial balance
    const balance = parseFloat(formData.initialBalance || '0')
    if (isNaN(balance) || balance < 0) {
      setError("Initial balance must be a positive number")
      toast.error("Please enter a valid initial balance")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: user.id,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || null,
          accountType: formData.accountType,
          initialBalance: balance
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create customer')
      }

      // Store customer data and password to show credentials
      setCreatedCustomer(data.customer)
      setTempPassword(data.tempPassword || '')
      toast.success(`Customer ${data.customer?.name || formData.name} created successfully!`)
      
      // Don't redirect immediately - show credentials first
    } catch (error: any) {
      console.error('Error creating customer:', error)
      setError(error.message || 'Failed to create customer. Please try again.')
      toast.error(error.message || 'Failed to create customer. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword)
    setPasswordCopied(true)
    toast.success("Password copied to clipboard!")
    setTimeout(() => setPasswordCopied(false), 2000)
  }

  const viewCustomerDashboard = () => {
    // Open login page with customer email pre-filled in a new tab
    const loginUrl = `/login?email=${encodeURIComponent(createdCustomer.email)}`
    window.open(loginUrl, '_blank')
  }

  // Show success screen with credentials
  if (createdCustomer && tempPassword) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-6 h-6" />
                    Customer Created Successfully!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">Customer Details:</p>
                    <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                      <p><strong>Name:</strong> {createdCustomer.name}</p>
                      <p><strong>Email:</strong> {createdCustomer.email}</p>
                      <p><strong>Account Number:</strong> {createdCustomer.accountNumber}</p>
                      <p><strong>Account Type:</strong> {createdCustomer.accountType}</p>
                      <p><strong>Initial Balance:</strong> ${createdCustomer.balance.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">Login Credentials:</p>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-blue-700 dark:text-blue-300">Email:</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={createdCustomer.email}
                            readOnly
                            className="bg-white dark:bg-gray-800"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(createdCustomer.email)
                              toast.success("Email copied!")
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-blue-700 dark:text-blue-300">Temporary Password:</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="password"
                            value={tempPassword}
                            readOnly
                            className="bg-white dark:bg-gray-800 font-mono"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyPassword}
                          >
                            {passwordCopied ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
                      ⚠️ Save these credentials! Share them with the customer so they can log in.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={viewCustomerDashboard}
                      variant="outline"
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Customer Dashboard
                    </Button>
                    <Button
                      onClick={() => {
                        setCreatedCustomer(null)
                        setTempPassword("")
                        router.push("/admin/customers")
                      }}
                      className="flex-1"
                    >
                      Back to Customers
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/admin/customers" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Back to Customers
            </Link>
            <h1 className="text-4xl font-bold text-balance">Create New Customer</h1>
            <p className="text-muted-foreground mt-2">Add a new customer account with complete information</p>
          </div>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter customer's full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="customer@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select value={formData.accountType} onValueChange={(value) => handleInputChange("accountType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking Account</SelectItem>
                        <SelectItem value="savings">Savings Account</SelectItem>
                        <SelectItem value="business">Business Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initialBalance">Initial Balance ($)</Label>
                    <Input
                      id="initialBalance"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.initialBalance}
                      onChange={(e) => handleInputChange("initialBalance", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="onlinePayments"
                      checked={formData.onlinePaymentsEnabled}
                      onCheckedChange={(checked) => handleInputChange("onlinePaymentsEnabled", checked as boolean)}
                    />
                    <Label htmlFor="onlinePayments" className="text-sm">
                      Enable online payments and transfers
                    </Label>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Customer
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="max-w-2xl mt-6">
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>• A unique account number will be automatically generated</p>
                <p>• A debit card will be created with a random number and expiry date</p>
                <p>• The customer will receive login credentials via email</p>
                <p>• Account will be set to active status immediately</p>
                <p>• Customer can start using the account right away</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
