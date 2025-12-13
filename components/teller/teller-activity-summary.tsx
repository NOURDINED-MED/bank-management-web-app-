"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertTriangle } from "lucide-react"

interface TellerActivitySummaryProps {
  performance: any
  cashDrawer: any
}

export function TellerActivitySummary({ performance, cashDrawer }: TellerActivitySummaryProps) {
  const totalTransactions = (performance?.depositCount || 0) + (performance?.withdrawalCount || 0) + (performance?.transferCount || 0)
  const cashIn = performance?.totalDeposits || 0
  const cashOut = performance?.totalWithdrawals || 0
  const remainingDrawer = cashDrawer?.currentCash || 0
  const errors = performance?.errorCount || 0
  const reversals = 0 // Placeholder

  return (
    <Card className="border border-gray-200 dark:border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Teller Activity Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Transactions */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-secondary border border-gray-200 dark:border-border">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-600 dark:text-muted-foreground" />
            <span className="text-sm font-medium text-gray-900 dark:text-foreground">Total Transactions Today</span>
          </div>
          <Badge variant="outline" className="text-lg font-semibold">
            {totalTransactions}
          </Badge>
        </div>

        {/* Cash In */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-foreground">Cash In</span>
          </div>
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            ${cashIn.toLocaleString()}
          </span>
        </div>

        {/* Cash Out */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-foreground">Cash Out</span>
          </div>
          <span className="text-lg font-bold text-red-600 dark:text-red-400">
            ${cashOut.toLocaleString()}
          </span>
        </div>

        {/* Remaining Drawer */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-foreground">Remaining Drawer</span>
          </div>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            ${remainingDrawer.toLocaleString()}
          </span>
        </div>

        {/* Errors & Reversals */}
        {(errors > 0 || reversals > 0) && (
          <div className="p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Issues</span>
            </div>
            <div className="space-y-1 text-xs text-yellow-700 dark:text-yellow-300">
              {errors > 0 && <div>• {errors} error(s) recorded</div>}
              {reversals > 0 && <div>• {reversals} reversal(s) logged</div>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

