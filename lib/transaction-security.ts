/**
 * Transaction Security & Fraud Prevention
 * Implements velocity checks, limits, and fraud detection
 */

import { supabaseAdmin } from './supabase'

export interface TransactionLimits {
  dailyDepositLimit: number
  dailyWithdrawalLimit: number
  dailyTransferLimit: number
  monthlyLimit: number
  singleTransactionLimit: number
  velocityLimit: number // Max transactions per minute
}

export interface VelocityCheck {
  allowed: boolean
  reason?: string
  waitTime?: number // Seconds to wait
}

// Default limits based on account type
export const DEFAULT_LIMITS: Record<string, TransactionLimits> = {
  basic: {
    dailyDepositLimit: 10000,
    dailyWithdrawalLimit: 1000,
    dailyTransferLimit: 5000,
    monthlyLimit: 50000,
    singleTransactionLimit: 5000,
    velocityLimit: 5 // 5 transactions per minute
  },
  premium: {
    dailyDepositLimit: 50000,
    dailyWithdrawalLimit: 5000,
    dailyTransferLimit: 25000,
    monthlyLimit: 250000,
    singleTransactionLimit: 25000,
    velocityLimit: 10
  },
  business: {
    dailyDepositLimit: 200000,
    dailyWithdrawalLimit: 50000,
    dailyTransferLimit: 100000,
    monthlyLimit: 1000000,
    singleTransactionLimit: 100000,
    velocityLimit: 20
  }
}

/**
 * Check if transaction is within limits
 */
export async function checkTransactionLimits(
  userId: string,
  accountType: string,
  transactionType: 'deposit' | 'withdrawal' | 'transfer' | 'payment',
  amount: number
): Promise<{ allowed: boolean; reason?: string }> {
  const limits = DEFAULT_LIMITS[accountType] || DEFAULT_LIMITS.basic

  // Check single transaction limit
  if (amount > limits.singleTransactionLimit) {
    return {
      allowed: false,
      reason: `Single transaction limit is $${limits.singleTransactionLimit.toLocaleString()}`
    }
  }

  // Get today's transactions
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: todayTransactions } = await supabaseAdmin
    .from('transactions')
    .select('amount, transaction_type')
    .gte('created_at', today.toISOString())
    .or(`account_id.eq.${userId}`)

  const todayTotal = todayTransactions?.reduce((sum, t) => {
    if (t.transaction_type === transactionType) {
      return sum + Math.abs(t.amount)
    }
    return sum
  }, 0) || 0

  // Check daily limit
  let dailyLimit = 0
  switch (transactionType) {
    case 'deposit':
      dailyLimit = limits.dailyDepositLimit
      break
    case 'withdrawal':
      dailyLimit = limits.dailyWithdrawalLimit
      break
    case 'transfer':
    case 'payment':
      dailyLimit = limits.dailyTransferLimit
      break
  }

  if (todayTotal + amount > dailyLimit) {
    return {
      allowed: false,
      reason: `Daily ${transactionType} limit is $${dailyLimit.toLocaleString()}. You've already used $${todayTotal.toLocaleString()} today.`
    }
  }

  // Check monthly limit
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const { data: monthTransactions } = await supabaseAdmin
    .from('transactions')
    .select('amount')
    .gte('created_at', firstDayOfMonth.toISOString())
    .or(`account_id.eq.${userId}`)

  const monthlyTotal = monthTransactions?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0

  if (monthlyTotal + amount > limits.monthlyLimit) {
    return {
      allowed: false,
      reason: `Monthly limit is $${limits.monthlyLimit.toLocaleString()}. You've already used $${monthlyTotal.toLocaleString()} this month.`
    }
  }

  return { allowed: true }
}

/**
 * Check transaction velocity (prevent rapid transactions)
 */
export async function checkTransactionVelocity(
  userId: string,
  accountType: string
): Promise<VelocityCheck> {
  const limits = DEFAULT_LIMITS[accountType] || DEFAULT_LIMITS.basic
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000)

  const { data: recentTransactions } = await supabaseAdmin
    .from('transactions')
    .select('id')
    .gte('created_at', oneMinuteAgo.toISOString())
    .or(`account_id.eq.${userId}`)

  const count = recentTransactions?.length || 0

  if (count >= limits.velocityLimit) {
    return {
      allowed: false,
      reason: `Too many transactions. Maximum ${limits.velocityLimit} per minute.`,
      waitTime: 60
    }
  }

  return { allowed: true }
}

/**
 * Detect suspicious transaction patterns
 */
