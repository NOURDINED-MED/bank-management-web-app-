import type { Transaction, Customer, AIInsight } from "./types"

/**
 * AI-Driven Insights Module
 * Provides predictions, anomaly detection, and forecasting
 */

/**
 * Predict user activity level for next period
 */
export function predictUserActivity(
  transactions: Transaction[],
  historicalData: { date: string; count: number }[]
): AIInsight {
  // Simple linear regression for prediction
  const recentTrend = historicalData.slice(-7) // Last 7 days
  const avgGrowth = recentTrend.length > 1
    ? (recentTrend[recentTrend.length - 1].count - recentTrend[0].count) / recentTrend.length
    : 0

  const currentAvg = transactions.length / 30 // Transactions per day
  const predicted = currentAvg + avgGrowth * 7

  const confidence = Math.min(95, 60 + (historicalData.length / 30) * 10) // More data = higher confidence

  return {
    id: `insight-activity-${Date.now()}`,
    type: "prediction",
    title: "User Activity Forecast",
    description: `Predicted ${Math.round(predicted)} transactions in the next 7 days (${avgGrowth >= 0 ? 'up' : 'down'} ${Math.abs(avgGrowth * 7).toFixed(0)} from current week)`,
    confidence,
    severity: "info",
    generatedAt: new Date().toISOString(),
    metadata: {
      currentAverage: currentAvg,
      predictedWeekly: predicted,
      trend: avgGrowth >= 0 ? "increasing" : "decreasing",
      growthRate: avgGrowth
    }
  }
}

/**
 * Detect transaction volume anomalies
 */
export function detectVolumeAnomalies(
  dailyTransactions: { date: string; count: number; amount: number }[]
): AIInsight[] {
  const insights: AIInsight[] = []

  if (dailyTransactions.length < 7) return insights

  // Calculate mean and standard deviation
  const counts = dailyTransactions.map(d => d.count)
  const mean = counts.reduce((sum, c) => sum + c, 0) / counts.length
  const variance = counts.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / counts.length
  const stdDev = Math.sqrt(variance)

  // Check recent days for anomalies (> 2 standard deviations)
  const recentDays = dailyTransactions.slice(-3)
  recentDays.forEach(day => {
    const zScore = (day.count - mean) / stdDev
    
    if (Math.abs(zScore) > 2) {
      insights.push({
        id: `insight-anomaly-${Date.now()}-${day.date}`,
        type: "anomaly",
        title: "Transaction Volume Anomaly Detected",
        description: `${day.date}: ${day.count} transactions (${zScore > 0 ? '+' : ''}${((zScore * stdDev / mean) * 100).toFixed(1)}% from average)`,
        confidence: Math.min(95, 70 + Math.abs(zScore) * 10),
        severity: Math.abs(zScore) > 3 ? "critical" : "warning",
        generatedAt: new Date().toISOString(),
        metadata: {
          date: day.date,
          count: day.count,
          mean,
          stdDev,
          zScore
        }
      })
    }
  })

  return insights
}

/**
 * Forecast transaction volume for next month
 */
export function forecastTransactionVolume(
  monthlyData: { month: string; transactions: number; revenue: number }[]
): AIInsight {
  if (monthlyData.length < 3) {
    return {
      id: `insight-forecast-${Date.now()}`,
      type: "forecast",
      title: "Insufficient Data for Forecast",
      description: "Need at least 3 months of data for accurate forecasting",
      confidence: 0,
      severity: "info",
      generatedAt: new Date().toISOString(),
      metadata: {}
    }
  }

  // Simple moving average with trend
  const last3Months = monthlyData.slice(-3)
  const avgTransactions = last3Months.reduce((sum, m) => sum + m.transactions, 0) / 3
  const avgRevenue = last3Months.reduce((sum, m) => sum + m.revenue, 0) / 3

  // Calculate trend
  const oldestAvg = (monthlyData.slice(-6, -3).reduce((sum, m) => sum + m.transactions, 0) / 3) || avgTransactions
  const growthRate = ((avgTransactions - oldestAvg) / oldestAvg) * 100

  const forecastedTransactions = Math.round(avgTransactions * (1 + growthRate / 100))
  const forecastedRevenue = Math.round(avgRevenue * (1 + growthRate / 100))

  return {
    id: `insight-forecast-${Date.now()}`,
    type: "forecast",
    title: "Next Month Transaction Forecast",
    description: `Forecasted ${forecastedTransactions.toLocaleString()} transactions generating $${forecastedRevenue.toLocaleString()} revenue (${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}% growth)`,
    confidence: Math.min(85, 60 + monthlyData.length * 2),
    severity: growthRate < -10 ? "warning" : "info",
    generatedAt: new Date().toISOString(),
    metadata: {
      forecastedTransactions,
      forecastedRevenue,
      growthRate,
      currentAverage: avgTransactions,
      basedOnMonths: monthlyData.length
    }
  }
}

