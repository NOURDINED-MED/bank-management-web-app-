/**
 * Security Monitoring and Alerting System
 * Tracks security events and sends alerts for suspicious activity
 */

import { supabaseAdmin } from './supabase-admin'
import { logAudit, type AuditAction } from './audit-logger'

export interface SecurityEvent {
  type: 'failed_login' | 'suspicious_transaction' | 'unauthorized_access' | 'rate_limit' | 'data_breach_attempt' | 'account_takeover'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  ipAddress: string
  userAgent: string
  description: string
  metadata?: Record<string, any>
}

/**
 * Track security event
 */
export async function trackSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    // Log to audit system
    // Map security event types to audit actions
    const actionMap: Record<SecurityEvent['type'], AuditAction> = {
      'failed_login': 'security.failed_login',
      'suspicious_transaction': 'security.suspicious_transaction',
      'unauthorized_access': 'security.unauthorized_access',
      'rate_limit': 'security.rate_limit',
      'data_breach_attempt': 'security.data_breach_attempt',
      'account_takeover': 'security.account_takeover'
    }
    
    await logAudit({
      userId: event.userId || 'system',
      action: actionMap[event.type],
      entityType: 'security',
      description: event.description,
      metadata: {
        severity: event.severity,
        ip: event.ipAddress,
        userAgent: event.userAgent,
        ...event.metadata
      }
    })

    // Store in security_events table if it exists
    try {
      await supabaseAdmin
        .from('security_events')
        .insert({
          event_type: event.type,
          severity: event.severity,
          user_id: event.userId || null,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          description: event.description,
          metadata: event.metadata || {},
          created_at: new Date().toISOString()
        })
    } catch (error) {
      // Table might not exist, that's okay
      console.warn('Security events table not available:', error)
    }

    // Send alert for critical/high severity events
    if (event.severity === 'critical' || event.severity === 'high') {
      await sendSecurityAlert(event)
    }
  } catch (error) {
    console.error('Error tracking security event:', error)
  }
}

/**
 * Send security alert to admins
 */
async function sendSecurityAlert(event: SecurityEvent): Promise<void> {
  try {
    // Get all admin users
    const { data: admins } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name')
      .eq('role', 'admin')
      .eq('status', 'active')

    if (!admins || admins.length === 0) {
      console.warn('No admin users found to send security alert')
      return
    }

    // Create notification for each admin
    for (const admin of admins) {
      try {
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: admin.id,
            type: 'security_alert',
            title: `Security Alert: ${event.type}`,
            message: event.description,
            severity: event.severity,
            metadata: {
              eventType: event.type,
              ipAddress: event.ipAddress,
              ...event.metadata
            },
            created_at: new Date().toISOString()
          })
      } catch (error) {
        console.error(`Failed to notify admin ${admin.id}:`, error)
      }
    }

    console.log(`Security alert sent to ${admins.length} admin(s)`)
  } catch (error) {
    console.error('Error sending security alert:', error)
  }
}

/**
 * Track failed login attempt
 */
export async function trackFailedLogin(
  email: string,
  ipAddress: string,
  userAgent: string,
  reason: string
): Promise<void> {
  // Check for multiple failed attempts
  const { count } = await supabaseAdmin
    .from('failed_login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // Last 15 minutes

  const attemptCount = count || 0

  // Record the attempt
  try {
    await supabaseAdmin
      .from('failed_login_attempts')
      .insert({
        email,
        ip_address: ipAddress,
        user_agent: userAgent,
        reason,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    // Table might not exist
    console.warn('Failed login attempts table not available')
  }

  // Alert if multiple attempts
  if (attemptCount >= 4) {
    await trackSecurityEvent({
      type: 'failed_login',
      severity: attemptCount >= 9 ? 'critical' : 'high',
      ipAddress,
      userAgent,
      description: `Multiple failed login attempts (${attemptCount + 1}) from ${ipAddress} for ${email}`,
      metadata: {
        email,
        attemptCount: attemptCount + 1,
        reason
      }
    })
  }
}

/**
 * Track suspicious transaction
 */
export async function trackSuspiciousTransaction(
  userId: string,
  transactionId: string,
  amount: number,
  ipAddress: string,
  reason: string,
  riskScore: number
): Promise<void> {
  const severity = riskScore >= 75 ? 'critical' : riskScore >= 50 ? 'high' : 'medium'

  await trackSecurityEvent({
    type: 'suspicious_transaction',
    severity,
    userId,
    ipAddress,
    userAgent: 'unknown',
    description: `Suspicious transaction detected: ${reason}`,
    metadata: {
      transactionId,
      amount,
      riskScore,
      reason
    }
  })
}

/**
 * Track unauthorized access attempt
 */
export async function trackUnauthorizedAccess(
  userId: string,
  endpoint: string,
  ipAddress: string,
  userAgent: string,
  requiredPermission: string,
  userRole: string
): Promise<void> {
  await trackSecurityEvent({
    type: 'unauthorized_access',
    severity: 'high',
    userId,
    ipAddress,
    userAgent,
    description: `Unauthorized access attempt to ${endpoint}`,
    metadata: {
      endpoint,
      requiredPermission,
      userRole
    }
  })
}

/**
 * Get security statistics
 */
export async function getSecurityStats(days: number = 7): Promise<{
  totalEvents: number
  criticalEvents: number
  failedLogins: number
  suspiciousTransactions: number
  unauthorizedAccess: number
}> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  try {
    const { data: events } = await supabaseAdmin
      .from('security_events')
      .select('event_type, severity')
      .gte('created_at', since)

    const stats = {
      totalEvents: events?.length || 0,
      criticalEvents: events?.filter(e => e.severity === 'critical').length || 0,
      failedLogins: events?.filter(e => e.event_type === 'failed_login').length || 0,
      suspiciousTransactions: events?.filter(e => e.event_type === 'suspicious_transaction').length || 0,
      unauthorizedAccess: events?.filter(e => e.event_type === 'unauthorized_access').length || 0
    }

    return stats
  } catch (error) {
    // Table might not exist
    return {
      totalEvents: 0,
      criticalEvents: 0,
      failedLogins: 0,
      suspiciousTransactions: 0,
      unauthorizedAccess: 0
    }
  }
}

