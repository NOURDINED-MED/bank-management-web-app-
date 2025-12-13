"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock, DollarSign, Shield, TrendingDown } from "lucide-react"
import type { Customer } from "@/lib/types"

interface LiveAccountStatusProps {
  customer: Customer | null
  pendingTransactions?: any[]
}

export function LiveAccountStatus({ customer, pendingTransactions = [] }: LiveAccountStatusProps) {
  if (!customer) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Live Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Select a customer to view account status</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasOverdraft = customer.balance < 0
  const dailyLimit = 10000
  const pendingCount = pendingTransactions?.length || 0
  const hasAlerts = hasOverdraft || pendingCount > 0

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Live Account Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Balance */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Current Balance</span>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className={`text-3xl font-bold ${hasOverdraft ? 'text-red-600' : 'text-gray-900'}`}>
            ${customer.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {hasOverdraft && (
            <div className="flex items-center gap-2 mt-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600 font-medium">Overdraft Alert</span>
            </div>
          )}
        </div>

        {/* Pending Transactions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Pending Transactions</span>
            <Badge variant={pendingCount > 0 ? "secondary" : "outline"}>
              {pendingCount}
            </Badge>
          </div>
          {pendingCount > 0 && (
            <div className="text-xs text-yellow-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {pendingCount} transaction(s) pending approval
            </div>
          )}
        </div>

        {/* Overdraft Status */}
        <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Overdraft Status</span>
            {hasOverdraft ? (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Overdrawn
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Clear
              </Badge>
            )}
          </div>
        </div>

        {/* Daily Transaction Limit */}
        <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700">Daily Transaction Limit</span>
            <span className="text-sm font-medium text-gray-900">${dailyLimit.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((customer.balance / dailyLimit) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Flags & Alerts */}
        {hasAlerts && (
          <div className="p-3 rounded-lg border border-yellow-200 bg-yellow-50">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">Account Alerts</p>
                <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                  {hasOverdraft && <li>• Account is overdrawn</li>}
                  {pendingCount > 0 && <li>• {pendingCount} pending transaction(s)</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}