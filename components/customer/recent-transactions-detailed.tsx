"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { History, ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { getTransactionTypeLabel, getTransactionStatusLabel } from "@/lib/translation-helpers"

interface Transaction {
  id: string
  type: string
  amount: number
  balance: number
  description: string
  date: string
  status: string
}

interface RecentTransactionsDetailedProps {
  transactions: Transaction[]
  limit?: number
}

export function RecentTransactionsDetailed({ transactions, limit = 10 }: RecentTransactionsDetailedProps) {
  const { t } = useTranslation('common')
  
  const recentTransactions = transactions.slice(0, limit)

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowUpRight className="w-4 h-4" />
      case "withdrawal":
        return <ArrowDownRight className="w-4 h-4" />
      case "transfer":
        return <ArrowLeftRight className="w-4 h-4" />
      default:
        return <ArrowLeftRight className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const translatedStatus = getTransactionStatusLabel(status, t)
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 text-white text-xs">{translatedStatus}</Badge>
      case "pending":
        return <Badge className="bg-yellow-500 text-white text-xs">{translatedStatus}</Badge>
      case "failed":
        return <Badge className="bg-red-500 text-white text-xs">{translatedStatus}</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{translatedStatus}</Badge>
    }
  }

  return (
    <Card className="border border-gray-200 dark:border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-muted-foreground text-center py-8">No transactions yet</p>
          ) : (
            recentTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-start justify-between p-3 rounded-lg border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    transaction.type === "deposit" 
                      ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400" 
                      : transaction.type === "transfer"
                      ? "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400"
                      : "bg-gray-100 dark:bg-secondary text-gray-700 dark:text-muted-foreground"
                  }`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-foreground truncate">
                      {transaction.description || getTransactionTypeLabel(transaction.type, t)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-gray-300 dark:border-border">
                        {getTransactionTypeLabel(transaction.type, t)}
                      </Badge>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">
                      {new Date(transaction.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className={`text-sm font-semibold ${
                    transaction.type === "deposit" 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-gray-900 dark:text-foreground"
                  }`}>
                    {transaction.type === "deposit" ? "+" : "-"}${(transaction.amount || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">
                    Balance: ${(transaction.balance || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        <Link href="/customer/transactions">
          <Button variant="outline" className="w-full mt-4 border-gray-300 dark:border-border text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-accent">
            View All Transactions
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}