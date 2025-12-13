"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { ArrowUpRight, ArrowDownRight, Download, Search, RefreshCcw, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Transaction {
  id: string
  transaction_type: string
  amount: number
  balance_after: number
  description: string
  category: string
  merchant_name?: string
  status: string
  reference_number: string
  created_at: string
  accounts: {
    account_number: string
    account_type: string
    users: {
      full_name: string
      email: string
      role: string
    }
  }
}

interface Statistics {
  total: number
  totalAmount: number
  byType: Record<string, number>
  byStatus: Record<string, number>
}

export default function AdminTransactionsPage() {
  const { user: userData } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (userData?.id) {
      fetchTransactions()
    }
  }, [userData, filterType, filterStatus])

  const fetchTransactions = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      let url = `/api/admin/transactions?userId=${userData!.id}&limit=200`
      if (filterType !== 'all') url += `&type=${filterType}`
      if (filterStatus !== 'all') url += `&status=${filterStatus}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.error) throw new Error(data.error)
      
      setTransactions(data.transactions || [])
      setStatistics(data.statistics || null)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Apply search filter
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.accounts?.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.accounts?.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getTransactionIcon = (type: string) => {
    if (type === 'deposit') return <ArrowDownRight className="w-4 h-4 text-green-600" />
    return <ArrowUpRight className="w-4 h-4 text-red-600" />
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      cancelled: "outline",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      deposit: "bg-green-500/10 text-green-700 dark:text-green-400",
      withdrawal: "bg-red-500/10 text-red-700 dark:text-red-400",
      transfer: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      payment: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    }
    return (
      <Badge variant="outline" className={colors[type] || ""}>
        {type}
      </Badge>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold">All Transactions</h1>
                <p className="text-muted-foreground mt-2">Monitor and manage all customer transactions</p>
              </div>
              <Button onClick={() => fetchTransactions(true)} disabled={refreshing} variant="outline">
                <RefreshCcw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{statistics.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">${statistics.totalAmount.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{statistics.byStatus.completed || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-600">{statistics.byStatus.pending || 0}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by customer, reference, description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="deposit">Deposits</SelectItem>
                      <SelectItem value="withdrawal">Withdrawals</SelectItem>
                      <SelectItem value="transfer">Transfers</SelectItem>
                      <SelectItem value="payment">Payments</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions ({filteredTransactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No transactions found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Transactions will appear here when customers make them
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-accent transition-colors border"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 rounded-full bg-accent">
                          {getTransactionIcon(transaction.transaction_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{transaction.accounts?.users?.full_name || 'Unknown'}</p>
                            <span className="text-muted-foreground text-sm">•</span>
                            <p className="text-sm text-muted-foreground">{transaction.accounts?.users?.email}</p>
                            {getTypeBadge(transaction.transaction_type)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {transaction.description || transaction.transaction_type}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            <span className="text-muted-foreground">•</span>
                            <p className="text-xs text-muted-foreground">{transaction.reference_number}</p>
                            {transaction.merchant_name && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <p className="text-xs text-muted-foreground">{transaction.merchant_name}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`font-semibold text-lg ${
                          transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-1 justify-end">
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
