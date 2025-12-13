"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { SpendingCategory, MonthlySpending } from "@/lib/types"
import { TrendingUp, TrendingDown } from "lucide-react"

interface BudgetAnalyticsProps {
  categories: SpendingCategory[]
  monthlyData: MonthlySpending[]
}

export function BudgetAnalytics({ categories = [], monthlyData = [] }: BudgetAnalyticsProps) {
  // Handle empty data gracefully
  const totalSpending = categories?.reduce((sum, cat) => sum + (cat?.amount || 0), 0) || 0
  const currentMonth = monthlyData?.length > 0 ? monthlyData[monthlyData.length - 1] : { amount: 0, budget: 0, month: 'Current' }
  const previousMonth = monthlyData?.length > 1 ? monthlyData[monthlyData.length - 2] : null
  const changePercent = previousMonth && currentMonth?.amount && previousMonth?.amount
    ? ((currentMonth.amount - previousMonth.amount) / previousMonth.amount * 100).toFixed(1)
    : 0
  const isIncrease = Number(changePercent) > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Budget & Spending Analytics</CardTitle>
          <Badge variant={(currentMonth?.amount || 0) > (currentMonth?.budget || 0) ? "destructive" : "default"}>
            This Month: ${(currentMonth?.amount || 0).toLocaleString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Spending</p>
              <p className="text-2xl font-bold">${totalSpending.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Monthly Budget</p>
              <p className="text-2xl font-bold">${(currentMonth?.budget || 0).toLocaleString()}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Change from Last Month</p>
              <p className={`text-2xl font-bold flex items-center gap-1 ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                {isIncrease ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {Math.abs(Number(changePercent))}%
              </p>
            </div>
          </div>

          {/* Monthly Spending Chart */}
          <div>
            <h4 className="font-semibold mb-3">Monthly Spending Trend</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#3b82f6" name="Spent" radius={[8, 8, 0, 0]} />
                <Bar dataKey="budget" fill="#10b981" name="Budget" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div>
              <h4 className="font-semibold mb-3">Spending by Category</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categories as any}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }: any) => `${category} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {(categories || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category List */}
            <div>
              <h4 className="font-semibold mb-3">Category Details</h4>
              <div className="space-y-3">
                {(categories || []).length > 0 ? (
                  categories.map((cat) => (
                    <div key={cat?.category || 'unknown'} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{cat?.category || 'Unknown'}</span>
                        <span>${(cat?.amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={cat?.percentage || 0} 
                          className="h-2 flex-1"
                          style={{ 
                            ['--progress-background' as any]: cat?.color || '#8884d8'
                          } as React.CSSProperties}
                        />
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {cat?.percentage || 0}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No spending data available yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

