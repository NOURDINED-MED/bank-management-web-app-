"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, PieChart, TrendingUp, CreditCard } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from "recharts"

interface SpendingInsightsProps {
  transactions?: any[]
}

export function SpendingInsights({ transactions = [] }: SpendingInsightsProps) {
  // Monthly spending data
  const monthlySpending = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (11 - i))
    const monthTransactions = transactions.filter(t => {
      const txDate = new Date(t.date)
      return txDate.getMonth() === date.getMonth() && txDate.getFullYear() === date.getFullYear()
    })
    const monthSpending = monthTransactions
      .filter(t => t.type === "withdrawal" || t.type === "payment")
      .reduce((sum, t) => sum + (typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount || 0), 0)
    
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      spending: monthSpending || 0
    }
  })

  // Category breakdown
  const categoryData = [
    { name: "Food & Dining", value: 450, color: "#3b82f6" },
    { name: "Travel", value: 320, color: "#8b5cf6" },
    { name: "Bills & Utilities", value: 280, color: "#10b981" },
    { name: "Shopping", value: 210, color: "#f59e0b" },
    { name: "Entertainment", value: 150, color: "#ef4444" },
    { name: "Other", value: 90, color: "#6b7280" }
  ]

  const totalSpending = categoryData.reduce((sum, cat) => sum + cat.value, 0)
  
  // Highest expenses
  const highestExpenses = [
    { description: "Grocery Store Purchase", amount: 245.50, date: "2024-01-15" },
    { description: "Restaurant Bill", amount: 189.75, date: "2024-01-14" },
    { description: "Electric Bill", amount: 156.20, date: "2024-01-10" }
  ]

  // Subscriptions (UI-only)
  const subscriptions = [
    { name: "Netflix", amount: 15.99, nextBilling: "2024-02-01" },
    { name: "Spotify Premium", amount: 9.99, nextBilling: "2024-02-05" },
    { name: "Amazon Prime", amount: 14.99, nextBilling: "2024-02-10" }
  ]

  return (
    <Card className="border border-gray-200 dark:border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Spending Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monthly Spending Chart */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Monthly Spending</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlySpending}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />
              <XAxis dataKey="month" stroke="#9ca3af" className="dark:stroke-gray-400" fontSize={12} />
              <YAxis stroke="#9ca3af" className="dark:stroke-gray-400" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--foreground)'
                }}
              />
              <Area type="monotone" dataKey="spending" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} className="dark:stroke-blue-500 dark:fill-blue-500" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Category Breakdown</h3>
          <div className="grid grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
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
            <div className="space-y-2">
              {categoryData.map((category, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="text-sm text-gray-700 dark:text-foreground">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-foreground">${category.value.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 dark:text-muted-foreground ml-2">
                      ({((category.value / totalSpending) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Highest Expenses */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Highest Expenses
          </h3>
          <div className="space-y-2">
            {highestExpenses.map((expense, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-foreground">{expense.description}</p>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-foreground">${expense.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Overview (UI-only) */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Active Subscriptions (UI only)
          </h3>
          <div className="space-y-2">
            {subscriptions.map((sub, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-foreground">{sub.name}</p>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">Next billing: {new Date(sub.nextBilling).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-foreground">${sub.amount.toFixed(2)}/mo</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}