// User roles for the finance management system
export type UserRole = "super_admin" | "manager" | "support" | "auditor" | "admin" | "teller" | "customer"

// Permissions for role-based access control
export type Permission = 
  | "users.view" | "users.create" | "users.edit" | "users.delete"
  | "transactions.view" | "transactions.edit" | "transactions.approve"
  | "reports.view" | "reports.create" | "reports.export"
  | "audit.view" | "audit.export"
  | "settings.view" | "settings.edit"
  | "fraud.view" | "fraud.manage"
  | "tickets.view" | "tickets.manage"
  | "api.manage"
  | "notifications.manage"
  | "analytics.view"

export interface RolePermissions {
  role: UserRole
  permissions: Permission[]
  description: string
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  status: "active" | "inactive" | "suspended"
  phone?: string
  lastLogin?: string
  ipAddress?: string
  device?: string
  twoFactorEnabled?: boolean
  failedLoginAttempts?: number
  avatar?: string
}

export interface Customer extends User {
  role: "customer"
  accountNumber: string
  balance: number
  accountType: "savings" | "checking" | "business"
  cardNumber?: string
  cardExpiry?: string
  cardCvv?: string
  cardStatus?: "active" | "locked" | "blocked" | "inactive"
  onlinePaymentsEnabled?: boolean
  kycStatus?: "pending" | "verified" | "rejected"
  kycDocuments?: KYCDocument[]
  riskScore?: number
  fraudFlags?: string[]
}

export interface KYCDocument {
  id: string
  customerId: string
  type: "id_card" | "passport" | "driver_license" | "proof_of_address" | "selfie"
  fileUrl: string
  uploadedAt: string
  status: "pending" | "approved" | "rejected"
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
}

export interface Transaction {
  id: string
  customerId: string
  customerName: string
  type: "deposit" | "withdrawal" | "transfer" | "payment"
  amount: number
  balance: number
  description: string
  date: string
  status: "completed" | "pending" | "failed" | "flagged"
  tellerId?: string
  tellerName?: string
  recipientId?: string
  recipientName?: string
  recipientAccount?: string
  location?: string
  ipAddress?: string
  device?: string
  fraudScore?: number
  fraudReason?: string
}

export interface FraudAlert {
  id: string
  type: "unusual_transaction" | "multiple_failed_logins" | "suspicious_activity" | "high_risk_transaction" | "velocity_breach"
  severity: "low" | "medium" | "high" | "critical"
  customerId: string
  customerName: string
  transactionId?: string
  description: string
  detectedAt: string
  status: "new" | "investigating" | "resolved" | "false_positive"
  assignedTo?: string
  resolvedAt?: string
  notes?: string
  metadata?: any
}

export interface Notification {
  id: string
  type: "signup" | "kyc_submission" | "kyc_approved" | "transaction_flagged" | "system_alert" | "ticket_created" | "fraud_detected"
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: "low" | "medium" | "high"
  userId?: string
  actionUrl?: string
  metadata?: any
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  userRole: UserRole
  action: string
  category: "auth" | "user" | "transaction" | "system" | "security" | "settings"
  description: string
  timestamp: string
  ipAddress: string
  device: string
  metadata?: any
  success: boolean
}

export interface SupportTicket {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  subject: string
  description: string
  category: "account" | "transaction" | "card" | "technical" | "complaint" | "other"
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed"
  assignedTo?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  messages: TicketMessage[]
  attachments?: string[]
}

export interface TicketMessage {
  id: string
  ticketId: string
  senderId: string
  senderName: string
  senderType: "customer" | "support"
  message: string
  timestamp: string
  attachments?: string[]
}

export interface APIKey {
  id: string
  name: string
  key: string
  description: string
  permissions: Permission[]
  createdBy: string
  createdAt: string
  lastUsed?: string
  expiresAt?: string
  status: "active" | "inactive" | "revoked"
  usageCount: number
  rateLimit: number
}

export interface NotificationTemplate {
  id: string
  name: string
  type: "email" | "sms" | "push"
  subject?: string
  body: string
  variables: string[]
  category: "transactional" | "marketing" | "alert" | "system"
  createdAt: string
  updatedAt: string
  active: boolean
}

export interface SystemMetrics {
  timestamp: string
  cpu: number
  memory: number
  disk: number
  uptime: number
  apiLatency: number
  activeUsers: number
  requestsPerMinute: number
  errorRate: number
}

export interface UserBehaviorMetrics {
  date: string
  dailyActiveUsers: number
  monthlyActiveUsers: number
  avgSessionDuration: number
  deviceBreakdown: {
    desktop: number
    mobile: number
    tablet: number
  }
  topPages: Array<{
    page: string
    views: number
  }>
}

export interface ActivityHeatmap {
  hour: number
  day: string
  value: number
  transactionCount: number
}

