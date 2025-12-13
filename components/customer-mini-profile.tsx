"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { User, Wallet, Calendar, Shield, AlertTriangle, TrendingUp, TrendingDown, Phone, Mail, Loader2 } from "lucide-react"
import type { Customer, Transaction } from "@/lib/types"
import { useState, useEffect } from "react"

interface CustomerMiniProfileProps {
  customer: Customer | null
  transactions?: Transaction[]
  open: boolean
  onClose: () => void
  onDeposit?: () => void
  onWithdrawal?: () => void
  onTransfer?: () => void
}

export function CustomerMiniProfile({
  customer,
  transactions = [],
  open,
  onClose,
  onDeposit,
  onWithdrawal,
  onTransfer
}: CustomerMiniProfileProps) {
  const [customerTransactions, setCustomerTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [totalDeposits, setTotalDeposits] = useState(0)
  const [totalWithdrawals, setTotalWithdrawals] = useState(0)

  // Fetch customer transactions when modal opens
  useEffect(() => {
    if (open && customer?.id) {
      fetchCustomerTransactions()
    }
  }, [open, customer?.id])

  const fetchCustomerTransactions = async () => {
    if (!customer?.id && !customer?.accountNumber) return

    setLoading(true)
    try {
      // Use the new summary endpoint that fetches everything at once
      const url = customer.accountNumber 
        ? `/api/customer/summary?accountNumber=${encodeURIComponent(customer.accountNumber)}`
        : `/api/customer/summary?customerId=${encodeURIComponent(customer.id)}`
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.error) {
        console.error('Error fetching customer summary:', data.error)
        // Fallback to using transactions prop
        const fallbackTransactions = transactions
          .filter(t => t.customerId === customer.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10)
        
        setCustomerTransactions(fallbackTransactions)
        calculateTotals(transactions.filter(t => t.customerId === customer.id))
        setLoading(false)
        return
      }

      // Set transactions and totals from API response
      setCustomerTransactions(data.transactions || [])
      setTotalDeposits(data.totalDeposits || 0)
      setTotalWithdrawals(data.totalWithdrawals || 0)
    } catch (error) {
      console.error('Error fetching customer data:', error)
      // Fallback to using transactions prop
      const fallbackTransactions = transactions
        .filter(t => t.customerId === customer.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
      
      setCustomerTransactions(fallbackTransactions)
      calculateTotals(transactions.filter(t => t.customerId === customer.id))
    } finally {
      setLoading(false)
    }
  }

  const calculateTotals = (txs: Transaction[]) => {
    const deposits = txs
      .filter(t => (t.type as string).toLowerCase() === "deposit")
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    
    const withdrawals = txs
      .filter(t => (t.type as string).toLowerCase() === "withdrawal")
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    setTotalDeposits(deposits)
    setTotalWithdrawals(withdrawals)
  }

  if (!customer) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Customer Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">{customer.name}</h3>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                  {customer.status}
                </Badge>
                {customer.kycStatus && (
                  <Badge
                    variant="outline"
                    className={
                      customer.kycStatus === "verified"
                        ? "bg-green-500/10 text-green-600 border-green-200"
                        : customer.kycStatus === "pending"
                        ? "bg-yellow-500/10 text-yellow-600 border-yellow-200"
                        : "bg-red-500/10 text-red-600 border-red-200"
                    }
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {customer.kycStatus}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                <p className="font-mono font-semibold">{customer.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Account Type</p>
                <p className="font-semibold capitalize">{customer.accountType}</p>
              </div>
              {customer.phone && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {customer.phone}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Member Since</p>
                <p className="font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(customer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                <p className="text-4xl font-bold text-green-600">
                  ${customer.balance.toLocaleString()}
                </p>
              </div>
              <Wallet className="w-12 h-12 text-muted-foreground opacity-20" />
            </div>

            {customer.balance < 1000 && (
              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950 rounded text-sm text-yellow-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Low balance warning
              </div>
            )}
          </div>

          {/* Transaction Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Total Deposits</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ${totalDeposits.toLocaleString()}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-sm text-muted-foreground">Total Withdrawals</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                ${totalWithdrawals.toLocaleString()}
              </p>
            </div>
          </div>

          <Separator />

          {/* Recent Transactions */}
          <div>
            <h4 className="font-semibold mb-3">Recent Transactions</h4>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading transactions...</span>
              </div>
            ) : customerTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent transactions</p>
            ) : (
              <div className="space-y-2">
                {customerTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          transaction.type === "deposit"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {transaction.type === "deposit" ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-semibold ${
                        transaction.type === "deposit" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.type === "deposit" ? "+" : "-"}$
                      {transaction.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button className="flex-1" onClick={onDeposit}>
              Deposit
            </Button>
            <Button className="flex-1" variant="outline" onClick={onWithdrawal}>
              Withdrawal
            </Button>
            <Button className="flex-1" variant="outline" onClick={onTransfer}>
              Transfer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

