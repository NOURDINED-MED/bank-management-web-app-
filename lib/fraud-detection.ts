import type { Transaction, Customer, FraudAlert } from "./types"

/**
 * Fraud Detection Utility
 * Analyzes transactions and user behavior for suspicious activity
 */

export interface FraudCheckResult {
  isFraud: boolean
  score: number // 0-100, higher = more suspicious
  reasons: string[]
  severity: "low" | "medium" | "high" | "critical"
  alerts: Partial<FraudAlert>[]
}

/**
 * Calculate fraud risk score for a transaction
 */
export function calculateFraudScore(
  transaction: Transaction,
  customer: Customer,
  recentTransactions: Transaction[]
): FraudCheckResult {
  let score = 0
  const reasons: string[] = []
  const alerts: Partial<FraudAlert>[] = []

  // Check 1: Unusual amount (significantly higher than average)
  const avgAmount = recentTransactions.length > 0
    ? recentTransactions.reduce((sum, t) => sum + t.amount, 0) / recentTransactions.length
    : customer.balance * 0.1

  if (transaction.amount > avgAmount * 5) {
    score += 25
    reasons.push("Transaction amount is 5x higher than average")
  }

  // Check 2: Large withdrawal from new account
  const accountAge = Date.now() - new Date(customer.createdAt).getTime()
  const daysOld = accountAge / (1000 * 60 * 60 * 24)

  if (daysOld < 7 && transaction.type === "withdrawal" && transaction.amount > 5000) {
    score += 30
    reasons.push("Large withdrawal from new account (< 7 days old)")
  }

  // Check 3: Velocity check - multiple transactions in short time
  const recentHourTransactions = recentTransactions.filter(t => {
    const diff = Date.now() - new Date(t.date).getTime()
    return diff < 3600000 // Last hour
  })

  if (recentHourTransactions.length > 5) {
    score += 20
    reasons.push("High transaction velocity (>5 transactions in 1 hour)")
  }

  // Check 4: Unusual time (3 AM - 5 AM)
  const hour = new Date(transaction.date).getHours()
  if (hour >= 3 && hour <= 5) {
    score += 10
    reasons.push("Transaction during unusual hours (3 AM - 5 AM)")
  }

  // Check 5: Round number amounts (often indicates money laundering)
  if (transaction.amount >= 10000 && transaction.amount % 1000 === 0) {
    score += 15
    reasons.push("Large round number transaction")
  }

  // Check 6: Sudden balance depletion
  const balanceAfter = transaction.balance
  if (transaction.type === "withdrawal" && balanceAfter < customer.balance * 0.1) {
    score += 20
    reasons.push("Sudden balance depletion (>90% withdrawn)")
  }

  // Check 7: Failed login attempts
  if (customer.failedLoginAttempts && customer.failedLoginAttempts > 3) {
    score += 15
    reasons.push("Multiple recent failed login attempts")
  }

  // Determine severity
  let severity: "low" | "medium" | "high" | "critical" = "low"
  if (score >= 75) severity = "critical"
  else if (score >= 50) severity = "high"
  else if (score >= 25) severity = "medium"

  // Create alert if fraud detected
  if (score >= 40) {
    alerts.push({
      type: "unusual_transaction",
      severity,
      customerId: customer.id,
      customerName: customer.name,
      transactionId: transaction.id,
      description: `Suspicious transaction detected: ${reasons.join(", ")}`,
      status: "new",
      metadata: {
        score,
        amount: transaction.amount,
        type: transaction.type
      }
    })
  }

  return {
    isFraud: score >= 40,
    score,
    reasons,
    severity,
    alerts
  }
}

/**
 * Check for multiple failed login attempts
 */
