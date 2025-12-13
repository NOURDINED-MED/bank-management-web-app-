"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wallet, CreditCard, TrendingUp, Lock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

interface Account {
  id: string
  account_number: string
  account_type: string
  balance: number
  status: string
  account_tier?: string
}

interface AccountSummaryDetailedProps {
  accountData?: any
}

export function AccountSummaryDetailed({ accountData }: AccountSummaryDetailedProps) {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    if (accountData?.accounts) {
      setAccounts(accountData.accounts)
    } else if (accountData?.primaryAccount) {
      setAccounts([accountData.primaryAccount])
    }
  }, [accountData])

  const getAccountTier = (accountType: string, balance: number) => {
    if (balance >= 50000) return "Premium"
    if (balance >= 10000) return "Gold"
    return "Basic"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case "frozen":
        return <Badge className="bg-yellow-500 text-white"><Lock className="w-3 h-3 mr-1" />Frozen</Badge>
      case "closed":
        return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getAccountLimit = (accountType: string) => {
    switch (accountType) {
      case "checking":
        return 50000
      case "savings":
        return 100000
      case "loan":
        return 0
      case "credit":
        return 10000
      default:
        return 25000
    }
  }

  return (
    <Card className="border border-gray-200 dark:border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Account Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-muted-foreground text-center py-4">No accounts found</p>
        ) : (
          accounts.map((account) => {
            const tier = account.account_tier || getAccountTier(account.account_type, account.balance || 0)
            const limit = getAccountLimit(account.account_type)
            const usagePercent = limit > 0 ? ((account.balance || 0) / limit) * 100 : 0

            return (
              <div key={account.id} className="p-4 border border-gray-200 dark:border-border rounded-xl space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-foreground capitalize">{account.account_type} Account</h3>
                      {getStatusBadge(account.status)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground font-mono">{account.account_number}</p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={
                      tier === "Premium" 
                        ? "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                        : tier === "Gold"
                        ? "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                        : "bg-gray-50 dark:bg-secondary text-gray-600 dark:text-muted-foreground border-gray-200 dark:border-border"
                    }
                  >
                    {tier}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-muted-foreground">Current Balance</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-foreground">
                      ${(account.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {limit > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-muted-foreground">
                        <span>Account Limit</span>
                        <span>${limit.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            usagePercent > 90 ? "bg-red-500 dark:bg-red-600" : usagePercent > 70 ? "bg-yellow-500 dark:bg-yellow-600" : "bg-blue-500 dark:bg-blue-600"
                          }`}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}

        {accounts.length === 0 && (
          <Button variant="outline" className="w-full">
            Open New Account
          </Button>
        )}
      </CardContent>
    </Card>
  )
}