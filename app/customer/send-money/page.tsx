"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { ArrowRight, DollarSign, CreditCard, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AccountData {
  totalBalance: number
  primaryAccount: {
    account_number: string
    balance: number
  } | null
}

export default function SendMoneyPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [accountData, setAccountData] = useState<AccountData | null>(null)
  const [recipientAccount, setRecipientAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; transactionId?: string } | null>(null)

  // Fetch account data on mount
  useEffect(() => {
    if (user?.id) {
      fetchAccountData()
    }
  }, [user?.id])

  const fetchAccountData = async () => {
    try {
      const response = await fetch(`/api/customer/account?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setAccountData({
          totalBalance: data.totalBalance || 0,
          primaryAccount: data.primaryAccount
        })
      }
    } catch (error) {
      console.error('Error fetching account data:', error)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    if (!recipientAccount.trim()) {
      setResult({ success: false, message: "Please enter a recipient account number" })
      setLoading(false)
      return
    }

    const transferAmount = parseFloat(amount)
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setResult({ success: false, message: "Please enter a valid amount" })
      setLoading(false)
      return
    }

    if (transferAmount < 1) {
      setResult({ success: false, message: "Minimum transfer amount is $1.00" })
      setLoading(false)
      return
    }

    if (!accountData || transferAmount > accountData.totalBalance) {
      setResult({ success: false, message: "Insufficient balance" })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/customer/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          recipientAccountNumber: recipientAccount.trim(),
          amount: transferAmount,
          description: description || undefined
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResult({ 
          success: true, 
          message: `Transfer of $${transferAmount.toFixed(2)} completed successfully!`,
          transactionId: data.transactionId
        })
        toast.success('Transfer completed successfully!')
        
        // Reset form
        setRecipientAccount("")
        setAmount("")
        setDescription("")
        
        // Refresh account data to show new balance
        await fetchAccountData()
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/customer')
        }, 2000)
      } else {
        setResult({ 
          success: false, 
          message: data.error || "Transfer failed. Please try again." 
        })
        toast.error(data.error || "Transfer failed")
      }
    } catch (error: any) {
      console.error('Transfer error:', error)
      setResult({ success: false, message: "Network error. Please check your connection and try again." })
      toast.error("Transfer failed. Please try again.")
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
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-balance">Send Money</h1>
            <p className="text-muted-foreground mt-2">Transfer money to another account securely</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Transfer Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Transfer Details</CardTitle>
                  <CardDescription>Enter the recipient's information and transfer amount</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="recipientAccount">Recipient Account Number</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="recipientAccount"
                          type="text"
                          placeholder="ACC-XXXXX-XXXX"
                          value={recipientAccount}
                          onChange={(e) => {
                            setRecipientAccount(e.target.value)
                            setResult(null)
                          }}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Transfer Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="1"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="What's this transfer for?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {result && (
                      <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                            {result.message}
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? "Processing..." : "Send Money"}
                      {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Transfer Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transfer Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">From Account:</span>
                    <span className="font-medium">{accountData?.primaryAccount?.account_number || "Loading..."}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Available Balance:</span>
                    <span className="font-medium">${(accountData?.totalBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Transfer Amount:</span>
                    <span className="font-medium text-lg">
                      ${amount ? parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Remaining Balance:</span>
                    <span className="font-medium">
                      ${(accountData?.totalBalance || 0) - (parseFloat(amount) || 0) >= 0
                        ? ((accountData?.totalBalance || 0) - (parseFloat(amount) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : "Insufficient funds"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transfer Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Minimum Transfer:</span>
                    <span>$1.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Daily Limit:</span>
                    <span>$10,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Monthly Limit:</span>
                    <span>$50,000</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Notice</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    All transfers are processed securely and cannot be reversed once completed.
                    Please verify recipient details before confirming.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
