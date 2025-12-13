"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Unlock, 
  Edit,
  AlertTriangle,
  TrendingUp,
  Shield
} from "lucide-react"
import type { Customer } from "@/lib/types"

interface AccountManagementProps {
  customers: Customer[]
  onUpdateAccount?: (account: Customer) => void
}

export function AccountManagement({ customers, onUpdateAccount }: AccountManagementProps) {
  const pendingAccounts = customers.filter(c => (c.status as string) === "pending")

  const getRiskLevel = (customer: Customer) => {
    if (customer.balance < 0) return { level: "high", color: "red" }
    if (customer.balance > 100000) return { level: "medium", color: "yellow" }
    return { level: "low", color: "green" }
  }

  return (
    <Card className="border border-gray-200 dark:border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Account Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pending Account Requests */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Pending Account Requests</h3>
          {pendingAccounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-muted-foreground" />
              <p>No pending account requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAccounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-foreground">{account.name}</p>
                      <p className="text-sm text-gray-500 dark:text-muted-foreground">{account.email}</p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">Account: {account.accountNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800">
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Accounts Table */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">All Accounts</h3>
          <div className="border border-gray-200 dark:border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-secondary">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Account</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Customer</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Balance</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Status</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Risk Level</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-900 dark:text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-muted-foreground">
                      No accounts found
                    </td>
                  </tr>
                ) : (
                  customers.slice(0, 10).map((account) => {
                    const risk = getRiskLevel(account)
                    return (
                      <tr key={account.id} className="border-t border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent">
                        <td className="p-3">
                          <span className="font-mono text-sm text-gray-900 dark:text-foreground">{account.accountNumber}</span>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-foreground">{account.name}</p>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground">{account.accountType}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-gray-900 dark:text-foreground">${account.balance.toLocaleString()}</span>
                        </td>
                        <td className="p-3">
                          <Badge 
                            variant={account.status === "active" ? "default" : "secondary"}
                            className={(account.status as string) === "frozen" ? "bg-red-500 dark:bg-red-600" : ""}
                          >
                            {account.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge 
                            variant="outline"
                            className={`${
                              risk.color === "red" 
                                ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" 
                                : risk.color === "yellow"
                                ? "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                                : "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                            }`}
                          >
                            <AlertTriangle className={`w-3 h-3 mr-1 ${risk.color === "green" ? "hidden" : ""}`} />
                            {risk.level.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            {account.status === "active" ? (
                              <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400" title="Close Account">
                                <Lock className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400" title="Open Account">
                                <Unlock className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Account Limits Editor Placeholder */}
        <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-gray-50 dark:bg-secondary">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-foreground">Edit Account Limits</h4>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">Configure daily transaction limits (UI only)</p>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

