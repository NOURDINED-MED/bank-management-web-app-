"use client"

import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { ArrowDownRight, Check, Loader2, AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

function WithdrawalPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [accountNumber, setAccountNumber] = useState("")
  const [customer, setCustomer] = useState<any>(null)

  // Auto-fill account number from URL parameter
  useEffect(() => {
    const accountFromUrl = searchParams.get('account')
    if (accountFromUrl) {
      setAccountNumber(accountFromUrl)
      // Auto-search for the customer
      setTimeout(() => {
        if (accountFromUrl) {
          searchCustomerWithAccount(accountFromUrl)
        }
      }, 100)
    }
  }, [searchParams])
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("Cash Withdrawal")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState("")
  const [transactionRef, setTransactionRef] = useState("")

  const searchCustomerWithAccount = async (accountNum: string) => {
    if (!accountNum.trim()) {
      return
    }

    setSearching(true)
    setError("")
    setCustomer(null)

    try {
      const response = await fetch(`/api/teller/search-customer?q=${encodeURIComponent(accountNum)}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setSearching(false)
        return
      }

      // Find exact match by account number
      const foundCustomer = data.customers?.find((c: any) => 
        c.accountNumber?.toLowerCase() === accountNum.toLowerCase().trim()
      )

      if (foundCustomer) {
        setCustomer(foundCustomer)
      } else if (data.customers && data.customers.length > 0) {
        // If multiple results, use the first one
        setCustomer(data.customers[0])
      } else {
        setError("Customer not found. Please check the account number.")
      }
    } catch (error: any) {
      console.error('Error searching customer:', error)
      setError("Failed to search customer. Please try again.")
    } finally {
      setSearching(false)
    }
  }

  const searchCustomer = async () => {
    if (!accountNumber.trim()) {
      setError("Please enter an account number")
      return
    }
    await searchCustomerWithAccount(accountNumber)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !customer || !amount) return

    const withdrawalAmount = Number.parseFloat(amount)
    if (withdrawalAmount > (customer.balance || 0)) {
      setError("Insufficient funds")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/teller/process-withdrawal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tellerId: user.id,
          accountNumber: customer.accountNumber,
          amount: withdrawalAmount,
          description: description || 'Cash Withdrawal'
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      setTransactionRef(data.transaction?.referenceNumber || '')
      setSuccess(true)
      
      // Redirect and force refresh to show new transaction
      setTimeout(() => {
        window.location.href = "/teller"
      }, 2000)
    } catch (error: any) {
      console.error('Error processing withdrawal:', error)
      setError(error.message || "Failed to process withdrawal. Please try again.")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <ProtectedRoute allowedRoles={["teller"]}>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Withdrawal Successful!</h2>
                  <p className="text-muted-foreground mb-2">
                    ${Number.parseFloat(amount).toLocaleString()} withdrawn from {customer?.name}'s account
                  </p>
                  {transactionRef && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Reference: {transactionRef}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["teller"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Link href="/teller" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
              ← Back to Dashboard
            </Link>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/10 text-red-600 p-3 rounded-lg">
                    <ArrowDownRight className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle>Process Withdrawal</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Handle customer withdrawal transaction</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <div className="flex gap-2">
                        <Input
                          id="accountNumber"
                          placeholder="Enter account number"
                          value={accountNumber}
                          onChange={(e) => {
                            setAccountNumber(e.target.value)
                            setCustomer(null)
                            setError("")
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              searchCustomer()
                            }
                          }}
                          required
                        />
                        <Button 
                          type="button" 
                          onClick={searchCustomer} 
                          variant="outline"
                          disabled={searching}
                        >
                          {searching ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Search"
                          )}
                        </Button>
                      </div>
                    </div>

                    {customer && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-lg">{customer.name}</p>
                              <p className="text-sm text-muted-foreground">{customer.email}</p>
                              <p className="text-sm text-muted-foreground">Account: {customer.accountNumber}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Available Balance</p>
                              <p className="text-2xl font-bold text-green-600">
                                ${(customer.balance || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {customer && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Withdrawal Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={customer.balance || 0}
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Enter withdrawal description..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>

                      {amount && parseFloat(amount) > 0 && (
                        <>
                          {Number.parseFloat(amount) > (customer.balance || 0) && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                              Insufficient funds. Maximum withdrawal: ${(customer.balance || 0).toLocaleString()}
                            </div>
                          )}

                          {Number.parseFloat(amount) <= (customer.balance || 0) && (
                            <Card className="bg-primary/5 border-primary/20">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-muted-foreground">New Balance</p>
                                  <p className="text-2xl font-bold text-red-600">
                                    ${((customer.balance || 0) - Number.parseFloat(amount || "0")).toLocaleString()}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      )}

                      {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                          {error}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={
                          loading || 
                          !amount || 
                          parseFloat(amount) <= 0 || 
                          Number.parseFloat(amount) > (customer.balance || 0)
                        }
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Process Withdrawal"
                        )}
                      </Button>
                    </>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default function WithdrawalPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute allowedRoles={['teller']}>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </ProtectedRoute>
    }>
      <WithdrawalPageContent />
    </Suspense>
  )
}
