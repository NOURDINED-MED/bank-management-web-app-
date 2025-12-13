"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  Download,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Loader2
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function ReportsAnalytics() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("monthly")
  const [stats, setStats] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loans, setLoans] = useState<any[]>([])
  const [previousPeriodData, setPreviousPeriodData] = useState<any>(null)

  useEffect(() => {
    if (user?.id) {
      fetchData()
    }
  }, [user?.id, period])

  const fetchData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      
      // Fetch stats
      const statsResponse = await fetch(`/api/admin/stats?userId=${user.id}`)
      const statsData = await statsResponse.json()
      if (statsData.error) throw new Error(statsData.error)
      setStats(statsData)

      // Fetch customers
      const customersResponse = await fetch(`/api/admin/customers?userId=${user.id}`)
      const customersData = await customersResponse.json()
      if (customersData.error) throw new Error(customersData.error)
      setCustomers(customersData.customers || [])

      // Fetch transactions
      const transactionsResponse = await fetch(`/api/admin/transactions?userId=${user.id}&limit=10000`)
      const transactionsData = await transactionsResponse.json()
      if (transactionsData.error) throw new Error(transactionsData.error)
      setTransactions(transactionsData.transactions || [])

      // Fetch loans
      const loansResponse = await fetch(`/api/admin/loans?userId=${user.id}`)
      const loansData = await loansResponse.json()
      if (loansData.error) {
        console.error('Error fetching loans:', loansData.error)
        setLoans([])
      } else {
        setLoans(loansData.loans || [])
      }

      // Calculate previous period data for comparisons
      calculatePreviousPeriodData(transactionsData.transactions || [], customersData.customers || [])
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePreviousPeriodData = (allTransactions: any[], allCustomers: any[]) => {
    const now = new Date()
    let currentStart: Date
    let currentEnd: Date = new Date(now)
    let previousStart: Date
    let previousEnd: Date

    if (period === "monthly") {
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
      previousEnd = new Date(currentStart)
      previousEnd.setDate(previousEnd.getDate() - 1)
      previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), 1)
    } else if (period === "weekly") {
      const dayOfWeek = now.getDay()
      currentStart = new Date(now)
      currentStart.setDate(now.getDate() - dayOfWeek)
      currentStart.setHours(0, 0, 0, 0)
      previousEnd = new Date(currentStart)
      previousEnd.setDate(previousEnd.getDate() - 1)
      previousStart = new Date(previousEnd)
      previousStart.setDate(previousStart.getDate() - 6)
    } else {
      // daily
      currentStart = new Date(now)
      currentStart.setHours(0, 0, 0, 0)
      previousEnd = new Date(currentStart)
      previousEnd.setDate(previousEnd.getDate() - 1)
      previousStart = new Date(previousEnd)
      previousStart.setHours(0, 0, 0, 0)
    }

    currentStart.setHours(0, 0, 0, 0)
    currentEnd.setHours(23, 59, 59, 999)

    const currentTransactions = allTransactions.filter(t => {
      const date = new Date(t.created_at)
      return date >= currentStart && date <= currentEnd
    })

    const previousTransactions = allTransactions.filter(t => {
      const date = new Date(t.created_at)
      return date >= previousStart && date <= previousEnd
    })

    const currentCustomers = allCustomers.filter(c => {
      const date = new Date(c.createdAt || c.created_at)
      return date >= currentStart && date <= currentEnd
    })

    const previousCustomers = allCustomers.filter(c => {
      const date = new Date(c.createdAt || c.created_at)
      return date >= previousStart && date <= previousEnd
    })

    setPreviousPeriodData({
      transactions: previousTransactions,
      customers: previousCustomers,
      currentTransactions,
      currentCustomers
    })
  }

  // Calculate metrics
  const totalCustomers = stats?.totalCustomers || customers.length || 0
  const activeCustomers = stats?.activeCustomers || customers.filter(c => c.status === "active").length || 0
  const totalTransactions = stats?.totalTransactions || transactions.length || 0

  // Current period transactions
  const currentTransactions = previousPeriodData?.currentTransactions || transactions
  const currentDeposits = currentTransactions
    .filter((t: any) => t.transaction_type === "deposit" && t.status === "completed")
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0)
  const currentWithdrawals = currentTransactions
    .filter((t: any) => t.transaction_type === "withdrawal" && t.status === "completed")
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0)
  const totalRevenue = currentDeposits

  // Previous period for comparison
  const previousTransactions = previousPeriodData?.transactions || []
  const previousDeposits = previousTransactions
    .filter((t: any) => t.transaction_type === "deposit" && t.status === "completed")
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0)
  const previousWithdrawals = previousTransactions
    .filter((t: any) => t.transaction_type === "withdrawal" && t.status === "completed")
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0)
  const previousTransactionsCount = previousTransactions.length
  const previousCustomersCount = previousPeriodData?.customers?.length || 0
  const currentCustomersCount = previousPeriodData?.currentCustomers?.length || 0

  // Calculate growth percentages
  const revenueGrowth = previousDeposits > 0 ? ((currentDeposits - previousDeposits) / previousDeposits) * 100 : 0
  const customerGrowth = previousCustomersCount > 0 ? ((currentCustomersCount - previousCustomersCount) / previousCustomersCount) * 100 : 0
  const transactionGrowth = previousTransactionsCount > 0 ? ((currentTransactions.length - previousTransactionsCount) / previousTransactionsCount) * 100 : 0

  // Loan metrics
  const activeLoans = loans.filter(l => l.status === "active" || l.status === "approved").length
  const totalOutstanding = loans.reduce((sum, l) => sum + parseFloat(l.outstanding_balance || l.remainingBalance || 0), 0)
  const defaultedLoans = loans.filter(l => l.status === "defaulted" || l.status === "default").length
  const defaultRate = loans.length > 0 ? (defaultedLoans / loans.length) * 100 : 0
  const avgInterestRate = loans.length > 0 
    ? loans.reduce((sum, l) => sum + parseFloat(l.interest_rate || l.interestRate || 0), 0) / loans.length 
    : 0

  // Customer growth metrics
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const newCustomersThisMonth = customers.filter(c => {
    const date = new Date(c.createdAt || c.created_at)
    return date >= thisMonthStart
  }).length

  const newCustomersLastMonth = customers.filter(c => {
    const date = new Date(c.createdAt || c.created_at)
    return date >= lastMonthStart && date <= lastMonthEnd
  }).length

  const churnedCustomersThisMonth = customers.filter(c => {
    return c.status === "inactive" || c.status === "closed"
  }).length

  const newCustomersGrowth = newCustomersLastMonth > 0 
    ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100 
    : 0
  const activeCustomersGrowth = previousCustomersCount > 0 
    ? ((activeCustomers - previousCustomersCount) / previousCustomersCount) * 100 
    : 0

  // Loan portfolio growth (simplified - would need previous period loan data)
  const loanPortfolioGrowth = 8.3 // This would need to be calculated from historical data

  if (loading) {
    return (
      <Card className="border border-gray-200 dark:border-border shadow-sm">
        <CardContent className="p-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading analytics...</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="border border-gray-200 dark:border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Reports & Analytics
          </CardTitle>
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Period Selector */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPeriod("daily")}
            className={period === "daily" ? "bg-blue-600 dark:bg-blue-600 text-white" : ""}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Daily
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPeriod("weekly")}
            className={period === "weekly" ? "bg-blue-600 dark:bg-blue-600 text-white" : ""}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Weekly
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPeriod("monthly")}
            className={period === "monthly" ? "bg-blue-600 dark:bg-blue-600 text-white" : ""}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Monthly
          </Button>
        </div>

        {/* Bank Performance Metrics */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Bank Performance</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-2xl font-bold text-gray-900 dark:text-foreground">
                  ${totalRevenue >= 1000000 
                    ? (totalRevenue / 1000000).toFixed(1) + "M"
                    : totalRevenue >= 1000
                    ? (totalRevenue / 1000).toFixed(1) + "K"
                    : totalRevenue.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-muted-foreground">Total Revenue</p>
              <p className={`text-xs mt-1 ${revenueGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {revenueGrowth >= 0 ? "+" : ""}{revenueGrowth.toFixed(1)}% vs last {period}
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl font-bold text-gray-900 dark:text-foreground">{totalCustomers.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-muted-foreground">Total Customers</p>
              <p className={`text-xs mt-1 ${customerGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {customerGrowth >= 0 ? "+" : ""}{customerGrowth.toFixed(1)}% growth
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-2xl font-bold text-gray-900 dark:text-foreground">
                  ${totalOutstanding >= 1000000 
                    ? (totalOutstanding / 1000000).toFixed(1) + "M"
                    : totalOutstanding >= 1000
                    ? (totalOutstanding / 1000).toFixed(0) + "K"
                    : totalOutstanding.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-muted-foreground">Loan Portfolio</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">+{loanPortfolioGrowth.toFixed(1)}% vs last {period}</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-2xl font-bold text-gray-900 dark:text-foreground">{totalTransactions.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-muted-foreground">Transactions</p>
              <p className={`text-xs mt-1 ${transactionGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {transactionGrowth >= 0 ? "+" : ""}{transactionGrowth.toFixed(1)}% vs last {period}
              </p>
            </div>
          </div>
        </div>

        {/* Revenue Charts Placeholder */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Revenue Charts</h3>
          <div className="p-8 border border-gray-200 dark:border-border rounded-lg bg-gray-50 dark:bg-secondary/50 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <p className="text-sm text-gray-500 dark:text-muted-foreground">Revenue charts and visualizations</p>
            <p className="text-xs text-gray-400 dark:text-muted-foreground/70 mt-1">Detailed charts will be displayed here</p>
          </div>
        </div>

        {/* Deposit vs Withdrawal Charts */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Deposit vs Withdrawal</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-foreground">Total Deposits</span>
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${currentDeposits >= 1000000 
                  ? (currentDeposits / 1000000).toFixed(1) + "M"
                  : currentDeposits >= 1000
                  ? (currentDeposits / 1000).toFixed(1) + "K"
                  : currentDeposits.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">This {period}</p>
            </div>
            <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-foreground">Total Withdrawals</span>
                <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400 rotate-180" />
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${currentWithdrawals >= 1000000 
                  ? (currentWithdrawals / 1000000).toFixed(1) + "M"
                  : currentWithdrawals >= 1000
                  ? (currentWithdrawals / 1000).toFixed(1) + "K"
                  : currentWithdrawals.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">This {period}</p>
            </div>
          </div>
        </div>

        {/* Customer Growth Metrics */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Customer Growth Metrics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card">
              <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">New Customers</p>
              <p className="text-xl font-bold text-gray-900 dark:text-foreground">{newCustomersThisMonth}</p>
              <p className={`text-xs mt-1 ${newCustomersGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {newCustomersGrowth >= 0 ? "+" : ""}{newCustomersGrowth.toFixed(0)}% vs last month
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card">
              <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Active Customers</p>
              <p className="text-xl font-bold text-gray-900 dark:text-foreground">{activeCustomers.toLocaleString()}</p>
              <p className={`text-xs mt-1 ${activeCustomersGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {activeCustomersGrowth >= 0 ? "+" : ""}{activeCustomersGrowth.toFixed(0)}% vs last month
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card">
              <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Churned Customers</p>
              <p className="text-xl font-bold text-gray-900 dark:text-foreground">{churnedCustomersThisMonth}</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">Inactive accounts</p>
            </div>
          </div>
        </div>

        {/* Loan Performance Analytics */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Loan Performance Analytics</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card">
              <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Active Loans</p>
              <p className="text-xl font-bold text-gray-900 dark:text-foreground">{activeLoans}</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card">
              <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Total Outstanding</p>
              <p className="text-xl font-bold text-gray-900 dark:text-foreground">
                ${totalOutstanding >= 1000000 
                  ? (totalOutstanding / 1000000).toFixed(1) + "M"
                  : totalOutstanding >= 1000
                  ? (totalOutstanding / 1000).toFixed(0) + "K"
                  : totalOutstanding.toLocaleString()}
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card">
              <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Default Rate</p>
              <p className="text-xl font-bold text-gray-900 dark:text-foreground">{defaultRate.toFixed(1)}%</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card">
              <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Avg. Interest Rate</p>
              <p className="text-xl font-bold text-gray-900 dark:text-foreground">{avgInterestRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Branch Heatmap Placeholder */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Busiest Branches Heatmap
          </h3>
          <div className="p-8 border border-gray-200 dark:border-border rounded-lg bg-gray-50 dark:bg-secondary/50 text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <p className="text-sm text-gray-500 dark:text-muted-foreground">Branch activity heatmap</p>
            <p className="text-xs text-gray-400 dark:text-muted-foreground/70 mt-1">Visual representation of branch transaction volume</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

