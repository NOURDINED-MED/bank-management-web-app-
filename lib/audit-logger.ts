/**
 * Enhanced Audit Logging System
 * Track all user actions and system events
 */

import { supabaseAdmin } from './supabase'

export type AuditAction = 
  | 'user.login'
  | 'user.logout'
  | 'user.signup'
  | 'user.password_change'
  | 'user.profile_update'
  | 'user.2fa_enable'
  | 'user.2fa_disable'
  | 'transaction.create'
  | 'transaction.update'
  | 'transaction.delete'
  | 'card.create'
  | 'card.freeze'
  | 'card.unfreeze'
  | 'card.delete'
  | 'account.create'
  | 'account.update'
  | 'account.freeze'
  | 'account.close'
  | 'admin.role_change'
  | 'admin.user_delete'
  | 'admin.settings_change'
  | 'security.failed_login'
  | 'security.suspicious_activity'
  | 'security.account_locked'
  | 'security.unauthorized_access'
  | 'security.suspicious_transaction'
  | 'security.rate_limit'
  | 'security.data_breach_attempt'
  | 'security.account_takeover'

export interface AuditLog {
  id: string
  userId: string
  action: AuditAction
  entityType: string
  entityId?: string
  description: string
  ipAddress: string
  userAgent: string
  oldData?: any
  newData?: any
  metadata?: any
  createdAt: Date
}

/**
 * Log an audit event
 */
export async function logAudit(params: {
  userId: string
  action: AuditAction
  entityType: string
  entityId?: string
  description: string
  request?: Request
  oldData?: any
  newData?: any
  metadata?: any
}): Promise<void> {
  const ipAddress = params.request?.headers.get('x-forwarded-for')?.split(',')[0] || 
                    params.request?.headers.get('x-real-ip') || 
                    'Unknown'
  
  const userAgent = params.request?.headers.get('user-agent') || 'Unknown'

  const auditLog = {
    user_id: params.userId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    description: params.description,
    ip_address: ipAddress,
    user_agent: userAgent,
    old_data: params.oldData,
    new_data: params.newData,
    metadata: params.metadata,
    created_at: new Date().toISOString()
  }

  await supabaseAdmin
    .from('audit_logs')
    .insert(auditLog)
}

/**
 * Log user login
 */
export async function logLogin(
  userId: string,
  email: string,
  request: Request,
  success: boolean
): Promise<void> {
  await logAudit({
    userId,
    action: success ? 'user.login' : 'security.failed_login',
    entityType: 'user',
    entityId: userId,
    description: success 
      ? `User ${email} logged in successfully`
      : `Failed login attempt for ${email}`,
    request,
    metadata: { email, success }
  })
}

/**
 * Log transaction
 */
export async function logTransaction(
  userId: string,
  transactionId: string,
  transactionType: string,
  amount: number,
  request: Request
): Promise<void> {
  await logAudit({
    userId,
    action: 'transaction.create',
    entityType: 'transaction',
    entityId: transactionId,
    description: `${transactionType} transaction of $${amount.toFixed(2)}`,
    request,
    newData: { transactionType, amount }
  })
}

/**
 * Log account changes
 */
export async function logAccountChange(
  userId: string,
  accountId: string,
  action: AuditAction,
  description: string,
  oldData: any,
  newData: any,
  request: Request
): Promise<void> {
  await logAudit({
    userId,
    action,
    entityType: 'account',
    entityId: accountId,
    description,
    request,
    oldData,
    newData
  })
}

/**
 * Log security events
 */
export async function logSecurityEvent(
  userId: string,
  action: AuditAction,
  description: string,
  request?: Request,
  metadata?: any
): Promise<void> {
  await logAudit({
    userId,
    action,
    entityType: 'security',
    description,
    request,
    metadata
  })
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  const { data, error } = await supabaseAdmin
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map(d => ({
    id: d.id,
    userId: d.user_id,
    action: d.action,
    entityType: d.entity_type,
    entityId: d.entity_id,
    description: d.description,
    ipAddress: d.ip_address,
    userAgent: d.user_agent,
    oldData: d.old_data,
    newData: d.new_data,
    metadata: d.metadata,
    createdAt: new Date(d.created_at)
  }))
}

/**
 * Get all audit logs (admin only)
 */
export async function getAllAuditLogs(
  filters?: {
    userId?: string
    action?: AuditAction
    entityType?: string
    startDate?: Date
    endDate?: Date
  },
  limit: number = 100
): Promise<AuditLog[]> {
  let query = supabaseAdmin
    .from('audit_logs')
    .select('*')

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId)
  }

  if (filters?.action) {
    query = query.eq('action', filters.action)
  }

  if (filters?.entityType) {
    query = query.eq('entity_type', filters.entityType)
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate.toISOString())
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate.toISOString())
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map(d => ({
    id: d.id,
    userId: d.user_id,
    action: d.action,
    entityType: d.entity_type,
    entityId: d.entity_id,
    description: d.description,
    ipAddress: d.ip_address,
    userAgent: d.user_agent,
    oldData: d.old_data,
    newData: d.new_data,
    metadata: d.metadata,
    createdAt: new Date(d.created_at)
  }))
}

/**
 * Search audit logs
 */
export async function searchAuditLogs(
  searchTerm: string,
  limit: number = 50
): Promise<AuditLog[]> {
  const { data, error } = await supabaseAdmin
    .from('audit_logs')
    .select('*')
    .or(`description.ilike.%${searchTerm}%,user_id.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map(d => ({
    id: d.id,
    userId: d.user_id,
    action: d.action,
    entityType: d.entity_type,
    entityId: d.entity_id,
    description: d.description,
    ipAddress: d.ip_address,
    userAgent: d.user_agent,
    oldData: d.old_data,
    newData: d.new_data,
    metadata: d.metadata,
    createdAt: new Date(d.created_at)
  }))
}

/**
 * Export audit logs to CSV
 */
export function exportAuditLogsToCSV(logs: AuditLog[]): string {
  const headers = [
    'Timestamp',
    'User ID',
    'Action',
    'Entity Type',
    'Entity ID',
    'Description',
    'IP Address',
    'User Agent'
  ]

  const rows = logs.map(log => [
    log.createdAt.toISOString(),
    log.userId,
    log.action,
    log.entityType,
    log.entityId || '',
    log.description,
    log.ipAddress,
    log.userAgent
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return csv
}

/**
 * Get audit statistics
 */
export async function getAuditStatistics(
  userId?: string,
  days: number = 30
): Promise<{
  totalLogs: number
  loginAttempts: number
  failedLogins: number
  transactions: number
  securityEvents: number
  byAction: Record<string, number>
}> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  let query = supabaseAdmin
    .from('audit_logs')
    .select('action')
    .gte('created_at', startDate.toISOString())

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data } = await query

  if (!data) {
    return {
      totalLogs: 0,
      loginAttempts: 0,
      failedLogins: 0,
      transactions: 0,
      securityEvents: 0,
      byAction: {}
    }
  }

  const byAction: Record<string, number> = {}
  let loginAttempts = 0
  let failedLogins = 0
  let transactions = 0
  let securityEvents = 0

  data.forEach(log => {
    byAction[log.action] = (byAction[log.action] || 0) + 1

    if (log.action === 'user.login') loginAttempts++
    if (log.action === 'security.failed_login') failedLogins++
    if (log.action.startsWith('transaction.')) transactions++
    if (log.action.startsWith('security.')) securityEvents++
  })

  return {
    totalLogs: data.length,
    loginAttempts,
    failedLogins,
    transactions,
    securityEvents,
    byAction
  }
}

