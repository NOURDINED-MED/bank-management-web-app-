"use client"

import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect, useCallback, Suspense } from "react"
import Link from "next/link"
import { ArrowRightLeft, Check, AlertCircle, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"

function TransferPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [senderAccount, setSenderAccount] = useState("")
  const [recipientAccount, setRecipientAccount] = useState("")
  const [sender, setSender] = useState<any>(null)
  const [recipient, setRecipient] = useState<any>(null)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchingSender, setSearchingSender] = useState(false)
  const [searchingRecipient, setSearchingRecipient] = useState(false)
  const [transactionRef, setTransactionRef] = useState("")

  const searchSenderWithAccount = useCallback(async (accountNum: string) => {
    if (!accountNum.trim()) return

    setSearchingSender(true)
    setError("")
    setSender(null)

    try {
      const response = await fetch(`/api/teller/search-customer?q=${encodeURIComponent(accountNum)}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setSearchingSender(false)
        return
      }

      const foundCustomer = data.customers?.find((c: any) => 
        c.accountNumber?.toLowerCase() === accountNum.toLowerCase().trim()
      )

      if (foundCustomer) {
        setSender(foundCustomer)
      } else if (data.customers && data.customers.length > 0) {
        setSender(data.customers[0])
      } else {
        setError("Sender account not found. Please check the account number.")
      }
    } catch (error: any) {
      console.error('Error searching sender:', error)
      setError("Failed to search sender account. Please try again.")
    } finally {
      setSearchingSender(false)
    }
  }, [])

  // Auto-fill sender account from URL parameter
  useEffect(() => {
    const fromAccount = searchParams.get('fromAccount')
    if (fromAccount) {
      setSenderAccount(fromAccount)
      setTimeout(() => {
        if (fromAccount) {
          searchSenderWithAccount(fromAccount)
        }
      }, 100)
    }
  }, [searchParams, searchSenderWithAccount])

  const searchSender = async () => {
    if (!senderAccount.trim()) {
      setError("Please enter a sender account number")
      return
    }
    await searchSenderWithAccount(senderAccount)
  }

  const searchRecipientWithAccount = async (accountNum: string) => {
    if (!accountNum.trim()) return

    setSearchingRecipient(true)
    setError("")
    setRecipient(null)

    try {
      const response = await fetch(`/api/teller/search-customer?q=${encodeURIComponent(accountNum)}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setSearchingRecipient(false)
        return
      }

      const foundCustomer = data.customers?.find((c: any) => 
        c.accountNumber?.toLowerCase() === accountNum.toLowerCase().trim()
      )

      if (foundCustomer) {
        setRecipient(foundCustomer)
      } else if (data.customers && data.customers.length > 0) {
        setRecipient(data.customers[0])
      } else {
        setError("Recipient account not found. Please check the account number.")
      }
    } catch (error: any) {
      console.error('Error searching recipient:', error)
      setError("Failed to search recipient account. Please try again.")
    } finally {
      setSearchingRecipient(false)
    }
  }

  const searchRecipient = async () => {
    if (!recipientAccount.trim()) {
      setError("Please enter a recipient account number")
      return
    }
    await searchRecipientWithAccount(recipientAccount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!user?.id) {
      setError("You must be logged in to process transfers")
      setLoading(false)
      return
    }

    if (!sender || !recipient) {
      setError("Please search and select both sender and recipient accounts")
      setLoading(false)
      return
    }

    if (sender.accountNumber === recipient.accountNumber) {
      setError("Cannot transfer money to the same account")
      setLoading(false)
      return
    }

    const transferAmount = Number.parseFloat(amount)
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError("Transfer amount must be greater than zero")
      setLoading(false)
      return
    }

    if (transferAmount > (sender.balance || 0)) {
      setError("Insufficient balance in sender's account")
      setLoading(false)
      return
    }

    try {
      // Process transfer via API
      const response = await fetch('/api/teller/process-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tellerId: user.id,
          senderAccountNumber: sender.accountNumber,
          recipientAccountNumber: recipient.accountNumber,
          amount: transferAmount,
          description: description || "Money Transfer"
        }),
      })

      const data = await response.json()

      if (data.error || !data.success) {
        setError(data.error || "Failed to process transfer. Please try again.")
        setLoading(false)
        return
      }

      setTransactionRef(data.transaction?.reference_number || data.referenceNumber || '')
      setSuccess(true)
      
      // Redirect and force refresh to show new transaction
      setTimeout(() => {
        window.location.href = "/teller"
      }, 2000)
    } catch (error: any) {
      console.error('Error processing transfer:', error)
      setError(error.message || "Failed to process transfer. Please try again.")
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
                  <h2 className="text-2xl font-bold mb-2">Transfer Successful!</h2>
                  <p className="text-muted-foreground mb-2">
                    ${Number.parseFloat(amount).toLocaleString()} transferred from {sender?.name} to {recipient?.name}
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
                  <div className="bg-purple-500/10 text-purple-600 p-3 rounded-lg">
                    <ArrowRightLeft className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle>Process Money Transfer</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Transfer money between customer accounts</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    {/* Sender Account */}
                    <div className="space-y-2">
                      <Label htmlFor="senderAccount">Sender Account Number</Label>
                      <div className="flex gap-2">
                        <Input
                          id="senderAccount"
                          placeholder="ACC-2024-001"
                          value={senderAccount}
                          onChange={(e) => setSenderAccount(e.target.value)}
                          required
                        />
                        <Button 
                          type="button" 
                          onClick={searchSender} 
                          variant="outline"
                          disabled={searchingSender}
                        >
                          {searchingSender ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Search"
                          )}
                        </Button>
                      </div>
                    </div>

                    {sender && (
                      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-lg text-blue-900 dark:text-blue-100">{sender.name}</p>
                              <p className="text-sm text-blue-700 dark:text-blue-300">{sender.email}</p>
                              <p className="text-sm text-blue-700 dark:text-blue-300">Account: {sender.accountNumber}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-blue-600 dark:text-blue-400">Available Balance</p>
                              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                ${sender.balance.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {!sender && senderAccount && (
                      <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                        Sender account not found. Please check the account number.
                      </div>
                    )}

                    {/* Recipient Account */}
                    <div className="space-y-2">
                      <Label htmlFor="recipientAccount">Recipient Account Number</Label>
                      <div className="flex gap-2">
                        <Input
                          id="recipientAccount"
                          placeholder="ACC-2024-002"
                          value={recipientAccount}
                          onChange={(e) => setRecipientAccount(e.target.value)}
                          required
                        />
                        <Button 
                          type="button" 
                          onClick={searchRecipient} 
                          variant="outline"
                          disabled={searchingRecipient}
                        >
                          {searchingRecipient ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Search"
                          )}
                        </Button>
                      </div>
                    </div>

                    {recipient && (
                      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-lg text-green-900 dark:text-green-100">{recipient.name}</p>
                              <p className="text-sm text-green-700 dark:text-green-300">{recipient.email}</p>
                              <p className="text-sm text-green-700 dark:text-green-300">Account: {recipient.accountNumber}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-green-600 dark:text-green-400">Current Balance</p>
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                ${recipient.balance.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {!recipient && recipientAccount && (
                      <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                        Recipient account not found. Please check the account number.
                      </div>
                    )}
                  </div>

                  {sender && recipient && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Transfer Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
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
                          placeholder="Enter transfer description..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                        />
                      </div>

                      {amount && Number.parseFloat(amount) > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-red-700 dark:text-red-300">Sender New Balance</p>
                                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                  ${(sender.balance - Number.parseFloat(amount || "0")).toLocaleString()}
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-green-700 dark:text-green-300">Recipient New Balance</p>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                  ${(recipient.balance + Number.parseFloat(amount || "0")).toLocaleString()}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      <Button type="submit" className="w-full" size="lg" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing Transfer...
                          </>
                        ) : (
                          "Process Transfer"
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

export default function TransferPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute allowedRoles={['teller']}>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </ProtectedRoute>
    }>
      <TransferPageContent />
    </Suspense>
  )
}
