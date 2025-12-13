"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Wallet, 
  CheckCircle, 
  Lock, 
  XCircle,
  TrendingUp,
  CreditCard
} from "lucide-react"

interface Account {
  id: string
  accountNumber: string
  accountType: string
  balance: number
  limit?: number
  status: "active" | "frozen" | "closed"
  tier?: "Basic" | "Gold" | "Premium"
}

interface AccountSummaryEnhancedProps {
  accounts: Account[]
}

export function AccountSummaryEnhanced({ accounts }: AccountSummaryEnhancedProps) {
  const tierColors = {
    Basic: "bg-gray-50 text-gray-600 border-gray-200",
    Gold: "bg-yellow-50 text-yellow-600 border-yellow-200",
    Premium: "bg-purple-50 text-purple-600 border-purple-200"
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-600" />
          Account Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No accounts found</p>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 capitalize">{account.accountType}</h4>
                    {account.tier && (
                      <Badge variant="outline" className={tierColors[account.tier]}>
                        {account.tier}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-mono">{account.accountNumber}</p>
                </div>
                <Badge 
                  variant={account.status === "active" ? "default" : "secondary"}
                  className={
                    account.status === "frozen" 
                      ? "bg-red-500" 
                      : account.status === "closed"
                      ? "bg-gray-500"
                      : "bg-green-500"
                  }
                >
                  {account.status === "active" ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : account.status === "frozen" ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Frozen
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Closed
                    </>
                  )}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Balance</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${account.balance.toLocaleString()}
                  </span>
                </div>
                {account.limit && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account Limit</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${account.limit.toLocaleString()}
                    </span>
                  </div>
                )}
                {account.limit && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (account.balance / account.limit) * 100 > 80 
                          ? "bg-red-500" 
                          : (account.balance / account.limit) * 100 > 50
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min((account.balance / account.limit) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
