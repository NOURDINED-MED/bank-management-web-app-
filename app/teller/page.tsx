"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  TrendingUp, 
  Users, 
  MessageSquare,
  Keyboard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Mail,
  MessageCircle,
  Search,
  DollarSign,
  RefreshCw
} from "lucide-react"
import Link from "next/link"
// Removed mock data imports - using real data now
import { useAuth } from "@/lib/auth-context"
import { EnhancedCustomerSearch } from "@/components/teller/enhanced-customer-search"
import { CustomerVerificationPanel } from "@/components/teller/customer-verification-panel"
import { LiveAccountStatus } from "@/components/teller/live-account-status"
import { AdditionalTransactionActions } from "@/components/teller/additional-transaction-actions"
import { TellerActivitySummary } from "@/components/teller/teller-activity-summary"
import { ApprovalsRequests } from "@/components/teller/approvals-requests"
import { CustomerNotes } from "@/components/teller/customer-notes"
import { TellerTools } from "@/components/teller/teller-tools"
import { TellerProfileSection } from "@/components/teller/teller-profile-section"
import { CustomerQueueComponent } from "@/components/customer-queue"
import { CashDrawerComponent } from "@/components/cash-drawer"
import { CustomerMiniProfile } from "@/components/customer-mini-profile"
import { TellerWarnings } from "@/components/teller-warnings"
import { MessagesInbox } from "@/components/admin/messages-inbox"
import { initializeShortcuts, registerShortcut, DEFAULT_TELLER_SHORTCUTS, formatShortcut } from "@/lib/keyboard-shortcuts"
import { printReceipt, sendReceiptEmail, sendReceiptSMS, generateReceiptNumber } from "@/lib/receipt-generator"
import type { Customer, Receipt } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

