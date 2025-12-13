"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  mockAIInsights
} from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { 
  Users, 
  UserCog, 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3, 
  FileText, 
  Settings, 
  Download, 
  Activity, 
  CheckCircle, 
  Key,
  Mail,
  Zap,
  Eye,
  Clock,
  MessageSquare,
  Phone,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SystemMonitor } from "@/components/system-monitor"
import { AIInsightsPanel } from "@/components/ai-insights-panel"
import { ActivityHeatmapComponent } from "@/components/activity-heatmap"
import { mockActivityHeatmap } from "@/lib/mock-data"
import { UserCustomerManagement } from "@/components/admin/user-customer-management"
import { AccountManagement } from "@/components/admin/account-management"
import { TransactionsOversight } from "@/components/admin/transactions-oversight"
import { TellerStaffManagement } from "@/components/admin/teller-staff-management"
import { ReportsAnalytics } from "@/components/admin/reports-analytics"
import { SettingsConfiguration } from "@/components/admin/settings-configuration"
import { SecurityManagement } from "@/components/admin/security-management"
import { MessagesInbox } from "@/components/admin/messages-inbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [realTransactions, setRealTransactions] = useState<any[]>([])
  const [realCustomers, setRealCustomers] = useState<any[]>([])
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    if (user?.id) {
      fetchStats()
      fetchRealTransactions()
      fetchRealCustomers()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/stats?userId=${user!.id}`)
      const data = await response.json()

      if (data.error) throw new Error(data.error)
      
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRealTransactions = async () => {
    try {
      const response = await fetch(`/api/admin/transactions?userId=${user!.id}&limit=500`)
      const data = await response.json()

      if (data.error) throw new Error(data.error)
      
      // Format transactions for the component
      console.log('📥 Raw transactions data:', data.transactions?.length || 0, 'transactions')
      
      const formatted = (data.transactions || []).map((tx: any) => {
        // Handle nested structure: accounts can be an object or null
        const account = tx.accounts || null
        const user = account?.users || null
        let customerName = 'Unknown Customer'
        
        if (user?.full_name) {
          customerName = user.full_name
        } else if (user?.email) {
          customerName = user.email
        } else if (account?.account_number) {
          customerName = `Account ${account.account_number}`
        }
        
        const amount = parseFloat(tx.amount || 0)
        
        return {
          id: tx.id,
          customerName: customerName,
          type: tx.transaction_type === 'transfer' ? 'transfer' : (tx.transaction_type || 'deposit'),
          amount: amount,
          status: tx.status || 'completed',
          date: tx.created_at || new Date().toISOString(),
          branch: "Main Branch",
          riskLevel: amount > 50000 ? "high" : amount > 10000 ? "medium" : "low"
        }
      })
      
      console.log('✅ Formatted transactions:', formatted.length, 'transactions ready to display')
      if (formatted.length > 0) {
        console.log('📋 Sample transaction:', formatted[0])
      }
      setRealTransactions(formatted)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setRealTransactions([])
    }
  }

  const fetchRealCustomers = async () => {
    try {
      const response = await fetch(`/api/admin/customers?userId=${user!.id}`)
      const data = await response.json()

      if (data.error) throw new Error(data.error)
      
      // API already returns formatted customers, just use them directly
      const formatted = (data.customers || []).map((customer: any) => ({
        id: customer.id,
        name: customer.name || customer.full_name || 'Unknown',
        email: customer.email || '',
        accountNumber: customer.accountNumber || 'N/A',
        balance: customer.balance || 0,
        status: customer.status || 'active',
        kycStatus: customer.kycStatus || customer.kyc_status || 'pending'
      }))
      
      setRealCustomers(formatted)
    } catch (error) {
      console.error('Error fetching customers:', error)
      setRealCustomers([])
    }
  }

  // Use real stats if available, otherwise use defaults
  const totalUsers = stats?.totalUsers || 0
  const totalTellers = stats?.totalTellers || 0
  const totalCustomers = stats?.totalCustomers || 0
  const totalTransactions = stats?.totalTransactions || 0
  const activeCustomers = stats?.activeCustomers || 0
  const totalBalance = stats?.totalBalance || 0

  const totalDeposits = stats?.totalDeposits || 0
  const totalWithdrawals = stats?.totalWithdrawals || 0
  const netFlow = stats?.netFlow || 0

  // New metrics

  const depositsCount = stats?.depositsCount || 0
  const withdrawalsCount = stats?.withdrawalsCount || 0
  const transfersCount = stats?.transfersCount || 0
  const paymentsCount = stats?.paymentsCount || 0

  const recentActivity = stats?.recentTransactions || []

  // Chart data for system activity
  const activityData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      users: Math.floor(Math.random() * 100) + 50,
      transactions: Math.floor(Math.random() * 500) + 200
    }
  })

  // Show loading state if user is not loaded yet
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin", "manager"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px]">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-2">
              Welcome back, {user?.name?.split(" ")[0] || 'Admin'}!
            </h1>
            <p className="text-gray-600 dark:text-muted-foreground">
              Complete system overview with advanced monitoring and analytics
            </p>
          </div>

          {/* Three-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN - Admin Summary, System Status, Quick Actions */}
            <div className="lg:col-span-3 space-y-6">
              {/* Admin Summary Card */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">System Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1 uppercase tracking-wide">Total Balance</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-foreground">
                      ${(totalBalance / 1000000).toFixed(1)}M
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">Across all accounts</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-border space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Total Users</p>
                      <p className="font-mono text-sm font-medium text-gray-900 dark:text-foreground">{totalUsers}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Total Customers</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-foreground">{totalCustomers}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Active Customers</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-foreground">{activeCustomers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Status Card */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-muted-foreground">System Health</span>
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-muted-foreground">Uptime</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-foreground">99.9%</span>
                  </div>
                  <Progress value={99.9} className="h-2" />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/admin/customers" className="block">
                      <div className="p-4 border border-gray-200 dark:border-border rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-foreground">Customer Management</p>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground">View and manage accounts</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/admin/users" className="block">
                      <div className="p-4 border border-gray-200 dark:border-border rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-lg">
                            <UserCog className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-foreground">User Management</p>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground">Manage admin accounts</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/admin/analytics" className="block">
                      <div className="p-4 border border-gray-200 dark:border-border rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-foreground">Analytics</p>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground">View detailed reports</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CENTER COLUMN - Balance Overview, KPIs, Financial Overview, Recent Activity */}
            <div className="lg:col-span-6 space-y-6">
              {/* Balance Overview Card */}
              <Card className="border-0 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-3">Total System Balance</p>
                      <h2 className="text-5xl font-bold tracking-tight">
                        ${(totalBalance / 1000000).toFixed(1)}M
                      </h2>
                      <p className="text-blue-100 text-sm mt-2">{totalCustomers} customer accounts</p>
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
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{totalUsers}</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">{activeCustomers} active</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-gray-100 dark:bg-secondary p-2 rounded-lg">
                        <Activity className="w-5 h-5 text-gray-700 dark:text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Transactions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{totalTransactions.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">{stats?.thisMonthCount || 0} this month</p>
                  </CardContent>
                </Card>

              </div>

              {/* Financial Overview */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Financial Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Total Deposits</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${totalDeposits.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">{depositsCount.toLocaleString()} transactions</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Total Withdrawals</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        ${totalWithdrawals.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">{withdrawalsCount.toLocaleString()} transactions</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Total Transfers</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${(stats?.totalTransfers || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">{transfersCount.toLocaleString()} transactions</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Net Flow</p>
                      <p className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {netFlow >= 0 ? '+' : ''}${netFlow.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Chart */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    System Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={activityData}>
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
                      <Area type="monotone" dataKey="transactions" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} className="dark:stroke-blue-500 dark:fill-blue-500" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Recent Transaction Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-muted-foreground text-center py-8">
                        No recent transactions. Transactions will appear here when customers make them.
                      </p>
                    ) : (
                      recentActivity.slice(0, 5).map((transaction: any) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              transaction.type === "deposit" ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-secondary text-gray-700 dark:text-muted-foreground"
                            }`}>
                              {transaction.type === "deposit" ? (
                                <ArrowUpRight className="w-5 h-5" />
                              ) : (
                                <ArrowDownRight className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-foreground">{transaction.customerName || 'Unknown Customer'}</p>
                              <p className="text-xs text-gray-500 dark:text-muted-foreground">{transaction.description || transaction.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${transaction.type === "deposit" ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-foreground"}`}>
                              {transaction.type === "deposit" ? "+" : "-"}${transaction.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Link href="/admin/transactions">
                    <Button variant="outline" className="w-full mt-4 border-gray-300 dark:border-border text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-accent">
                      View All Transactions
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Activity Heatmap */}
              <ActivityHeatmapComponent data={mockActivityHeatmap} />
            </div>

            {/* RIGHT COLUMN - Recent Transactions, Active Metrics, Notifications */}
            <div className="lg:col-span-3 space-y-6">
              {/* Active Metrics - Sticky */}
              <div className="lg:sticky lg:top-6">
                <Card className="border border-gray-200 dark:border-border shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">Active Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 dark:text-muted-foreground">Pending KYC</span>
                      <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                        {stats?.pendingKYC || 0}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Activity Chart */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={activityData}>
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
                      <Area type="monotone" dataKey="users" stroke="#10b981" fill="#10b981" fillOpacity={0.2} className="dark:stroke-green-500 dark:fill-green-500" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Customer Contacts */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Customer Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {realCustomers.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-sm text-muted-foreground">No customers found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {realCustomers.slice(0, 5).map((customer: any) => (
                        <div
                          key={customer.id}
                          className="p-3 border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-sm text-gray-900 dark:text-foreground">
                                  {customer.name || 'Unknown Customer'}
                                </p>
                                {customer.status === 'active' && (
                                  <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-muted-foreground">
                                  <Mail className="w-3 h-3" />
                                  <a 
                                    href={`mailto:${customer.email}`}
                                    className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                                  >
                                    {customer.email || 'No email'}
                                  </a>
                                </div>
                                {customer.phone && (
                                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-muted-foreground">
                                    <Phone className="w-3 h-3" />
                                    <a 
                                      href={`tel:${customer.phone}`}
                                      className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                                    >
                                      {customer.phone}
                                    </a>
                                  </div>
                                )}
                                {customer.accountNumber && customer.accountNumber !== 'N/A' && (
                                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-muted-foreground">
                                    <Wallet className="w-3 h-3" />
                                    <span>Account: {customer.accountNumber}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Link href={`/admin/customers?search=${encodeURIComponent(customer.email || customer.name)}`}>
                              <Button variant="ghost" size="sm" className="ml-2">
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                      {realCustomers.length > 5 && (
                        <Link 
                          href="/admin/customers" 
                          className="block text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 pt-2 border-t border-gray-200 dark:border-border"
                        >
                          View all customers ({realCustomers.length})
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Comprehensive Admin Features Tabs */}
          <div className="mt-8">
            <Tabs defaultValue="overview" className="mb-8">
              <TabsList className="mb-4 flex-wrap">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">User & Customer</TabsTrigger>
                <TabsTrigger value="accounts">Accounts</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="tellers">Tellers & Staff</TabsTrigger>
                <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
                <TabsTrigger value="messages">
                  Messages
                  {unreadMessages > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white">{unreadMessages}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="ai">AI Insights</TabsTrigger>
                <TabsTrigger value="system">System Health</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Already shown in main layout */}
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <UserCustomerManagement 
                  customers={realCustomers.length > 0 ? realCustomers : []}
                  onUpdateCustomer={async (customer) => {
                    // Refresh customers list after update
                    await fetchRealCustomers()
                  }}
                />
              </TabsContent>

              <TabsContent value="accounts" className="space-y-6">
                <AccountManagement 
                  customers={realCustomers.length > 0 ? realCustomers : []}
                  onUpdateAccount={(account) => {
                    console.log("Update account:", account)
                    fetchRealCustomers() // Refresh after update
                  }}
                />
              </TabsContent>

              <TabsContent value="transactions" className="space-y-6">
                <TransactionsOversight 
                  transactions={realTransactions.length > 0 ? realTransactions : []}
                  onRefresh={() => {
                    fetchRealTransactions()
                  }}
                />
              </TabsContent>

              <TabsContent value="tellers" className="space-y-6">
                <TellerStaffManagement />
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <ReportsAnalytics />
              </TabsContent>

              <TabsContent value="messages" className="space-y-6">
                <MessagesInbox onUnreadCountChange={setUnreadMessages} />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <SettingsConfiguration />
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <SecurityManagement />
              </TabsContent>

              <TabsContent value="ai">
                <AIInsightsPanel insights={mockAIInsights} />
              </TabsContent>

              <TabsContent value="system" id="system">
                <SystemMonitor />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}