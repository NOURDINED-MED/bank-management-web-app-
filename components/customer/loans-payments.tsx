"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, Calendar, TrendingDown, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

interface Loan {
  id: string
  type: string
  principal: number
  remainingBalance: number
  interestRate: number
  nextPayment: string | null
  nextPaymentAmount: number
  status: string
}

interface LoanPayment {
  id: string
  date: string
  amount: number
  status: string
}

export function LoansPayments() {
  const { user } = useAuth()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const paymentHistory: LoanPayment[] = [] // Would need loan_payments table

  useEffect(() => {
    if (user?.id) {
      fetchLoans()
    }
  }, [user])

  const fetchLoans = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const response = await fetch(`/api/customer/loans?userId=${user.id}`)
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setLoans(data.loans || [])
    } catch (error) {
      console.error('Error fetching loans:', error)
      setLoans([])
    } finally {
      setLoading(false)
    }
  }

  const getRiskIndicator = (loan: Loan) => {
    const paidPercent = ((loan.principal - loan.remainingBalance) / loan.principal) * 100
    if (paidPercent >= 75) return { level: "low", color: "green", text: "Low Risk" }
    if (paidPercent >= 50) return { level: "medium", color: "yellow", text: "Medium Risk" }
    return { level: "high", color: "red", text: "High Risk" }
  }

  return (
    <Card className="border border-gray-200 dark:border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Loans & Payments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Loans */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Active Loans</h3>
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-gray-500 text-center py-4">Loading loans...</p>
            ) : loans.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-muted-foreground text-center py-4">No active loans</p>
            ) : (
              loans.map((loan) => {
                const paidAmount = loan.principal - loan.remainingBalance
                const paidPercent = (paidAmount / loan.principal) * 100
                const risk = getRiskIndicator(loan)

                return (
                  <div key={loan.id} className="p-4 border border-gray-200 dark:border-border rounded-xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-foreground">{loan.type}</h4>
                        <p className="text-xs text-gray-500 dark:text-muted-foreground">Interest Rate: {loan.interestRate}%</p>
                      </div>
                      <Badge className={risk.color === "green" ? "bg-green-500 dark:bg-green-600" : risk.color === "yellow" ? "bg-yellow-500 dark:bg-yellow-600" : "bg-red-500 dark:bg-red-600"}>
                        {loan.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-muted-foreground">Remaining Balance</span>
                        <span className="font-semibold text-gray-900 dark:text-foreground">
                          ${loan.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-muted-foreground">Original Principal</span>
                        <span className="text-gray-900 dark:text-foreground">
                          ${loan.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <Progress value={paidPercent} className="h-2" />
                      <p className="text-xs text-gray-500 dark:text-muted-foreground">{paidPercent.toFixed(1)}% paid off</p>
                    </div>

                    <div className="pt-3 border-t border-gray-200 dark:border-border flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-muted-foreground">Next Payment</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                          <span className="text-sm font-medium text-gray-900 dark:text-foreground">
                            {loan.nextPayment ? new Date(loan.nextPayment).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-muted-foreground">Amount</p>
                        <span className="text-sm font-semibold text-gray-900 dark:text-foreground">
                          ${loan.nextPaymentAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200 dark:border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-muted-foreground">Risk Indicator (UI only)</span>
                        <Badge 
                          variant="outline"
                          className={
                            risk.color === "green"
                              ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                              : risk.color === "yellow"
                              ? "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                              : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                          }
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {risk.text}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Payment History */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Payment History</h3>
          <div className="space-y-2">
            {paymentHistory.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-muted-foreground text-center py-4">No payment history</p>
            ) : (
              paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-foreground">
                      Payment - {payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">
                      {payment.status === "completed" ? "Completed" : "Pending"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-foreground">
                      ${payment.amount.toFixed(2)}
                    </span>
                    <Badge className="ml-2 bg-green-500 dark:bg-green-600 text-white text-xs">
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}