export function checkFailedLogins(
  customerId: string,
  failedAttempts: number,
  timeWindow: number = 3600000 // 1 hour
): FraudAlert | null {
  if (failedAttempts >= 5) {
    return {
      id: `fraud-${Date.now()}-${customerId}`,
      type: "multiple_failed_logins",
      severity: failedAttempts >= 10 ? "critical" : "high",
      customerId,
      customerName: "", // Should be filled in by caller
      description: `${failedAttempts} failed login attempts detected`,
      detectedAt: new Date().toISOString(),
      status: "new",
      metadata: {
        failedAttempts,
        timeWindow
      }
    }
  }
  return null
}

/**
 * Analyze account for suspicious activity patterns
 */
export function analyzeSuspiciousActivity(
  customer: Customer,
  transactions: Transaction[]
): FraudAlert[] {
  const alerts: FraudAlert[] = []

  // Pattern 1: Structuring (multiple transactions just under reporting threshold)
  const recentLargeTransactions = transactions.filter(t => 
    t.amount >= 9000 && t.amount < 10000
  )

  if (recentLargeTransactions.length >= 3) {
    alerts.push({
      id: `fraud-${Date.now()}-structuring-${customer.id}`,
      type: "suspicious_activity",
      severity: "high",
      customerId: customer.id,
      customerName: customer.name,
      description: "Possible structuring detected: Multiple transactions just under $10,000 threshold",
      detectedAt: new Date().toISOString(),
      status: "new",
      metadata: {
        transactionCount: recentLargeTransactions.length,
        pattern: "structuring"
      }
    })
  }

  // Pattern 2: Rapid account turnover
  const last7Days = transactions.filter(t => {
    const diff = Date.now() - new Date(t.date).getTime()
    return diff < 7 * 24 * 60 * 60 * 1000
  })

  const totalIn = last7Days.filter(t => t.type === "deposit" || t.type === "transfer").reduce((sum, t) => sum + t.amount, 0)
  const totalOut = last7Days.filter(t => t.type === "withdrawal").reduce((sum, t) => sum + t.amount, 0)

  if (totalIn > 50000 && totalOut > 45000) {
    alerts.push({
      id: `fraud-${Date.now()}-turnover-${customer.id}`,
      type: "suspicious_activity",
      severity: "medium",
      customerId: customer.id,
      customerName: customer.name,
      description: "Rapid account turnover detected: High volume of deposits and withdrawals",
      detectedAt: new Date().toISOString(),
      status: "new",
      metadata: {
        totalIn,
        totalOut,
        period: "7days"
      }
    })
  }

  // Pattern 3: Geographic inconsistency
  const uniqueLocations = new Set(transactions.map(t => t.location).filter(Boolean))
  if (uniqueLocations.size > 10) {
    alerts.push({
      id: `fraud-${Date.now()}-geo-${customer.id}`,
      type: "suspicious_activity",
      severity: "medium",
      customerId: customer.id,
      customerName: customer.name,
      description: `Transactions from ${uniqueLocations.size} different locations`,
      detectedAt: new Date().toISOString(),
      status: "new",
      metadata: {
        locationCount: uniqueLocations.size
      }
    })
  }

  return alerts
}

/**
 * Calculate customer risk score
 */
export function calculateRiskScore(
  customer: Customer,
  transactions: Transaction[],
  fraudAlerts: FraudAlert[]
): number {
  let score = 0

  // Base score from account age
  const accountAge = Date.now() - new Date(customer.createdAt).getTime()
  const daysOld = accountAge / (1000 * 60 * 60 * 24)
  if (daysOld < 30) score += 20
  else if (daysOld < 90) score += 10

  // KYC status
  if (customer.kycStatus === "pending") score += 30
  else if (customer.kycStatus === "rejected") score += 50
  else if (customer.kycStatus === "verified") score -= 10

  // Failed login attempts
  score += (customer.failedLoginAttempts || 0) * 5

  // Fraud alerts
  score += fraudAlerts.filter(a => a.status === "new").length * 15

  // Transaction patterns
  const avgTransactionAmount = transactions.length > 0
    ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
    : 0

  if (avgTransactionAmount > 10000) score += 15
  if (transactions.length > 100) score += 10

  // Normalize to 0-100
  return Math.min(Math.max(score, 0), 100)
}

