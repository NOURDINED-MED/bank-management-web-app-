"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockTransactions, mockCustomers } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, Download, Filter, BarChart3, FileText, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { formatTransactionsForExport, formatCustomersForExport, downloadCSV, downloadExcel, generatePDF } from "@/lib/export-utils"
import { useState } from "react"

export default function ReportsPage() {
  const [autoReportEnabled, setAutoReportEnabled] = useState(false)
  const [reportFrequency, setReportFrequency] = useState<"daily" | "weekly" | "monthly">("weekly")

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const exportData = formatTransactionsForExport(mockTransactions)
    const filename = `transactions-report-${new Date().toISOString().split('T')[0]}`

    switch (format) {
      case "csv":
        downloadCSV(exportData, `${filename}.csv`)
        break
      case "excel":
        downloadExcel(exportData, `${filename}.xls`)
        break
      case "pdf":
        generatePDF(exportData, `${filename}.pdf`)
        break
    }
  }

  const handleExportCustomers = (format: "csv" | "excel" | "pdf") => {
    const exportData = formatCustomersForExport(mockCustomers)
    const filename = `customers-report-${new Date().toISOString().split('T')[0]}`

    switch (format) {
      case "csv":
        downloadCSV(exportData, `${filename}.csv`)
        break
      case "excel":
        downloadExcel(exportData, `${filename}.xls`)
        break
      case "pdf":
        generatePDF(exportData, `${filename}.pdf`)
        break
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowUpRight className="w-5 h-5" />
      case "withdrawal":
        return <ArrowDownRight className="w-5 h-5" />
      default:
        return <ArrowUpRight className="w-5 h-5" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "bg-green-500/10 text-green-600"
      case "withdrawal":
        return "bg-red-500/10 text-red-600"
      case "payment":
        return "bg-blue-500/10 text-blue-600"
      default:
        return "bg-gray-500/10 text-gray-600"
    }
  }

  const totalDeposits = mockTransactions.filter(t => t.type === "deposit").reduce((sum, t) => sum + t.amount, 0)
  const totalWithdrawals = mockTransactions.filter(t => t.type === "withdrawal").reduce((sum, t) => sum + t.amount, 0)
  const netFlow = totalDeposits - totalWithdrawals

  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin", "manager", "auditor"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold text-balance">Reports & Exports</h1>
              <p className="text-muted-foreground mt-2">Generate, schedule, and export comprehensive reports</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/analytics">
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Transactions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport("csv")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("excel")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Export Customers
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExportCustomers("csv")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportCustomers("excel")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportCustomers("pdf")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Deposits</p>
                    <p className="text-3xl font-bold text-green-600">${totalDeposits.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">{mockTransactions.filter(t => t.type === "deposit").length} transactions</p>
                  </div>
                  <div className="bg-green-500/10 text-green-600 p-3 rounded-lg">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Withdrawals</p>
                    <p className="text-3xl font-bold text-red-600">${totalWithdrawals.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">{mockTransactions.filter(t => t.type === "withdrawal").length} transactions</p>
                  </div>
                  <div className="bg-red-500/10 text-red-600 p-3 rounded-lg">
                    <ArrowDownRight className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Net Flow</p>
                    <p className={`text-3xl font-bold ${netFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {netFlow >= 0 ? "+" : ""}${netFlow.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">This period</p>
                  </div>
                  <div className={`${netFlow >= 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"} p-3 rounded-lg`}>
                    <BarChart3 className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scheduled Reports */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Scheduled Automatic Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Switch 
                      checked={autoReportEnabled} 
                      onCheckedChange={setAutoReportEnabled}
                    />
                    <div>
                      <Label className="font-semibold">Enable Automatic Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically generate and email reports on schedule
                      </p>
                    </div>
                  </div>
                  {autoReportEnabled && (
                    <div className="flex gap-2">
                      <Button 
                        variant={reportFrequency === "daily" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setReportFrequency("daily")}
                      >
                        Daily
                      </Button>
                      <Button 
                        variant={reportFrequency === "weekly" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setReportFrequency("weekly")}
                      >
                        Weekly
                      </Button>
                      <Button 
                        variant={reportFrequency === "monthly" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setReportFrequency("monthly")}
                      >
                        Monthly
                      </Button>
                    </div>
                  )}
                </div>

                {autoReportEnabled && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Next Report:</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reportFrequency === "daily" ? "Tomorrow at 9:00 AM" : 
                       reportFrequency === "weekly" ? "Next Monday at 9:00 AM" :
                       "1st of next month at 9:00 AM"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 py-3 px-4 border-b font-medium text-sm text-muted-foreground">
                  <div className="col-span-2">Transaction ID</div>
                  <div className="col-span-2">Customer</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Teller</div>
                </div>

                {/* Transactions */}
                {mockTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="grid grid-cols-12 gap-4 py-4 px-4 border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <div className="col-span-2 font-mono text-sm">{transaction.id}</div>
                    <div className="col-span-2">
                      <p className="font-medium">{transaction.customerName}</p>
                      <p className="text-xs text-muted-foreground">{transaction.description}</p>
                    </div>
                    <div className="col-span-2">
                      <Badge className={getTransactionColor(transaction.type)}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <p className={`font-bold ${transaction.type === "deposit" ? "text-green-600" : "text-red-600"}`}>
                        {transaction.type === "deposit" ? "+" : "-"}${transaction.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="col-span-2 text-sm">
                      <p>{new Date(transaction.date).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleTimeString()}</p>
                    </div>
                    <div className="col-span-2 text-sm">
                      {transaction.tellerName ? (
                        <p>{transaction.tellerName}</p>
                      ) : (
                        <p className="text-muted-foreground">Online</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
