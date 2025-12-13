/**
 * Translation helpers for common content
 */

/**
 * Get translated transaction type
 */
export function getTransactionTypeLabel(type: string, t: (key: string) => string): string {
  const typeMap: Record<string, string> = {
    deposit: t('transactions.types.deposit'),
    withdrawal: t('transactions.types.withdrawal'),
    transfer: t('transactions.types.transfer'),
    payment: t('transactions.types.payment'),
  }
  return typeMap[type.toLowerCase()] || type
}

/**
 * Get translated transaction status
 */
export function getTransactionStatusLabel(status: string, t: (key: string) => string): string {
  const statusMap: Record<string, string> = {
    completed: t('transactions.statuses.completed'),
    pending: t('transactions.statuses.pending'),
    failed: t('transactions.statuses.failed'),
    cancelled: t('transactions.statuses.cancelled'),
    flagged: t('transactions.statuses.flagged'),
  }
  return statusMap[status.toLowerCase()] || status
}

/**
 * Get translated queue status
 */
export function getQueueStatusLabel(status: string, t: (key: string) => string): string {
  const statusMap: Record<string, string> = {
    waiting: t('teller.queue.waiting'),
    in_progress: t('teller.queue.inProgress'),
    completed: t('teller.queue.completed'),
    cancelled: t('teller.queue.cancelled'),
  }
  return statusMap[status.toLowerCase()] || status
}

/**
 * Get translated priority label
 */
export function getPriorityLabel(priority: string, t: (key: string) => string): string {
  const priorityMap: Record<string, string> = {
    normal: t('teller.priority.normal'),
    high: t('teller.priority.high'),
    urgent: t('teller.priority.urgent'),
  }
  return priorityMap[priority.toLowerCase()] || priority
}

/**
 * Get translated service type label
 */
export function getServiceTypeLabel(serviceType: string, t: (key: string) => string): string {
  const serviceMap: Record<string, string> = {
    deposit: t('teller.serviceTypes.deposit'),
    withdrawal: t('teller.serviceTypes.withdrawal'),
    transfer: t('teller.serviceTypes.transfer'),
    kyc_verification: t('teller.serviceTypes.kycVerification'),
  }
  return serviceMap[serviceType.toLowerCase()] || serviceType
}
