"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ArrowUpRight, ArrowDownRight, CreditCard, Wallet, Eye, EyeOff, TrendingUp, TrendingDown, BarChart3, PieChart, History, FileText, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { BudgetAnalytics } from "@/components/customer/budget-analytics"
import { SavingsGoals } from "@/components/customer/savings-goals"
import { UpcomingBills } from "@/components/customer/upcoming-bills"
import { NotificationsCenter } from "@/components/customer/notifications-center"
import { QuickActions } from "@/components/customer/quick-actions"
import { ActivityTimeline } from "@/components/customer/activity-timeline"
import { FinancialInsights } from "@/components/customer/financial-insights"
import { DashboardCustomizer, type DashboardCard } from "@/components/customer/dashboard-customizer"
import { Progress } from "@/components/ui/progress"
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Pie, Cell } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomerOverview } from "@/components/customer/customer-overview"
import { AccountSummaryDetailed } from "@/components/customer/account-summary-detailed"
import { CardsOverviewDetailed } from "@/components/customer/cards-overview-detailed"
import { RecentTransactionsDetailed } from "@/components/customer/recent-transactions-detailed"
import { SpendingInsights } from "@/components/customer/spending-insights"
import { LoansPayments } from "@/components/customer/loans-payments"
import { CustomerActivityInteractions } from "@/components/customer/customer-activity-interactions"
import { SecuritySettings } from "@/components/customer/security-settings"
import { CustomerActions } from "@/components/customer/customer-actions"
import { CustomerMessages } from "@/components/customer/customer-messages"

interface AccountData {
  user: {
    id: string
    email: string
    full_name: string
    phone: string
    role: string
    kyc_status: string
  }
  primaryAccount: {
    id: string
    account_number: string
    account_type: string
    balance: number
    status: string
  } | null
  totalBalance: number
}

interface Transaction {
  id: string
  type: string
  amount: number
  balance: number
  description: string
  date: string
  status: string
}