export async function detectSuspiciousTransaction(
  userId: string,
  amount: number,
  transactionType: string,
  ipAddress: string
): Promise<{ suspicious: boolean; riskScore: number; flags: string[] }> {
  const flags: string[] = []
  let riskScore = 0

  // Get user's transaction history
  const { data: history } = await supabaseAdmin
    .from('transactions')
    .select('amount, transaction_type, created_at, metadata')
    .limit(50)
    .order('created_at', { ascending: false })

  if (!history || history.length === 0) {
    flags.push('First transaction - requires verification')
    riskScore += 30
  }

  // Check for unusually large amount
  if (history && history.length > 0) {
    const avgAmount = history.reduce((sum, t) => sum + Math.abs(t.amount), 0) / history.length
    
    if (amount > avgAmount * 5) {
      flags.push('Transaction amount is 5x higher than average')
      riskScore += 40
    }
  }

  // Check for rapid succession
  if (history && history.length > 0) {
    const lastTransaction = new Date(history[0].created_at)
    const timeSince = Date.now() - lastTransaction.getTime()
    
    if (timeSince < 30 * 1000) { // Less than 30 seconds
      flags.push('Multiple transactions in rapid succession')
      riskScore += 35
    }
  }

  // Check for unusual time (2 AM - 5 AM)
  const hour = new Date().getHours()
  if (hour >= 2 && hour <= 5) {
    flags.push('Transaction during unusual hours')
    riskScore += 20
  }

  // Check for round numbers (common in fraud)
  if (amount % 1000 === 0 && amount >= 5000) {
    flags.push('Suspiciously round amount')
    riskScore += 15
  }

  // Large withdrawal
  if (transactionType === 'withdrawal' && amount > 10000) {
    flags.push('Large withdrawal amount')
    riskScore += 25
  }

  return {
    suspicious: riskScore >= 50,
    riskScore,
    flags
  }
}

/**
 * Require additional verification for high-risk transactions
 */
export function requiresAdditionalVerification(
  amount: number,
  transactionType: string,
  riskScore: number
): boolean {
  // Always verify large amounts
  if (amount >= 10000) return true

  // Verify high-risk transactions
  if (riskScore >= 50) return true

  // Verify international transfers
  if (transactionType === 'wire_transfer') return true

  return false
}

/**
 * Check if account is frozen or has restrictions
 */
export async function checkAccountRestrictions(
  accountId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const { data: account } = await supabaseAdmin
    .from('accounts')
    .select('status')
    .eq('id', accountId)
    .single()

  if (!account) {
    return { allowed: false, reason: 'Account not found' }
  }

  if (account.status === 'frozen') {
    return { allowed: false, reason: 'Account is frozen. Contact support.' }
  }

  if (account.status === 'closed') {
    return { allowed: false, reason: 'Account is closed' }
  }

  if (account.status !== 'active') {
    return { allowed: false, reason: 'Account is not active' }
  }

  return { allowed: true }
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  userId: string,
  eventType: string,
  description: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  metadata?: any
): Promise<void> {
  await supabaseAdmin
    .from('security_events')
    .insert({
      user_id: userId,
      event_type: eventType,
      description,
      severity,
      metadata,
      created_at: new Date().toISOString()
    })

  // Alert admins for critical events
  if (severity === 'critical') {
    await alertAdmins(eventType, description, userId)
  }
}

/**
 * Alert admins of critical security events
 */
async function alertAdmins(
  eventType: string,
  description: string,
  userId: string
): Promise<void> {
  // Get all admin users
  const { data: admins } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .eq('role', 'admin')

  if (!admins) return

  // Create notifications for all admins
  const notifications = admins.map(admin => ({
    user_id: admin.id,
    title: `🚨 Critical Security Alert`,
    message: `${eventType}: ${description} (User: ${userId})`,
    type: 'security',
    is_read: false
  }))

  await supabaseAdmin
    .from('notifications')
    .insert(notifications)
}

/**
 * Comprehensive transaction validation
 */
export async function validateTransaction(
  userId: string,
  accountId: string,
  accountType: string,
  transactionType: 'deposit' | 'withdrawal' | 'transfer' | 'payment',
  amount: number,
  ipAddress: string
): Promise<{
  allowed: boolean
  requiresVerification: boolean
  reason?: string
  riskScore?: number
}> {
  // Check account restrictions
  const accountCheck = await checkAccountRestrictions(accountId)
  if (!accountCheck.allowed) {
    return {
      allowed: false,
      requiresVerification: false,
      reason: accountCheck.reason
    }
  }

  // Check velocity
  const velocityCheck = await checkTransactionVelocity(userId, accountType)
  if (!velocityCheck.allowed) {
    return {
      allowed: false,
      requiresVerification: false,
      reason: velocityCheck.reason
    }
  }

  // Check limits
  const limitsCheck = await checkTransactionLimits(userId, accountType, transactionType, amount)
  if (!limitsCheck.allowed) {
    return {
      allowed: false,
      requiresVerification: false,
      reason: limitsCheck.reason
    }
  }

  // Check for suspicious patterns
  const suspicionCheck = await detectSuspiciousTransaction(userId, amount, transactionType, ipAddress)
  
  if (suspicionCheck.suspicious) {
    // Log security event
    await logSecurityEvent(
      userId,
      'suspicious_transaction',
      `Suspicious ${transactionType} of $${amount}. Flags: ${suspicionCheck.flags.join(', ')}`,
      suspicionCheck.riskScore >= 70 ? 'high' : 'medium',
      { amount, transactionType, flags: suspicionCheck.flags, riskScore: suspicionCheck.riskScore }
    )
  }

  // Determine if additional verification is needed
  const needsVerification = requiresAdditionalVerification(amount, transactionType, suspicionCheck.riskScore)

  return {
    allowed: true,
    requiresVerification: needsVerification,
    riskScore: suspicionCheck.riskScore
  }
}

