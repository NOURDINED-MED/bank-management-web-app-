"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface TransactionChartProps {
  transactions?: any[]
}

export function TransactionChart({ transactions = [] }: TransactionChartProps) {
  // Prepare data for charts from real transactions
  const transactionsByType = transactions.reduce(
    (acc, t) => {
      const type = t.transaction_type || t.type
      if (!type) return acc
      
      const typeName = type.charAt(0).toUpperCase() + type.slice(1)
      if (!acc[type]) {
        acc[type] = { type: typeName, count: 0, amount: 0 }
      }
      acc[type].count += 1
      acc[type].amount += parseFloat(t.amount || 0)
      return acc
    },
    {} as Record<string, { type: string; count: number; amount: number }>,
  )

  const chartData = Object.values(transactionsByType) as Array<{ type: string; count: number; amount: number }>

  // Daily transaction volume
  const dailyData = transactions.reduce(
    (acc, t) => {
      const date = new Date(t.created_at || t.date).toLocaleDateString()
      if (!acc[date]) {
        acc[date] = { date, deposits: 0, withdrawals: 0 }
      }
      const amount = parseFloat(t.amount || 0)
      const type = t.transaction_type || t.type
      if (type === "deposit") {
        acc[date].deposits += amount
      } else if (type === "withdrawal") {
        acc[date].withdrawals += amount
      }
      return acc
    },
    {} as Record<string, { date: string; deposits: number; withdrawals: number }>,
  )

  const dailyChartData = (Object.values(dailyData) as Array<{ date: string; deposits: number; withdrawals: number }>).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"]

  if (chartData.length === 0 && dailyChartData.length === 0) {
    return (
      <Card className="border border-gray-200 dark:border-border">
        <CardContent className="p-12">
          <p className="text-center text-muted-foreground">No transaction data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Transaction Volume by Type */}
      <Card className="border border-gray-200 dark:border-border">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-foreground">Transaction Volume by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="type" stroke="#6b7280" className="dark:stroke-gray-400" />
              <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Transaction Amount by Type */}
      <Card className="border border-gray-200 dark:border-border">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-foreground">Transaction Amount by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.type}: $${entry.amount.toLocaleString()}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Cash Flow */}
      <Card className="lg:col-span-2 border border-gray-200 dark:border-border">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-foreground">Daily Cash Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="date" stroke="#6b7280" className="dark:stroke-gray-400" />
              <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="deposits" stroke="#10b981" name="Deposits" strokeWidth={2} />
              <Line type="monotone" dataKey="withdrawals" stroke="#ef4444" name="Withdrawals" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