export default function CustomerDashboard() {
  const { user, isLoadingSession } = useAuth()
  const router = useRouter()
  const [showBalance, setShowBalance] = useState(true)
  const [accountData, setAccountData] = useState<AccountData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const { t } = useTranslation('common')

  // Redirect admins and tellers to their appropriate dashboards
  useEffect(() => {
    if (isLoadingSession) return
    
    if (user?.role) {
      console.log('🔍 [Customer Page] User role check:', {
        role: user.role,
        userId: user.id,
        email: user.email,
        name: user.name
      })
      
      if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'manager') {
        console.log('🔄 [Customer Page] Redirecting admin to /admin - role detected:', user.role)
        router.replace('/admin')
        return
      } else if (user.role === 'teller') {
        console.log('🔄 [Customer Page] Redirecting teller to /teller')
        router.replace('/teller')
        return
      }
    }
  }, [user, isLoadingSession, router])

  useEffect(() => {
    if (user?.id && (user.role === 'customer' || !user.role)) {
      setInitialLoad(false)
      fetchAccountData()
      fetchTransactions()
    } else if (user === null) {
      setInitialLoad(false)
      setLoading(false)
    }
  }, [user])

  const fetchAccountData = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      console.log('🔵 Fetching account data for user:', user.id)
      const response = await fetch(`/api/customer/account?userId=${user.id}`)
      const data = await response.json()
      console.log('🔵 Account data response:', data)
      if (data.error) throw new Error(data.error)
      setAccountData(data)
    } catch (error) {
      console.error('🔴 Error fetching account data:', error)
      setAccountData(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    if (!user?.id) return
    try {
      const response = await fetch(`/api/customer/transactions?userId=${user.id}&limit=100`)
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      console.log('🔵 Fetched transactions:', data.transactions?.length || 0, 'transactions')
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('🔴 Error fetching transactions:', error)
      setTransactions([])
    }
  }

  // Initialize dashboard layout
  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>([
    { id: "balance", title: "Account Balance", visible: true, order: 0 },
    { id: "stats", title: "Monthly Stats", visible: true, order: 1 },
    { id: "quick-actions", title: "Quick Actions", visible: true, order: 2 },
    { id: "budget", title: "Budget & Spending", visible: true, order: 3 },
    { id: "savings", title: "Savings & Goals", visible: true, order: 4 },
    { id: "bills", title: "Upcoming Bills", visible: true, order: 5 },
    { id: "notifications", title: "Notifications", visible: true, order: 6 },
    { id: "insights", title: "Financial Insights", visible: true, order: 7 },
    { id: "activity", title: "Recent Activity", visible: true, order: 8 },
    { id: "transactions", title: "Recent Transactions", visible: true, order: 9 }
  ])

  // Load saved layout from localStorage
  useEffect(() => {
    if (user?.id) {
      const savedLayout = localStorage.getItem(`dashboard-layout-${user.id}`)
      if (savedLayout) {
        try {
          setDashboardCards(JSON.parse(savedLayout))
        } catch (e) {
          console.error("Failed to load saved layout", e)
        }
      }
    }
  }, [user?.id])

  const handleUpdateLayout = (newCards: DashboardCard[]) => {
    setDashboardCards(newCards)
    if (user?.id) {
      localStorage.setItem(`dashboard-layout-${user.id}`, JSON.stringify(newCards))
    }
  }

  // Get real transactions
  const recentTransactions = transactions.slice(0, 10)

  // Filter this month's transactions
  const thisMonthTransactions = (transactions || []).filter((t) => {
    if (!t) return false
    const dateStr = t.date
    if (!dateStr) return false
    try {
      const txDate = new Date(dateStr)
      const now = new Date()
      return txDate.getMonth() === now.getMonth() && 
             txDate.getFullYear() === now.getFullYear() &&
             !isNaN(txDate.getTime())
    } catch {
      return false
    }
  })

  // Calculate totals
  const totalDeposits = thisMonthTransactions
    .filter((t) => t?.type === "deposit")
    .reduce((sum, t) => {
      const amount = typeof t?.amount === 'string' ? parseFloat(t.amount) : (t?.amount || 0)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  
  const totalWithdrawals = thisMonthTransactions
    .filter((t) => t?.type === "withdrawal" || t?.type === "payment")
    .reduce((sum, t) => {
      const amount = typeof t?.amount === 'string' ? parseFloat(t.amount) : (t?.amount || 0)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)

  const depositsCount = thisMonthTransactions.filter((t) => t?.type === "deposit").length
  const withdrawalsCount = thisMonthTransactions.filter((t) => t?.type === "withdrawal" || t?.type === "payment").length
  const transfersCount = thisMonthTransactions.filter((t) => t?.type === "transfer").length

  // Mock data for charts (using real transaction data when available)
  const spendAnalysisData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dayTransactions = thisMonthTransactions.filter(t => {
      const txDate = new Date(t.date)
      return txDate.toDateString() === date.toDateString()
    })
    const daySpending = dayTransactions
      .filter(t => t.type === "withdrawal" || t.type === "payment")
      .reduce((sum, t) => sum + (typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount || 0), 0)
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: daySpending || Math.random() * 500
    }
  })

  const expensesData = [
    { name: "Shopping", value: totalWithdrawals * 0.3, color: "#3b82f6" },
    { name: "Bills", value: totalWithdrawals * 0.25, color: "#8b5cf6" },
    { name: "Food", value: totalWithdrawals * 0.2, color: "#10b981" },
    { name: "Transport", value: totalWithdrawals * 0.15, color: "#f59e0b" },
    { name: "Other", value: totalWithdrawals * 0.1, color: "#ef4444" }
  ].filter(item => item.value > 0)

  // Last 10 interactions
  const lastInteractions = recentTransactions.slice(0, 10).map((tx, idx) => ({
    id: tx.id,
    type: tx.type,
    description: tx.description || tx.type,
    date: tx.date,
    amount: tx.amount,
    status: tx.status
  }))

  // Calculate credit usage and score
  const creditUsage = 0
  const creditLimit = 10000
  const usagePercent = (creditUsage / creditLimit) * 100
  const creditScore = 750

  // Show loading only while fetching account data for the first time
  if (loading && !accountData && user?.id) {
    return (
      <ProtectedRoute allowedRoles={["customer"]}>
        <div className="min-h-screen bg-white dark:bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px]">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-2">
              Welcome back, {accountData?.user?.full_name?.split(" ")[0] || user?.name?.split(" ")[0] || 'User'}!
            </h1>
            <p className="text-gray-600 dark:text-muted-foreground">
              Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Three-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN - Account Summary, Cards, Score, Quick Links */}
            <div className="lg:col-span-3 space-y-6">
              {/* Account Summary Card */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">Account Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1 uppercase tracking-wide">Current Balance</p>
                    <div className="flex items-center gap-2">
                      {showBalance ? (
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-foreground">
                          ${accountData?.totalBalance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) || '0.00'}
                        </h3>
                      ) : (
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-foreground">••••••</h3>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowBalance(!showBalance)}
                        className="h-8 w-8 text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground"
                      >
                        {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-border space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Account Number</p>
                      <p className="font-mono text-sm font-medium text-gray-900 dark:text-foreground">{accountData?.primaryAccount?.account_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Account Type</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-foreground capitalize">{accountData?.primaryAccount?.account_type || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Credit Score Card */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">Credit Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 rounded-full border-8 border-blue-100 dark:border-blue-900/30 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{creditScore}</p>
                          <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">Good</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Progress value={75} className="h-2 mb-2" />
                  <p className="text-xs text-center text-gray-500 dark:text-muted-foreground">Based on payment history</p>
                </CardContent>
              </Card>

              {/* Cards Overview */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">Cards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl text-white">
                    <div className="flex items-center justify-between mb-4">
                      <CreditCard className="w-6 h-6" />
                      <span className="text-xs opacity-90">VISA</span>
                    </div>
                    <p className="text-xs opacity-90 mb-1">Card Number</p>
                    <p className="font-mono text-lg font-semibold mb-4">**** **** **** 1234</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs opacity-90">Expires</p>
                        <p className="text-sm font-medium">12/26</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-90">Usage</p>
                        <p className="text-sm font-medium">{usagePercent.toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-2">Credit Usage</p>
                    <Progress value={usagePercent} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-muted-foreground mt-1">
                      <span>${creditUsage.toLocaleString()}</span>
                      <span>${creditLimit.toLocaleString()} limit</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/customer/send-money" className="block">
                      <div className="p-4 border border-gray-200 dark:border-border rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-lg">
                            <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-foreground">Send Money</p>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground">Transfer to another account</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/customer/cards" className="block">
                      <div className="p-4 border border-gray-200 dark:border-border rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-lg">
                            <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-foreground">Cards</p>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground">Manage your cards</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/customer/statements" className="block">
                      <div className="p-4 border border-gray-200 dark:border-border rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-foreground">Statements</p>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground">View account statements</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CENTER COLUMN - Balance Overview, KPIs, Charts, Interactions */}
            <div className="lg:col-span-6 space-y-6">
              {/* Balance Overview Card */}
              <Card className="border-0 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-3">Total Balance</p>
                      {showBalance ? (
                        <h2 className="text-5xl font-bold tracking-tight">
                          ${accountData?.totalBalance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) || '0.00'}
                        </h2>
                      ) : (
                        <h2 className="text-5xl font-bold tracking-tight">••••••</h2>
                      )}
                    </div>
                    <div className="bg-white/20 p-4 rounded-2xl">
                      <Wallet className="w-8 h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KPI Widgets */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border border-gray-200 dark:border-border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-lg">
                        <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Deposits</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-foreground">${totalDeposits.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">{depositsCount} transactions</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-gray-100 dark:bg-secondary p-2 rounded-lg">
                        <ArrowDownRight className="w-5 h-5 text-gray-700 dark:text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Spending</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-foreground">${totalWithdrawals.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">{withdrawalsCount} transactions</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-lg">
                        <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Transactions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{transactions.length}</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">All time</p>
                  </CardContent>
                </Card>
              </div>

              {/* Spend Analysis Chart */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Spend Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={spendAnalysisData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />
                      <XAxis dataKey="date" stroke="#9ca3af" className="dark:stroke-gray-400" fontSize={12} />
                      <YAxis stroke="#9ca3af" className="dark:stroke-gray-400" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--foreground)'
                        }}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} className="dark:stroke-blue-500 dark:fill-blue-500" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Expenses Breakdown Chart */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    All Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPieChart>
                        <Pie
                          data={expensesData.length > 0 ? expensesData : [{ name: "No Data", value: 1, color: "#e5e7eb" }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {expensesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            color: 'var(--foreground)'
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {expensesData.length > 0 ? expensesData.map((expense, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: expense.color }} />
                            <span className="text-sm text-gray-700 dark:text-foreground">{expense.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-foreground">${expense.value.toFixed(0)}</span>
                        </div>
                      )) : (
                        <p className="text-sm text-gray-500 dark:text-muted-foreground">No expense data available</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Last 10 Interactions */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Last 10 Interactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lastInteractions.length > 0 ? lastInteractions.map((interaction) => (
                      <div key={interaction.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            interaction.type === "deposit" ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-secondary text-gray-700 dark:text-muted-foreground"
                          }`}>
                            {interaction.type === "deposit" ? (
                              <ArrowUpRight className="w-5 h-5" />
                            ) : (
                              <ArrowDownRight className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-foreground">{interaction.description}</p>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground">{new Date(interaction.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${interaction.type === "deposit" ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-foreground"}`}>
                            {interaction.type === "deposit" ? "+" : "-"}${interaction.amount.toLocaleString()}
                          </p>
                          <Badge variant="outline" className="text-xs border-gray-300 dark:border-border">{interaction.type}</Badge>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500 dark:text-muted-foreground text-center py-8">No interactions yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN - Recent Transactions, Customer Journey, Customer Info */}
            <div className="lg:col-span-3 space-y-6">
              {/* Recent Transactions - Sticky */}
              <div className="lg:sticky lg:top-6">
                <Card className="border border-gray-200 dark:border-border shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {recentTransactions.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-muted-foreground text-center py-8">
                          No transactions yet. Your transactions will appear here.
                        </p>
                      ) : (
                        recentTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-start justify-between p-3 rounded-lg border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent transition-colors">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                transaction.type === "deposit" ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-secondary text-gray-700 dark:text-muted-foreground"
                              }`}>
                                {transaction.type === "deposit" ? (
                                  <ArrowUpRight className="w-4 h-4" />
                                ) : (
                                  <ArrowDownRight className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-foreground truncate">{transaction.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs border-gray-300 dark:border-border">
                                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                  </Badge>
                                  <p className="text-xs text-gray-500 dark:text-muted-foreground">
                                    {new Date(transaction.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <p className={`text-sm font-semibold ${transaction.type === "deposit" ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-foreground"}`}>
                                {transaction.type === "deposit" ? "+" : "-"}${transaction.amount.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-muted-foreground">${transaction.balance?.toLocaleString() || '0.00'}</p>
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
              </div>

              {/* Customer Journey */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">Customer Journey</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={spendAnalysisData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />
                      <XAxis dataKey="date" stroke="#9ca3af" className="dark:stroke-gray-400" fontSize={12} />
                      <YAxis stroke="#9ca3af" className="dark:stroke-gray-400" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--foreground)'
                        }}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#10b981" fill="#10b981" fillOpacity={0.2} className="dark:stroke-green-500 dark:fill-green-500" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Full Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-foreground">{accountData?.user?.full_name || user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-foreground">{accountData?.user?.email || user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Phone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-foreground">{accountData?.user?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">KYC Status</p>
                    <Badge variant={accountData?.user?.kyc_status === 'verified' ? 'default' : 'secondary'} className="text-xs">
                      {accountData?.user?.kyc_status || 'Pending'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* New Features Section with Tabs */}
          <div className="mt-8">
            <Card className="border border-gray-200 dark:border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-foreground">Account Details & Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 lg:grid-cols-11 mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="accounts">Accounts</TabsTrigger>
                    <TabsTrigger value="cards">Cards</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="spending">Spending</TabsTrigger>
                    <TabsTrigger value="loans">Loans</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <CustomerOverview accountData={accountData} />
                      <AccountSummaryDetailed accountData={accountData} />
                    </div>
                  </TabsContent>

                  <TabsContent value="accounts" className="space-y-6">
                    <AccountSummaryDetailed accountData={accountData} />
                  </TabsContent>

                  <TabsContent value="cards" className="space-y-6">
                    <CardsOverviewDetailed />
                  </TabsContent>

                  <TabsContent value="transactions" className="space-y-6">
                    <RecentTransactionsDetailed transactions={transactions} limit={10} />
                  </TabsContent>

                  <TabsContent value="spending" className="space-y-6">
                    <SpendingInsights transactions={transactions} />
                  </TabsContent>

                  <TabsContent value="loans" className="space-y-6">
                    <LoansPayments />
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-6">
                    <CustomerActivityInteractions />
                  </TabsContent>

                  <TabsContent value="messages" className="space-y-6">
                    <CustomerMessages />
                  </TabsContent>

                  <TabsContent value="security" className="space-y-6">
                    <SecuritySettings />
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-6">
                    <CustomerActions />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Dashboard Customizer */}
        <DashboardCustomizer 
          cards={dashboardCards}
          onUpdateLayout={handleUpdateLayout}
        />
      </div>
    </ProtectedRoute>
  )
}