/**
 * Highlight high-value customer churn risk
 */
export function detectChurnRisk(
  customers: Customer[],
  recentTransactions: Map<string, Transaction[]>
): AIInsight[] {
  const insights: AIInsight[] = []

  customers.forEach(customer => {
    const transactions = recentTransactions.get(customer.id) || []
    
    // Check for inactivity
    if (transactions.length === 0 && customer.balance > 10000) {
      insights.push({
        id: `insight-churn-${Date.now()}-${customer.id}`,
        type: "recommendation",
        title: "High-Value Customer Churn Risk",
        description: `${customer.name} (Balance: $${customer.balance.toLocaleString()}) has no activity in 30 days`,
        confidence: 75,
        severity: "warning",
        generatedAt: new Date().toISOString(),
        metadata: {
          customerId: customer.id,
          customerName: customer.name,
          balance: customer.balance,
          daysSinceLastTransaction: 30
        }
      })
    }

    // Check for declining activity
    const last30Days = transactions.filter(t => {
      const diff = Date.now() - new Date(t.date).getTime()
      return diff < 30 * 24 * 60 * 60 * 1000
    }).length

    const prev30Days = transactions.filter(t => {
      const diff = Date.now() - new Date(t.date).getTime()
      return diff >= 30 * 24 * 60 * 60 * 1000 && diff < 60 * 24 * 60 * 60 * 1000
    }).length

    if (prev30Days > 0 && last30Days < prev30Days * 0.5 && customer.balance > 5000) {
      const decline = ((prev30Days - last30Days) / prev30Days * 100).toFixed(0)
      insights.push({
        id: `insight-decline-${Date.now()}-${customer.id}`,
        type: "recommendation",
        title: "Customer Activity Declining",
        description: `${customer.name}'s activity dropped ${decline}% (from ${prev30Days} to ${last30Days} transactions)`,
        confidence: 70,
        severity: "warning",
        generatedAt: new Date().toISOString(),
        metadata: {
          customerId: customer.id,
          customerName: customer.name,
          previousPeriod: prev30Days,
          currentPeriod: last30Days,
          declinePercent: decline
        }
      })
    }
  })

  return insights
}

/**
 * Generate recommendations for business improvement
 */
export function generateRecommendations(
  transactions: Transaction[],
  customers: Customer[],
  systemMetrics: any
): AIInsight[] {
  const insights: AIInsight[] = []

  // Peak hours analysis
  const hourlyDistribution = new Map<number, number>()
  transactions.forEach(t => {
    const hour = new Date(t.date).getHours()
    hourlyDistribution.set(hour, (hourlyDistribution.get(hour) || 0) + 1)
  })

  const peakHour = Array.from(hourlyDistribution.entries())
    .sort((a, b) => b[1] - a[1])[0]

  if (peakHour) {
    insights.push({
      id: `insight-peak-${Date.now()}`,
      type: "recommendation",
      title: "Optimize Peak Hour Performance",
      description: `Peak transaction hour is ${peakHour[0]}:00 with ${peakHour[1]} transactions. Consider increasing server capacity during this time.`,
      confidence: 85,
      severity: "info",
      generatedAt: new Date().toISOString(),
      metadata: {
        peakHour: peakHour[0],
        transactionCount: peakHour[1]
      }
    })
  }

  // Customer verification recommendation
  const unverifiedCustomers = customers.filter(c => c.kycStatus === "pending").length
  const totalCustomers = customers.length

  if (unverifiedCustomers > totalCustomers * 0.2) {
    insights.push({
      id: `insight-kyc-${Date.now()}`,
      type: "recommendation",
      title: "High KYC Verification Backlog",
      description: `${unverifiedCustomers} customers (${(unverifiedCustomers / totalCustomers * 100).toFixed(0)}%) are pending KYC verification. Consider allocating more resources.`,
      confidence: 90,
      severity: "warning",
      generatedAt: new Date().toISOString(),
      metadata: {
        pendingCount: unverifiedCustomers,
        totalCount: totalCustomers,
        percentage: (unverifiedCustomers / totalCustomers * 100).toFixed(1)
      }
    })
  }

  return insights
}

