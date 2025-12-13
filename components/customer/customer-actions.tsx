"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, CreditCard, Edit, Lock, Unlock, MessageCircle, Download, HelpCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { downloadCSV, downloadExcel, generatePDF } from "@/lib/export-utils"

export function CustomerActions() {
  const { user } = useAuth()
  const [accountFrozen, setAccountFrozen] = useState(false)
  const [statementDialogOpen, setStatementDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("current-month")
  const [selectedFormat, setSelectedFormat] = useState("pdf")

  const handleSendMoney = () => {
    toast.info("Redirecting to send money page...")
  }

  const handleCardReplacement = () => {
    toast.success("Card replacement request submitted (UI only)")
  }

  const handleAccountUpdate = () => {
    toast.success("Account update request submitted (UI only)")
  }

  const handleToggleFreezeAccount = (checked: boolean) => {
    setAccountFrozen(checked)
    toast.success(`Account ${checked ? "frozen" : "unfrozen"} (UI only)`)
  }

  const handleContactSupport = () => {
    toast.success("Opening support chat (UI only)")
  }

  const getDateRange = (period: string) => {
    const now = new Date()
    const start = new Date()
    
    switch (period) {
      case "current-month":
        start.setDate(1)
        return { startDate: start.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] }
      case "last-month":
        start.setMonth(now.getMonth() - 1)
        start.setDate(1)
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
        return { startDate: start.toISOString().split('T')[0], endDate: lastDay.toISOString().split('T')[0] }
      case "last-3-months":
        start.setMonth(now.getMonth() - 3)
        return { startDate: start.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] }
      case "last-6-months":
        start.setMonth(now.getMonth() - 6)
        return { startDate: start.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] }
      case "current-year":
        start.setMonth(0)
        start.setDate(1)
        return { startDate: start.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] }
      default:
        return { startDate: null, endDate: null }
    }
  }

  const handleDownloadStatement = async () => {
    if (!user?.id) {
      toast.error("Please log in to download statements")
      return
    }

    setLoading(true)
    try {
      const { startDate, endDate } = getDateRange(selectedPeriod)
      
      // Fetch statement data
      const params = new URLSearchParams({
        userId: user.id,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const response = await fetch(`/api/customer/statements?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch statement data')
      }

      const data = await response.json()
      
      if (!data.transactions || data.transactions.length === 0) {
        toast.info("No transactions found for the selected period")
        setStatementDialogOpen(false)
        setLoading(false)
        return
      }

      // Format transactions for export
      const exportData = {
        title: `Account Statement - ${data.user?.name || 'Customer'}`,
        metadata: {
          "Account Holder": data.user?.name || 'N/A',
          "Email": data.user?.email || 'N/A',
          "Period": selectedPeriod.replace('-', ' '),
          "Generated": new Date().toLocaleString(),
          "Total Transactions": data.transactions.length,
          "Total Amount": `$${data.transactions.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0).toLocaleString()}`
        },
        headers: [
          "Date",
          "Account Number",
          "Type",
          "Description",
          "Amount",
          "Balance",
          "Status",
          "Reference"
        ],
        rows: data.transactions.map((t: any) => [
          new Date(t.date).toLocaleString(),
          t.accountNumber,
          t.type,
          t.description,
          t.amount >= 0 ? `+$${Math.abs(t.amount).toLocaleString()}` : `-$${Math.abs(t.amount).toLocaleString()}`,
          `$${t.balance.toLocaleString()}`,
          t.status,
          t.referenceNumber
        ])
      }

      // Generate filename
      const periodName = selectedPeriod.replace('-', '_')
      const dateStr = new Date().toISOString().split('T')[0]
      const filename = `statement_${periodName}_${dateStr}`

      // Download based on format
      switch (selectedFormat) {
        case "csv":
          downloadCSV(exportData, `${filename}.csv`)
          toast.success("Statement downloaded as CSV")
          break
        case "excel":
          downloadExcel(exportData, `${filename}.xls`)
          toast.success("Statement downloaded as Excel")
          break
        case "pdf":
          generatePDF(exportData, `${filename}.pdf`)
          toast.success("Statement generated as PDF")
          break
      }

      setStatementDialogOpen(false)
    } catch (error: any) {
      console.error('Error downloading statement:', error)
      toast.error("Failed to download statement. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Send Money */}
        <Link href="/customer/send-money" className="block">
          <Button variant="outline" className="w-full justify-start border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <Send className="w-4 h-4 mr-2" />
            Send Money
          </Button>
        </Link>

        {/* Request Card Replacement */}
        <Button 
          variant="outline" 
          className="w-full justify-start border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={handleCardReplacement}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Request Card Replacement (UI only)
        </Button>

        {/* Request Account Update */}
        <Button 
          variant="outline" 
          className="w-full justify-start border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={handleAccountUpdate}
        >
          <Edit className="w-4 h-4 mr-2" />
          Request Account Update (UI only)
        </Button>

        {/* Freeze Account Toggle */}
        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            {accountFrozen ? (
              <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
            ) : (
              <Unlock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {accountFrozen ? "Unfreeze Account" : "Freeze Account"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Temporarily disable account access (UI only)</p>
            </div>
          </div>
          <Switch checked={accountFrozen} onCheckedChange={handleToggleFreezeAccount} />
        </div>

        {/* Contact Support */}
        <Button 
          variant="outline" 
          className="w-full justify-start border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={handleContactSupport}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact Support (UI only)
        </Button>

        {/* Download Statements */}
        <Dialog open={statementDialogOpen} onOpenChange={setStatementDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Statements
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-gray-100">Download Account Statement</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Select the period and format for your statement
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Period
                </label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="current-month">Current Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                    <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                    <SelectItem value="current-year">Current Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Format
                </label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleDownloadStatement} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Statement
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
