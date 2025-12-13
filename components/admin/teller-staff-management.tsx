"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Calendar,
  BarChart3,
  Loader2,
  RefreshCcw
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Teller {
  id: string
  name: string
  email: string
  phone: string
  branch: string
  status: string
  transactions: number
  cashIn: number
  cashOut: number
  transfers: number
  currentBalance: number
  depositCount: number
  withdrawalCount: number
  transferCount: number
  createdAt: string
}

export function TellerStaffManagement() {
  const { user } = useAuth()
  const [tellers, setTellers] = useState<Teller[]>([])
  const [dailyTotals, setDailyTotals] = useState({ totalTransactions: 0, totalAmount: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchTellers()
    }
  }, [user?.id])

  const fetchTellers = async (isRefresh = false) => {
    if (!user?.id) return

    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/admin/tellers?userId=${user.id}&date=${today}`)
      const data = await response.json()

      if (data.error) throw new Error(data.error)

      setTellers(data.tellers || [])
      setDailyTotals(data.dailyTotals || { totalTransactions: 0, totalAmount: 0 })
    } catch (error) {
      console.error('Error fetching tellers:', error)
      setTellers([])
      setDailyTotals({ totalTransactions: 0, totalAmount: 0 })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <Card className="border border-gray-200 dark:border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Teller & Staff Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400 dark:text-gray-300" />
            <p className="text-sm text-gray-500 dark:text-muted-foreground">Loading teller data...</p>
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
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Teller & Staff Management
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => fetchTellers(true)} disabled={refreshing}>
            <RefreshCcw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Teller Performance Overview */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Teller Performance Overview</h3>
          {tellers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p>No tellers found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tellers.map((teller) => (
              <div key={teller.id} className="p-4 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-foreground">{teller.name}</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">{teller.branch}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                    Active
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Transactions</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-foreground">{teller.transactions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Cash In</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">${teller.cashIn.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Cash Out</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">${teller.cashOut.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>

        {/* Teller Daily Reports */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Teller Daily Reports</h3>
          <div className="border border-gray-200 dark:border-border rounded-lg p-4 bg-white dark:bg-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-foreground">Today's Summary</p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">{new Date().toLocaleDateString()}</p>
              </div>
              <Button size="sm" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Report
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-secondary/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Total Transactions</p>
                <p className="text-xl font-bold text-gray-900 dark:text-foreground">{dailyTotals.totalTransactions}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-secondary/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Total Amount</p>
                <p className="text-xl font-bold text-gray-900 dark:text-foreground">${dailyTotals.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Teller Cash Drawer Summary */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Cash Drawer Summary</h3>
          {tellers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
              <p>No teller cash drawer data available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tellers.map((teller) => (
                <div key={teller.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-foreground">{teller.name}</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">{teller.branch}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-foreground">${teller.currentBalance.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">Current Balance</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Branch Staff Activity Tracking */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Branch Staff Activity</h3>
          <div className="border border-gray-200 dark:border-border rounded-lg p-4 bg-white dark:bg-card">
            {tellers.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-muted-foreground">
                <p className="text-sm">No activity data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tellers.map((teller) => {
                  // Calculate activity percentage based on transactions (assuming 100 transactions = 100%)
                  const activityPercentage = Math.min((teller.transactions / 100) * 100, 100)
                  return (
                    <div key={teller.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-foreground">{teller.branch} - {teller.name}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={activityPercentage} className="w-32 h-2" />
                        <span className="text-sm font-medium text-gray-900 dark:text-foreground">{Math.round(activityPercentage)}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

