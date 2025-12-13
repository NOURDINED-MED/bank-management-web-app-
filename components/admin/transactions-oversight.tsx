"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowLeftRight, 
  Filter,
  Search,
  AlertTriangle,
  RefreshCw,
  MapPin,
  TrendingDown
} from "lucide-react"

interface Transaction {
  id: string
  customerName: string
  type: "deposit" | "withdrawal" | "transfer" | "loan"
  amount: number
  status: "completed" | "pending" | "failed" | "reversed"
  date: string
  branch?: string
  riskLevel?: "low" | "medium" | "high"
}

interface TransactionsOversightProps {
  transactions: Transaction[]
  onRefresh?: () => void
}

export function TransactionsOversight({ transactions, onRefresh }: TransactionsOversightProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "deposit" | "withdrawal" | "transfer" | "loan">("all")
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "medium" | "low">("all")

  const highRiskTransactions = transactions.filter(t => t.riskLevel === "high" || t.amount > 50000)
  const reversalRequests = transactions.filter(t => t.status === "reversed" || t.status === "failed")

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = typeFilter === "all" || t.type === typeFilter
    const matchesRisk = riskFilter === "all" || t.riskLevel === riskFilter

    return matchesSearch && matchesType && matchesRisk
  })

  return (
    <div className="space-y-6">
      {/* High-Risk Transactions Alert Panel */}
      {highRiskTransactions.length > 0 && (
        <Card className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-red-900 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              High-Risk Transactions Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {highRiskTransactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-white dark:bg-card rounded-lg border border-red-200 dark:border-red-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-foreground">{tx.customerName}</p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground">{tx.type} • {tx.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600 dark:text-red-400">${tx.amount.toLocaleString()}</p>
                      <Badge variant="destructive" className="mt-1">
                        High Risk
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reversal Request List */}
      {reversalRequests.length > 0 && (
        <Card className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-yellow-900 dark:text-yellow-400 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Reversal Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {reversalRequests.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-white dark:bg-card rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-foreground">{tx.customerName}</p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground">{tx.type} • {tx.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-foreground">${tx.amount.toLocaleString()}</p>
                        <Badge variant="secondary" className="mt-1">
                          {tx.status}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Transaction Logs */}
      <Card className="border border-gray-200 dark:border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Full Transaction Logs
              {transactions.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {transactions.length} total
                </Badge>
              )}
            </CardTitle>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="transfer">Transfer</option>
              <option value="loan">Loan</option>
            </select>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>

          {/* Transaction Table */}
          <div className="border border-gray-200 dark:border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-secondary">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Customer</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Type</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Amount</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Status</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Date</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Branch</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-muted-foreground">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-t border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent">
                      <td className="p-3">
                        <p className="font-medium text-gray-900 dark:text-foreground">{tx.customerName}</p>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant="outline"
                          className={
                            tx.type === "deposit" 
                              ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400" 
                              : tx.type === "withdrawal"
                              ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                              : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                          }
                        >
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`font-semibold ${
                          tx.type === "deposit" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }`}>
                          {tx.type === "deposit" ? "+" : "-"}${tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={tx.status === "completed" ? "default" : "secondary"}
                          className={tx.status === "failed" ? "bg-red-500 dark:bg-red-600" : ""}
                        >
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-600 dark:text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {tx.branch || "Main Branch"}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Fraud Detection Alerts Placeholder */}
          <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-gray-50 dark:bg-secondary">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  Fraud Detection Alerts
                </h4>
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">AI-powered fraud detection (UI only)</p>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