export interface GeographicHotspot {
  country: string
  city: string
  latitude: number
  longitude: number
  transactionCount: number
  totalAmount: number
}

export interface AIInsight {
  id: string
  type: "prediction" | "anomaly" | "forecast" | "recommendation"
  title: string
  description: string
  confidence: number
  severity: "info" | "warning" | "critical"
  generatedAt: string
  metadata: any
}

export interface Report {
  id: string
  title: string
  type: "daily" | "weekly" | "monthly" | "custom"
  generatedBy: string
  generatedAt: string
  totalTransactions: number
  totalDeposits: number
  totalWithdrawals: number
  netFlow: number
  data: any
  scheduleEnabled?: boolean
  scheduleFrequency?: "daily" | "weekly" | "monthly"
  recipients?: string[]
}

// Teller-specific types
export interface TellerPerformance {
  tellerId: string
  tellerName: string
  date: string
  totalDeposits: number
  totalWithdrawals: number
  totalTransfers: number
  depositCount: number
  withdrawalCount: number
  transferCount: number
  totalAmount: number
  successCount: number
  errorCount: number
  averageProcessingTime: number
}

export interface CustomerQueue {
  id: string
  customerId: string
  customerName: string
  serviceType: "deposit" | "withdrawal" | "transfer" | "kyc_verification"
  priority: "normal" | "high" | "urgent"
  requestedAmount?: number
  status: "waiting" | "in_progress" | "completed" | "cancelled"
  queueNumber: number
  requestedAt: string
  startedAt?: string
  completedAt?: string
  assignedTeller?: string
  notes?: string
}

export interface CashDrawer {
  tellerId: string
  tellerName: string
  date: string
  startingCash: number
  currentCash: number
  expectedCash: number
  depositsReceived: number
  withdrawalsGiven: number
  transfersProcessed: number
  discrepancy: number
  status: "open" | "balanced" | "over" | "short" | "closed"
  lastReconciliation?: string
  notes?: string
}

export interface TellerLimit {
  limitType: "daily_deposit" | "daily_withdrawal" | "single_transaction" | "total_daily"
  currentAmount: number
  limitAmount: number
  percentage: number
  transactionCount: number
}

export interface InternalMessage {
  id: string
  fromId: string
  fromName: string
  fromRole: UserRole
  toId: string
  toName: string
  toRole: UserRole
  subject: string
  message: string
  timestamp: string
  read: boolean
  priority: "low" | "normal" | "high" | "urgent"
  category: "general" | "transaction_query" | "technical_issue" | "approval_request" | "alert"
  attachments?: string[]
  replyTo?: string
}

export interface Receipt {
  id: string
  transactionId: string
  type: "deposit" | "withdrawal" | "transfer"
  customerId: string
  customerName: string
  accountNumber: string
  amount: number
  currency: string
  date: string
  tellerId: string
  tellerName: string
  branchName: string
  description: string
  balanceBefore: number
  balanceAfter: number
  receiptNumber: string
  recipientInfo?: {
    name: string
    accountNumber: string
  }
}

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  description: string
  action: () => void
  category: "navigation" | "transaction" | "search" | "other"
}

// Customer Dashboard Types
export interface SpendingCategory {
  category: string
  amount: number
  percentage: number
  color: string
  icon: string
}

export interface MonthlySpending {
  month: string
  amount: number
  budget?: number
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  category: "emergency" | "vacation" | "home" | "education" | "other"
  icon: string
  color: string
}

export interface UpcomingBill {
  id: string
  name: string
  amount: number
  dueDate: string
  category: string
  status: "paid" | "pending" | "overdue"
  autopay: boolean
  reminderDays: number
}

export interface CustomerNotification {
  id: string
  type: "deposit" | "withdrawal" | "security" | "info" | "alert"
  title: string
  message: string
  timestamp: string
  read: boolean
  amount?: number
  actionUrl?: string
}

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  action: string
  color: string
}

export interface ActivityTimelineItem {
  id: string
  type: "transaction" | "login" | "security" | "system"
  title: string
  description: string
  timestamp: string
  icon: string
  status?: "success" | "warning" | "error"
}

export interface FinancialInsight {
  id: string
  type: "spending" | "saving" | "income" | "alert" | "tip"
  title: string
  message: string
  amount?: number
  percentage?: number
  icon: string
  color: string
}

export interface DashboardLayout {
  userId: string
  layout: {
    id: string
    visible: boolean
    order: number
  }[]
}

// Authentication Types
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface OTPVerification {
  userId: string
  code: string
  method: "email" | "sms"
  expiresAt: string
}

export interface PasswordResetRequest {
  email: string
  token?: string
  newPassword?: string
}

export interface OAuthProvider {
  provider: "google" | "apple"
  accessToken: string
}