export default function TellerDashboard() {
  const { user } = useAuth()
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerProfile, setShowCustomerProfile] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [lastReceipt, setLastReceipt] = useState<Receipt | null>(null)

  // Real data state
  const [performance, setPerformance] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cashDrawer, setCashDrawer] = useState<any>(null)
  const [tellerLimits, setTellerLimits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Initialize keyboard shortcuts
  useEffect(() => {
    const cleanup = initializeShortcuts()

    // Register teller shortcuts
    registerShortcut({
      key: 'd',
      ctrlKey: true,
      description: 'Quick Deposit',
      handler: () => {
        window.location.href = '/teller/deposit'
      },
      category: 'Transaction'
    })

    registerShortcut({
      key: 'w',
      ctrlKey: true,
      description: 'Quick Withdrawal',
      handler: () => {
        window.location.href = '/teller/withdrawal'
      },
      category: 'Transaction'
    })

    registerShortcut({
      key: 'f',
      ctrlKey: true,
      description: 'Search Customer',
      handler: () => {
        const input = document.querySelector('input[type="text"]') as HTMLInputElement
        input?.focus()
      },
      category: 'Search'
    })

    registerShortcut({
      key: 'h',
      ctrlKey: true,
      description: 'Show Shortcuts',
      handler: () => {
        setShowShortcuts(true)
      },
      category: 'Other'
    })

    return cleanup
  }, [])

  // Fetch real data on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchAllData()
      // Refresh data every 30 seconds
      const interval = setInterval(() => {
        fetchAllData()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [user?.id])

  // Refresh data when page becomes visible (user comes back from deposit/withdrawal)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.id) {
        fetchAllData()
      }
    }

    const handleFocus = () => {
      if (user?.id) {
        fetchAllData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user?.id])

  const fetchAllData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      await Promise.all([
        fetchPerformance(),
        fetchTransactions(),
        fetchCustomers(),
        fetchCashDrawer(),
        fetchLimits(),
        fetchUnreadMessages()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadMessages = async () => {
    if (!user?.id) return
    
    try {
      const response = await fetch(`/api/messages?userId=${user.id}&type=received&unread=true&limit=100`)
      if (response.ok) {
        const data = await response.json()
        if (!data.error) {
          setUnreadMessages(data.unreadCount || data.messages?.filter((m: any) => !m.isRead).length || 0)
        }
      }
    } catch (error) {
      console.error('Error fetching unread messages:', error)
    }
  }

  const fetchPerformance = async () => {
    try {
      const response = await fetch(`/api/teller/performance?tellerId=${user?.id}`)
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setPerformance(data)
    } catch (error) {
      console.error('Error fetching performance:', error)
      setPerformance({
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalTransfers: 0,
        depositCount: 0,
        withdrawalCount: 0,
        transferCount: 0,
        successCount: 0,
        errorCount: 0,
      })
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/teller/transactions?tellerId=${user?.id}&limit=50`)
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`/api/admin/customers?userId=${user?.id}`)
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setCustomers(data.customers || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      setCustomers([])
    }
  }

  const fetchCashDrawer = async () => {
    try {
      const response = await fetch(`/api/teller/cash-drawer?tellerId=${user?.id}`)
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setCashDrawer(data)
    } catch (error) {
      console.error('Error fetching cash drawer:', error)
      setCashDrawer(null)
    }
  }

  const fetchLimits = async () => {
    try {
      const response = await fetch(`/api/teller/limits?tellerId=${user?.id}`)
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setTellerLimits(data.limits || [])
    } catch (error) {
      console.error('Error fetching limits:', error)
      setTellerLimits([])
    }
  }

  // Safe defaults for performance
  const performanceData = performance || {
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTransfers: 0,
    depositCount: 0,
    withdrawalCount: 0,
    transferCount: 0,
    successCount: 0,
    errorCount: 0,
  }

  // Queue length (no real queue system yet - using 0)
  const queueLength = 0
  const [unreadMessages, setUnreadMessages] = useState(0)

  // Chart data for daily activity - using real transaction data
  const activityData = transactions.length > 0 
    ? Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        const dayTransactions = transactions.filter(t => {
          const txDate = new Date(t.date)
          return txDate.toDateString() === date.toDateString()
        })
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          transactions: dayTransactions.length,
          amount: dayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
        }
      })
    : Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          transactions: 0,
          amount: 0
        }
      })

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowCustomerProfile(true)
  }

  const handleGenerateReceipt = (type: 'deposit' | 'withdrawal' | 'transfer', customer: Customer, amount: number) => {
    const receipt: Receipt = {
      id: `receipt-${Date.now()}`,
      transactionId: `TXN-${Date.now()}`,
      type,
      customerId: customer.id,
      customerName: customer.name,
      accountNumber: customer.accountNumber,
      amount,
      currency: "$",
      date: new Date().toISOString(),
      tellerId: user?.id || "",
      tellerName: user?.name || "",
      branchName: "Main Branch",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} transaction`,
      balanceBefore: customer.balance,
      balanceAfter: type === 'deposit' ? customer.balance + amount : customer.balance - amount,
      receiptNumber: generateReceiptNumber()
    }

    setLastReceipt(receipt)
    setShowReceiptDialog(true)
  }

  if (loading && !performance) {
    return (
      <ProtectedRoute allowedRoles={["teller"]}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px]">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading teller dashboard...</p>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["teller"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px]">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-2">
              Welcome back, {user?.name?.split(" ")[0] || 'Teller'}!
            </h1>
            <p className="text-gray-600 dark:text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Enhanced Customer Search Bar - Full Width */}
          <div className="mb-6">
            <EnhancedCustomerSearch
              customers={customers}
              onSelectCustomer={handleCustomerSelect}
            />
          </div>

          {/* Three-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN - Teller Profile, Activity Summary, Quick Actions, Tools */}
            <div className="lg:col-span-3 space-y-6">
              {/* Teller Profile Section */}
              <TellerProfileSection />

              {/* Teller Activity Summary */}
              <TellerActivitySummary 
                performance={performanceData}
                cashDrawer={cashDrawer}
              />

              {/* Quick Actions */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/teller/deposit" className="block">
                      <div className="p-4 border border-gray-200 dark:border-border rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded-lg">
                            <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-foreground">Deposit</p>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground">Process a deposit</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/teller/withdrawal" className="block">
                      <div className="p-4 border border-gray-200 dark:border-border rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-50 dark:bg-red-950/30 p-2 rounded-lg">
                            <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-foreground">Withdrawal</p>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground">Process a withdrawal</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <Link href="/teller/customers" className="block">
                      <div className="p-4 border border-gray-200 dark:border-border rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-foreground">View All Customers</p>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground">Browse customer list</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-gray-200 dark:border-border"
                      onClick={() => setShowShortcuts(true)}
                    >
                      <Keyboard className="w-4 h-4 mr-2" />
                      Keyboard Shortcuts
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Teller Tools */}
              <TellerTools />
            </div>

            {/* CENTER COLUMN - Today's Overview, KPIs, Customer Queue, Activity */}
            <div className="lg:col-span-6 space-y-6">
              {/* Today's Overview Card */}
              <Card className="border-0 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-3">Today's Total</p>
                      <h2 className="text-5xl font-bold tracking-tight">
                        ${((performanceData?.totalDeposits || 0) + (performanceData?.totalWithdrawals || 0) + (performanceData?.totalTransfers || 0)).toLocaleString()}
                      </h2>
                      <p className="text-blue-100 text-sm mt-2">
                        {(performanceData?.depositCount || 0) + (performanceData?.withdrawalCount || 0) + (performanceData?.transferCount || 0)} transactions processed
                      </p>
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
                      <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded-lg">
                        <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Deposits</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-foreground">${(performanceData?.totalDeposits || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">{performanceData?.depositCount || 0} transactions</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-red-50 dark:bg-red-950/30 p-2 rounded-lg">
                        <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Withdrawals</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-foreground">${(performanceData?.totalWithdrawals || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">{performanceData?.withdrawalCount || 0} transactions</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Transfers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{performanceData?.transferCount || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">${(performanceData?.totalTransfers || 0).toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Queue */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Customer Queue
                    </CardTitle>
                    <Badge className="bg-yellow-500 dark:bg-yellow-600 text-white">
                      {queueLength} waiting
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-muted-foreground/50" />
                    <p>Customer queue system coming soon</p>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Chart */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Daily Activity
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

              {/* Customer Verification Panel - Show when customer selected */}
              {selectedCustomer && (
                <>
                  <CustomerVerificationPanel customer={selectedCustomer} />
                  <LiveAccountStatus customer={selectedCustomer} />
                  <AdditionalTransactionActions 
                    customer={selectedCustomer}
                    onActionComplete={fetchAllData}
                  />
                </>
              )}

              {/* Approvals & Requests */}
              <ApprovalsRequests />
            </div>

            {/* RIGHT COLUMN - Cash Drawer, Processing Limits, Recent Transactions, Messages */}
            <div className="lg:col-span-3 space-y-6">
              {/* Cash Drawer Status - Sticky */}
              <div className="lg:sticky lg:top-6">
                <Card className="border border-gray-200 dark:border-border shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">Cash Drawer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Current Balance</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-foreground">
                        ${(cashDrawer?.currentCash || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-border space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-muted-foreground">Expected</span>
                        <span className="font-medium text-gray-900 dark:text-foreground">
                          ${(cashDrawer?.expectedCash || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-muted-foreground">Difference</span>
                        <span className={`font-medium ${
                          (cashDrawer?.currentCash || 0) - (cashDrawer?.expectedCash || 0) === 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          ${((cashDrawer?.currentCash || 0) - (cashDrawer?.expectedCash || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-300 dark:border-border text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-accent"
                      onClick={() => {
                        const cashDrawerTab = document.querySelector('[value="cash"]') as HTMLElement
                        cashDrawerTab?.click()
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Processing Limits */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">Processing Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tellerLimits.map((limit) => {
                    const isNearLimit = limit.percentage > 80
                    const isAtLimit = limit.percentage > 95

                    return (
                      <div key={limit.limitType} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-muted-foreground capitalize">
                            {limit.limitType.replace(/_/g, " ")}
                          </span>
                          {isAtLimit ? (
                            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          ) : isNearLimit ? (
                            <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                        <Progress 
                          value={Math.min(limit.percentage, 100)} 
                          className={`h-2 ${
                            isAtLimit ? 'bg-red-100 dark:bg-red-950/30' : isNearLimit ? 'bg-yellow-100 dark:bg-yellow-950/30' : ''
                          }`}
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-muted-foreground">
                          <span>${(limit?.currentAmount || 0).toLocaleString()}</span>
                          <span>${(limit?.limitAmount || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">Recent Transactions</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        fetchTransactions()
                        fetchPerformance()
                      }}
                      className="h-8 w-8 p-0"
                      title="Refresh transactions"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-muted-foreground/50" />
                      <p className="text-sm font-medium mb-1">No transactions yet</p>
                      <p className="text-xs">Your processed transactions will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {transactions.slice(0, 5).map((transaction) => {
                        const isDeposit = transaction.type === "deposit" || transaction.type === "Deposit"
                        const isWithdrawal = transaction.type === "withdrawal" || transaction.type === "Withdrawal"
                        const isTransfer = transaction.type === "transfer" || transaction.type === "Transfer"
                        
                        return (
                          <div key={transaction.id} className="flex items-start justify-between p-3 rounded-lg border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent transition-colors">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isDeposit ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400" : isWithdrawal ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400" : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                              }`}>
                                {isDeposit ? (
                                  <ArrowUpRight className="w-4 h-4" />
                                ) : isWithdrawal ? (
                                  <ArrowDownRight className="w-4 h-4" />
                                ) : (
                                  <TrendingUp className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-foreground truncate">
                                  {transaction.customerName || 'Unknown Customer'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-muted-foreground">
                                  {transaction.description || transaction.type}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-muted-foreground/70">
                                  {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'No date'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <p className={`text-sm font-semibold ${
                                isDeposit ? "text-green-600 dark:text-green-400" : isWithdrawal ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
                              }`}>
                                {isDeposit ? "+" : isWithdrawal ? "-" : ""}${(transaction?.amount || 0).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-muted-foreground/70">
                                {transaction.status === 'completed' ? '✓' : transaction.status || 'pending'}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Customer Notes - Show when customer selected */}
              {selectedCustomer && (
                <CustomerNotes 
                  customer={selectedCustomer}
                  onAddNote={(note, flagged) => {
                    console.log("Adding note:", note, flagged)
                    // Would call API to save note
                  }}
                />
              )}

              {/* Customer Messages - Preview */}
              <Card className="border border-gray-200 dark:border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Customer Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mb-3">
                    View all customer messages in the Messages tab below
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const messagesTab = document.querySelector('[value="messages"]') as HTMLElement
                      messagesTab?.click()
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Messages
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Tabs for Detailed Views */}
          <div className="mt-8">
            <Tabs defaultValue="cash" className="mb-8">
              <TabsList className="mb-4">
                <TabsTrigger value="cash">Cash Drawer</TabsTrigger>
                <TabsTrigger value="messages">
                  Messages
                  {unreadMessages > 0 && (
                    <Badge className="ml-2 bg-red-500">{unreadMessages}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="transactions">All Transactions</TabsTrigger>
              </TabsList>

              <TabsContent value="cash" className="mt-6">
                {cashDrawer ? (
                  <CashDrawerComponent
                    drawer={cashDrawer}
                    onReconcile={() => {
                      console.log("Reconciling cash drawer")
                      fetchCashDrawer()
                    }}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500 dark:text-muted-foreground">
                      Loading cash drawer information...
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="messages" className="mt-6">
                <MessagesInbox onUnreadCountChange={setUnreadMessages} />
              </TabsContent>

              <TabsContent value="transactions" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>All Recent Transactions ({transactions.length})</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          fetchTransactions()
                          fetchPerformance()
                          fetchCashDrawer()
                        }}
                        className="h-8"
                        title="Refresh all transactions"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {transactions.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-muted-foreground">
                        <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-muted-foreground/50" />
                        <p className="text-base font-medium mb-2">No transactions found</p>
                        <p className="text-sm mb-4">
                          Transactions you process will appear here
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Link href="/teller/deposit">
                            <Button variant="outline" size="sm">
                              Process Deposit
                            </Button>
                          </Link>
                          <Link href="/teller/withdrawal">
                            <Button variant="outline" size="sm">
                              Process Withdrawal
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-border">
                              <th className="text-left p-3 text-gray-600 dark:text-muted-foreground font-medium">Customer</th>
                              <th className="text-left p-3 text-gray-600 dark:text-muted-foreground font-medium">Type</th>
                              <th className="text-right p-3 text-gray-600 dark:text-muted-foreground font-medium">Amount</th>
                              <th className="text-center p-3 text-gray-600 dark:text-muted-foreground font-medium">Status</th>
                              <th className="text-right p-3 text-gray-600 dark:text-muted-foreground font-medium">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.slice(0, 50).map((transaction) => {
                              const isDeposit = transaction.type === "deposit" || transaction.type === "Deposit"
                              const isWithdrawal = transaction.type === "withdrawal" || transaction.type === "Withdrawal"
                              const isTransfer = transaction.type === "transfer" || transaction.type === "Transfer"
                              
                              return (
                                <tr key={transaction.id} className="border-b border-gray-200 dark:border-border hover:bg-accent">
                                  <td className="p-3">
                                    <div>
                                      <p className="font-medium dark:text-foreground">{transaction.customerName || 'Unknown'}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {transaction.description || transaction.type}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <Badge
                                      variant="outline"
                                      className={
                                        isDeposit
                                          ? "bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                                          : isWithdrawal
                                          ? "bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                                          : "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                      }
                                    >
                                      {transaction.type || 'Unknown'}
                                    </Badge>
                                  </td>
                                  <td className="p-3 text-right">
                                    <span
                                      className={`font-semibold ${
                                        isDeposit
                                          ? "text-green-600 dark:text-green-400"
                                          : isWithdrawal
                                          ? "text-red-600 dark:text-red-400"
                                          : "text-blue-600 dark:text-blue-400"
                                      }`}
                                    >
                                      {isDeposit ? "+" : isWithdrawal ? "-" : ""}$
                                      {(transaction?.amount || 0).toLocaleString()}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    {transaction.status === "completed" ? (
                                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mx-auto" />
                                    ) : transaction.status === "pending" ? (
                                      <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mx-auto" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mx-auto" />
                                    )}
                                  </td>
                                  <td className="p-3 text-right text-sm text-muted-foreground dark:text-muted-foreground">
                                    {transaction.date ? new Date(transaction.date).toLocaleString() : 'No date'}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Customer Mini Profile Dialog */}
        <CustomerMiniProfile
          customer={selectedCustomer}
          transactions={transactions.filter(t => t.customerId === selectedCustomer?.id)}
          open={showCustomerProfile}
          onClose={() => setShowCustomerProfile(false)}
          onDeposit={() => {
            setShowCustomerProfile(false)
            if (selectedCustomer?.accountNumber) {
              window.location.href = `/teller/deposit?account=${encodeURIComponent(selectedCustomer.accountNumber)}`
            }
          }}
          onWithdrawal={() => {
            setShowCustomerProfile(false)
            if (selectedCustomer?.accountNumber) {
              window.location.href = `/teller/withdrawal?account=${encodeURIComponent(selectedCustomer.accountNumber)}`
            }
          }}
          onTransfer={() => {
            setShowCustomerProfile(false)
            if (selectedCustomer?.accountNumber) {
              window.location.href = `/teller/transfer?fromAccount=${encodeURIComponent(selectedCustomer.accountNumber)}`
            }
          }}
        />

        {/* Keyboard Shortcuts Dialog */}
        <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Keyboard Shortcuts
              </DialogTitle>
              <DialogDescription>
                Use these shortcuts to speed up your workflow
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEFAULT_TELLER_SHORTCUTS.map((shortcut: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                      {[
                        shortcut.ctrlKey && "Ctrl",
                        shortcut.shiftKey && "Shift",
                        shortcut.altKey && "Alt",
                        shortcut.key.toUpperCase()
                      ]
                        .filter(Boolean)
                        .join(" + ")}
                    </kbd>
                  </div>
                  <p className="text-xs text-muted-foreground">{shortcut.category}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Receipt Dialog */}
        <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transaction Receipt</DialogTitle>
              <DialogDescription>
                Choose how you'd like to send the receipt
              </DialogDescription>
            </DialogHeader>
            {lastReceipt && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Receipt #{lastReceipt.receiptNumber}</p>
                  <p className="text-2xl font-bold">${(lastReceipt?.amount || 0).toLocaleString()}</p>
                  <p className="text-sm">{lastReceipt.customerName}</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => {
                      printReceipt(lastReceipt)
                      setShowReceiptDialog(false)
                    }}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      sendReceiptEmail(lastReceipt, selectedCustomer?.email || "")
                      setShowReceiptDialog(false)
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      sendReceiptSMS(lastReceipt, selectedCustomer?.phone || "")
                      setShowReceiptDialog(false)
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    SMS
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Warnings for selected customer */}
        {selectedCustomer && showCustomerProfile && (
          <div className="fixed bottom-4 right-4 w-96 z-50">
            <TellerWarnings customer={selectedCustomer} />
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}