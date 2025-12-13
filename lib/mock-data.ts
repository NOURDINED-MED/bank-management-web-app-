import type { User, Customer, Transaction } from "./types"

// Mock users for different roles
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@financeapp.com",
    name: "Admin User",
    role: "admin",
    createdAt: "2024-01-01",
    status: "active",
    phone: "+1234567890",
  },
  {
    id: "4420230912",
    email: "teller1@financeapp.com",
    name: "mohamed nourdine",
    role: "teller",
    createdAt: "2024-01-15",
    status: "active",
    phone: "+1234567891",
  },
  {
    id: "3",
    email: "teller2@financeapp.com",
    name: "Mike Chen",
    role: "teller",
    createdAt: "2024-02-01",
    status: "active",
    phone: "+1234567892",
  },
]

// Mock customers - this will be mutable for sign-up functionality
export let mockCustomers: Customer[] = [
  {
    id: "101",
    email: "john.doe@email.com",
    name: "John Doe",
    role: "customer",
    createdAt: "2024-01-10",
    status: "active",
    phone: "+1234567893",
    accountNumber: "ACC-2024-001",
    balance: 15420.5,
    accountType: "checking",
    cardNumber: "4532-1234-5678-9012",
    cardExpiry: "12/26",
    cardCvv: "123",
    cardStatus: "active",
    onlinePaymentsEnabled: true,
  },
  {
    id: "102",
    email: "jane.smith@email.com",
    name: "Jane Smith",
    role: "customer",
    createdAt: "2024-02-15",
    status: "active",
    phone: "+1234567894",
    accountNumber: "ACC-2024-002",
    balance: 8750.25,
    accountType: "savings",
    cardNumber: "4532-****-****-5678",
    cardExpiry: "08/27",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: true,
  },
  {
    id: "103",
    email: "robert.wilson@email.com",
    name: "Robert Wilson",
    role: "customer",
    createdAt: "2024-03-01",
    status: "active",
    phone: "+1234567895",
    accountNumber: "ACC-2024-003",
    balance: 32100.0,
    accountType: "business",
    cardNumber: "4532-****-****-9012",
    cardExpiry: "03/28",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: false,
  },
  {
    id: "104",
    email: "sarah.johnson@email.com",
    name: "Sarah Johnson",
    role: "customer",
    createdAt: "2024-03-15",
    status: "active",
    phone: "+1234567896",
    accountNumber: "ACC-2024-004",
    balance: 12850.75,
    accountType: "checking",
    cardNumber: "4532-****-****-3456",
    cardExpiry: "11/27",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: true,
  },
  {
    id: "105",
    email: "michael.brown@email.com",
    name: "Michael Brown",
    role: "customer",
    createdAt: "2024-04-01",
    status: "active",
    phone: "+1234567897",
    accountNumber: "ACC-2024-005",
    balance: 45600.0,
    accountType: "savings",
    cardNumber: "4532-****-****-7890",
    cardExpiry: "06/29",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: true,
  },
  {
    id: "106",
    email: "emily.davis@email.com",
    name: "Emily Davis",
    role: "customer",
    createdAt: "2024-04-15",
    status: "active",
    phone: "+1234567898",
    accountNumber: "ACC-2024-006",
    balance: 8920.25,
    accountType: "checking",
    cardNumber: "4532-****-****-1122",
    cardExpiry: "09/28",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: true,
  },
  {
    id: "107",
    email: "david.miller@email.com",
    name: "David Miller",
    role: "customer",
    createdAt: "2024-05-01",
    status: "active",
    phone: "+1234567899",
    accountNumber: "ACC-2024-007",
    balance: 23450.0,
    accountType: "business",
    cardNumber: "4532-****-****-3344",
    cardExpiry: "12/29",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: false,
  },
  {
    id: "108",
    email: "lisa.garcia@email.com",
    name: "Lisa Garcia",
    role: "customer",
    createdAt: "2024-05-15",
    status: "active",
    phone: "+1234567800",
    accountNumber: "ACC-2024-008",
    balance: 15670.5,
    accountType: "checking",
    cardNumber: "4532-****-****-5566",
    cardExpiry: "04/30",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: true,
  },
  {
    id: "109",
    email: "james.anderson@email.com",
    name: "James Anderson",
    role: "customer",
    createdAt: "2024-06-01",
    status: "active",
    phone: "+1234567801",
    accountNumber: "ACC-2024-009",
    balance: 7890.0,
    accountType: "savings",
    cardNumber: "4532-****-****-7788",
    cardExpiry: "07/31",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: true,
  },
  {
    id: "110",
    email: "jennifer.martinez@email.com",
    name: "Jennifer Martinez",
    role: "customer",
    createdAt: "2024-06-15",
    status: "active",
    phone: "+1234567802",
    accountNumber: "ACC-2024-010",
    balance: 34560.75,
    accountType: "business",
    cardNumber: "4532-****-****-9900",
    cardExpiry: "10/32",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: true,
  },
  {
    id: "111",
    email: "alex.thompson@email.com",
    name: "Alex Thompson",
    role: "customer",
    createdAt: "2024-07-01",
    status: "active",
    phone: "+1234567803",
    accountNumber: "ACC-2024-011",
    balance: 12340.0,
    accountType: "checking",
    cardNumber: "4532-****-****-1123",
    cardExpiry: "01/33",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: true,
  },
  {
    id: "112",
    email: "olivia.white@email.com",
    name: "Olivia White",
    role: "customer",
    createdAt: "2024-07-15",
    status: "active",
    phone: "+1234567804",
    accountNumber: "ACC-2024-012",
    balance: 67890.25,
    accountType: "savings",
    cardNumber: "4532-****-****-4455",
    cardExpiry: "05/34",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: true,
  },
  {
    id: "113",
    email: "william.harris@email.com",
    name: "William Harris",
    role: "customer",
    createdAt: "2024-08-01",
    status: "active",
    phone: "+1234567805",
    accountNumber: "ACC-2024-013",
    balance: 9876.5,
    accountType: "checking",
    cardNumber: "4532-****-****-6677",
    cardExpiry: "08/35",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: false,
  },
  {
    id: "114",
    email: "sophia.clark@email.com",
    name: "Sophia Clark",
    role: "customer",
    createdAt: "2024-08-15",
    status: "active",
    phone: "+1234567806",
    accountNumber: "ACC-2024-014",
    balance: 54321.0,
    accountType: "business",
    cardNumber: "4532-****-****-8899",
    cardExpiry: "11/36",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: true,
  },
  {
    id: "115",
    email: "benjamin.lewis@email.com",
    name: "Benjamin Lewis",
    role: "customer",
    createdAt: "2024-09-01",
    status: "active",
    phone: "+1234567807",
    accountNumber: "ACC-2024-015",
    balance: 24680.75,
    accountType: "checking",
    cardNumber: "4532-****-****-0011",
    cardExpiry: "02/37",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: true,
  },
  {
    id: "116",
    email: "mia.walker@email.com",
    name: "Mia Walker",
    role: "customer",
    createdAt: "2024-09-15",
    status: "active",
    phone: "+1234567808",
    accountNumber: "ACC-2024-016",
    balance: 13579.25,
    accountType: "savings",
    cardNumber: "4532-****-****-2233",
    cardExpiry: "06/38",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: true,
  },
  {
    id: "117",
    email: "jacob.hall@email.com",
    name: "Jacob Hall",
    role: "customer",
    createdAt: "2024-10-01",
    status: "active",
    phone: "+1234567809",
    accountNumber: "ACC-2024-017",
    balance: 86420.0,
    accountType: "business",
    cardNumber: "4532-****-****-4455",
    cardExpiry: "09/39",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: false,
  },
  {
    id: "118",
    email: "charlotte.young@email.com",
    name: "Charlotte Young",
    role: "customer",
    createdAt: "2024-10-15",
    status: "active",
    phone: "+1234567810",
    accountNumber: "ACC-2024-018",
    balance: 97531.5,
    accountType: "checking",
    cardNumber: "4532-****-****-6677",
    cardExpiry: "12/40",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: true,
  },
  {
    id: "119",
    email: "lucas.king@email.com",
    name: "Lucas King",
    role: "customer",
    createdAt: "2024-11-01",
    status: "active",
    phone: "+1234567811",
    accountNumber: "ACC-2024-019",
    balance: 31415.25,
    accountType: "savings",
    cardNumber: "4532-****-****-8899",
    cardExpiry: "03/41",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: true,
  },
  {
    id: "120",
    email: "amelia.wright@email.com",
    name: "Amelia Wright",
    role: "customer",
    createdAt: "2024-11-15",
    status: "active",
    phone: "+1234567812",
    accountNumber: "ACC-2024-020",
    balance: 27182.0,
    accountType: "business",
    cardNumber: "4532-****-****-0011",
    cardExpiry: "07/42",
    cardCvv: "***",
    cardStatus: "active",
    onlinePaymentsEnabled: true,
  },
]

// Function to add a new customer
export function addCustomer(customer: Omit<Customer, 'id' | 'accountNumber' | 'createdAt' | 'status' | 'cardNumber' | 'cardExpiry' | 'cardCvv' | 'cardStatus'>): Customer {
  const newId = (parseInt(mockCustomers[mockCustomers.length - 1]?.id || '100') + 1).toString()
  const accountNumber = `ACC-2024-${newId.padStart(3, '0')}`

  const newCustomer: Customer = {
    ...customer,
    id: newId,
    accountNumber,
    createdAt: new Date().toISOString().split('T')[0],
    status: 'active',
    cardNumber: `4532-****-****-${Math.floor(Math.random() * 9000 + 1000)}`,
    cardExpiry: `${String(Math.floor(Math.random() * 12 + 1)).padStart(2, '0')}/${String(new Date().getFullYear() + Math.floor(Math.random() * 5 + 1)).slice(-2)}`,
    cardCvv: '***',
    cardStatus: 'active',
    kycStatus: 'pending',
    riskScore: 0,
  }

  mockCustomers.push(newCustomer)
  return newCustomer
}

// Function to send money between customers
export function sendMoney(
  senderId: string,
  recipientAccount: string,
  amount: number,
  description: string = "Money Transfer"
): { success: boolean; message: string; transactionId?: string } {
  // Find sender
  const sender = mockCustomers.find(c => c.id === senderId)
  if (!sender) {
    return { success: false, message: "Sender account not found" }
  }

  // Find recipient by account number
  const recipient = mockCustomers.find(c => c.accountNumber === recipientAccount)
  if (!recipient) {
    return { success: false, message: "Recipient account not found" }
  }

  // Check if sender has sufficient balance
  if (sender.balance < amount) {
    return { success: false, message: "Insufficient balance" }
  }

  // Check minimum transfer amount
  if (amount < 1) {
    return { success: false, message: "Minimum transfer amount is $1" }
  }

  // Generate transaction ID
  const transactionId = `TXN-${Date.now()}`

  // Update balances
  sender.balance -= amount
  recipient.balance += amount

  // Create transaction for sender (debit)
  const senderTransaction = {
    id: transactionId,
    customerId: sender.id,
    customerName: sender.name,
    type: "transfer" as const,
    amount,
    balance: sender.balance,
    description: `Transfer to ${recipient.name}`,
    date: new Date().toISOString(),
    status: "completed" as const,
    recipientId: recipient.id,
    recipientName: recipient.name,
    recipientAccount: recipient.accountNumber,
  }

  // Create transaction for recipient (credit)
  const recipientTransaction = {
    id: `${transactionId}-R`,
    customerId: recipient.id,
    customerName: recipient.name,
    type: "transfer" as const,
    amount,
    balance: recipient.balance,
    description: `Transfer from ${sender.name}`,
    date: new Date().toISOString(),
    status: "completed" as const,
    recipientId: sender.id,
    recipientName: sender.name,
    recipientAccount: sender.accountNumber,
  }

  // Add transactions to mock data
  mockTransactions.push(senderTransaction)
  mockTransactions.push(recipientTransaction)

  return { success: true, message: "Transfer completed successfully", transactionId }
}

// Mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: "TXN-001",
    customerId: "101",
    customerName: "John Doe",
    type: "deposit",
    amount: 5000,
    balance: 15420.5,
    description: "Salary Deposit",
    date: "2024-11-10T10:30:00",
    status: "completed",
    tellerId: "4420230912",
    tellerName: "mohamed nourdine",
  },
  {
    id: "TXN-002",
    customerId: "101",
    customerName: "John Doe",
    type: "withdrawal",
    amount: 200,
    balance: 10420.5,
    description: "ATM Withdrawal",
    date: "2024-11-09T14:20:00",
    status: "completed",
  },
  {
    id: "TXN-003",
    customerId: "102",
    customerName: "Jane Smith",
    type: "deposit",
    amount: 3000,
    balance: 8750.25,
    description: "Cash Deposit",
    date: "2024-11-08T09:15:00",
    status: "completed",
    tellerId: "3",
    tellerName: "Mike Chen",
  },
  {
    id: "TXN-004",
    customerId: "103",
    customerName: "Robert Wilson",
    type: "payment",
    amount: 1500,
    balance: 32100.0,
    description: "Invoice Payment",
    date: "2024-11-07T16:45:00",
    status: "completed",
  },
  {
    id: "TXN-005",
    customerId: "102",
    customerName: "Jane Smith",
    type: "withdrawal",
    amount: 500,
    balance: 5750.25,
    description: "Cash Withdrawal",
    date: "2024-11-06T11:00:00",
    status: "completed",
    tellerId: "4420230912",
    tellerName: "mohamed nourdine",
  },
]

// Extended Mock Data for Advanced Features
import type { 
  FraudAlert, 
  Notification, 
  AuditLog, 
  SupportTicket, 
  APIKey, 
  NotificationTemplate,
  ActivityHeatmap,
  GeographicHotspot,
  AIInsight,
  TicketMessage
} from "./types"

// Mock Fraud Alerts
export const mockFraudAlerts: FraudAlert[] = [
  {
    id: "fraud-001",
    type: "unusual_transaction",
    severity: "high",
    customerId: "103",
    customerName: "Robert Wilson",
    transactionId: "TXN-004",
    description: "Transaction amount 5x higher than average",
    detectedAt: "2024-11-15T10:30:00",
    status: "investigating",
    assignedTo: "1",
    metadata: { score: 65, amount: 15000 }
  },
  {
    id: "fraud-002",
    type: "multiple_failed_logins",
    severity: "critical",
    customerId: "105",
    customerName: "Michael Brown",
    description: "7 failed login attempts in 10 minutes",
    detectedAt: "2024-11-14T22:15:00",
    status: "resolved",
    resolvedAt: "2024-11-15T09:00:00",
    metadata: { attempts: 7 }
  },
  {
    id: "fraud-003",
    type: "velocity_breach",
    severity: "medium",
    customerId: "110",
    customerName: "Jennifer Martinez",
    description: "8 transactions in 2 hours",
    detectedAt: "2024-11-13T14:45:00",
    status: "new",
    metadata: { transactionCount: 8 }
  }
]

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    type: "fraud_detected",
    title: "High-Risk Transaction Detected",
    message: "Unusual transaction pattern detected for Robert Wilson",
    timestamp: "2024-11-15T10:30:00",
    read: false,
    priority: "high",
    actionUrl: "/admin/fraud"
  },
  {
    id: "notif-002",
    type: "signup",
    title: "New Customer Registration",
    message: "Emma Williams has created a new account",
    timestamp: "2024-11-15T09:15:00",
    read: false,
    priority: "low",
    actionUrl: "/admin/customers"
  },
  {
    id: "notif-003",
    type: "kyc_submission",
    title: "KYC Document Submitted",
    message: "Lucas King submitted verification documents",
    timestamp: "2024-11-15T08:45:00",
    read: true,
    priority: "medium",
    actionUrl: "/admin/kyc"
  },
  {
    id: "notif-004",
    type: "ticket_created",
    title: "New Support Ticket",
    message: "Jane Smith reported a transaction dispute",
    timestamp: "2024-11-14T16:20:00",
    read: true,
    priority: "high",
    actionUrl: "/admin/tickets"
  },
  {
    id: "notif-005",
    type: "system_alert",
    title: "High API Latency",
    message: "API response time exceeded 500ms threshold",
    timestamp: "2024-11-14T12:00:00",
    read: true,
    priority: "medium",
    actionUrl: "/admin/system"
  }
]

// Mock Audit Logs
export const mockAuditLogs: AuditLog[] = [
  {
    id: "audit-001",
    userId: "1",
    userName: "Admin User",
    userRole: "admin",
    action: "User Login",
    category: "auth",
    description: "Successful login from dashboard",
    timestamp: "2024-11-15T09:00:00",
    ipAddress: "192.168.1.100",
    device: "Chrome/MacOS",
    success: true
  },
  {
    id: "audit-002",
    userId: "1",
    userName: "Admin User",
    userRole: "admin",
    action: "Updated Customer Status",
    category: "user",
    description: "Changed status for John Doe to active",
    timestamp: "2024-11-15T09:15:00",
    ipAddress: "192.168.1.100",
    device: "Chrome/MacOS",
    success: true,
    metadata: { customerId: "101", newStatus: "active" }
  },
  {
    id: "audit-003",
    userId: "4420230912",
    userName: "mohamed nourdine",
    userRole: "teller",
    action: "Processed Transaction",
    category: "transaction",
    description: "Processed deposit of $5000 for John Doe",
    timestamp: "2024-11-10T10:30:00",
    ipAddress: "192.168.1.101",
    device: "Chrome/Windows",
    success: true,
    metadata: { transactionId: "TXN-001", amount: 5000 }
  },
  {
    id: "audit-004",
    userId: "1",
    userName: "Admin User",
    userRole: "admin",
    action: "Failed Login Attempt",
    category: "security",
    description: "Failed login attempt with incorrect password",
    timestamp: "2024-11-14T22:15:00",
    ipAddress: "203.45.67.89",
    device: "Unknown",
    success: false
  },
  {
    id: "audit-005",
    userId: "1",
    userName: "Admin User",
    userRole: "admin",
    action: "System Settings Updated",
    category: "settings",
    description: "Modified transaction limits",
    timestamp: "2024-11-13T14:30:00",
    ipAddress: "192.168.1.100",
    device: "Chrome/MacOS",
    success: true,
    metadata: { setting: "transaction_limit", value: 50000 }
  }
]

// Mock Support Tickets
export const mockTickets: SupportTicket[] = [
  {
    id: "ticket-001",
    customerId: "102",
    customerName: "Jane Smith",
    customerEmail: "jane.smith@email.com",
    subject: "Transaction Dispute",
    description: "I was charged twice for the same transaction on November 8th",
    category: "transaction",
    priority: "high",
    status: "in_progress",
    assignedTo: "1",
    createdAt: "2024-11-14T16:20:00",
    updatedAt: "2024-11-15T09:30:00",
    messages: [
      {
        id: "msg-001",
        ticketId: "ticket-001",
        senderId: "102",
        senderName: "Jane Smith",
        senderType: "customer",
        message: "I was charged twice for the same transaction on November 8th. Can you please investigate?",
        timestamp: "2024-11-14T16:20:00"
      },
      {
        id: "msg-002",
        ticketId: "ticket-001",
        senderId: "1",
        senderName: "Admin User",
        senderType: "support",
        message: "Thank you for contacting us. I'm looking into this issue now. Can you provide the transaction ID?",
        timestamp: "2024-11-15T09:30:00"
      }
    ]
  },
  {
    id: "ticket-002",
    customerId: "105",
    customerName: "Michael Brown",
    customerEmail: "michael.brown@email.com",
    subject: "Card Not Working",
    description: "My card was declined at multiple stores today",
    category: "card",
    priority: "urgent",
    status: "open",
    createdAt: "2024-11-15T11:00:00",
    updatedAt: "2024-11-15T11:00:00",
    messages: [
      {
        id: "msg-003",
        ticketId: "ticket-002",
        senderId: "105",
        senderName: "Michael Brown",
        senderType: "customer",
        message: "My card was declined at multiple stores today. I have sufficient balance. Please help!",
        timestamp: "2024-11-15T11:00:00"
      }
    ]
  },
  {
    id: "ticket-003",
    customerId: "108",
    customerName: "Lisa Garcia",
    customerEmail: "lisa.garcia@email.com",
    subject: "Unable to Login",
    description: "I forgot my password and the reset link is not working",
    category: "technical",
    priority: "medium",
    status: "resolved",
    assignedTo: "1",
    createdAt: "2024-11-12T14:00:00",
    updatedAt: "2024-11-13T10:00:00",
    resolvedAt: "2024-11-13T10:00:00",
    messages: []
  }
]

// Mock API Keys
export const mockAPIKeys: APIKey[] = [
  {
    id: "key-001",
    name: "Production API",
    key: "pk_live_51H7xG...",
    description: "Main production API key for web application",
    permissions: ["transactions.view", "users.view"],
    createdBy: "1",
    createdAt: "2024-01-15T10:00:00",
    lastUsed: "2024-11-15T09:45:00",
    status: "active",
    usageCount: 15420,
    rateLimit: 1000
  },
  {
    id: "key-002",
    name: "Mobile App API",
    key: "pk_live_82K4mP...",
    description: "API key for mobile application",
    permissions: ["transactions.view", "transactions.edit", "users.view"],
    createdBy: "1",
    createdAt: "2024-02-01T14:30:00",
    lastUsed: "2024-11-15T10:20:00",
    status: "active",
    usageCount: 8934,
    rateLimit: 500
  },
  {
    id: "key-003",
    name: "Development API",
    key: "pk_test_93L5nQ...",
    description: "Testing and development environment key",
    permissions: ["transactions.view", "users.view", "reports.view"],
    createdBy: "1",
    createdAt: "2024-03-10T09:00:00",
    lastUsed: "2024-11-10T16:00:00",
    status: "active",
    usageCount: 2145,
    rateLimit: 100
  },
  {
    id: "key-004",
    name: "Legacy Integration",
    key: "pk_live_74J3kL...",
    description: "Old integration - to be deprecated",
    permissions: ["transactions.view"],
    createdBy: "1",
    createdAt: "2023-06-01T10:00:00",
    status: "inactive",
    usageCount: 45230,
    rateLimit: 1000
  }
]

// Mock Notification Templates
export const mockTemplates: NotificationTemplate[] = [
  {
    id: "template-001",
    name: "Welcome Email",
    type: "email",
    subject: "Welcome to {{company_name}}!",
    body: "Hi {{customer_name}},\n\nWelcome to our banking platform! Your account {{account_number}} has been successfully created.\n\nBest regards,\nThe Team",
    variables: ["company_name", "customer_name", "account_number"],
    category: "transactional",
    createdAt: "2024-01-01T00:00:00",
    updatedAt: "2024-01-01T00:00:00",
    active: true
  },
  {
    id: "template-002",
    name: "Transaction Alert",
    type: "sms",
    body: "Transaction alert: {{transaction_type}} of ${{amount}} on {{date}}. Balance: ${{balance}}",
    variables: ["transaction_type", "amount", "date", "balance"],
    category: "alert",
    createdAt: "2024-01-01T00:00:00",
    updatedAt: "2024-01-01T00:00:00",
    active: true
  },
  {
    id: "template-003",
    name: "Fraud Alert",
    type: "push",
    body: "⚠️ Suspicious activity detected on your account. Please verify immediately.",
    variables: [],
    category: "alert",
    createdAt: "2024-01-01T00:00:00",
    updatedAt: "2024-01-01T00:00:00",
    active: true
  },
  {
    id: "template-004",
    name: "Monthly Statement",
    type: "email",
    subject: "Your Monthly Statement - {{month}} {{year}}",
    body: "Dear {{customer_name}},\n\nYour statement for {{month}} {{year}} is ready.\n\nTransactions: {{transaction_count}}\nTotal Deposits: ${{total_deposits}}\nTotal Withdrawals: ${{total_withdrawals}}\nClosing Balance: ${{closing_balance}}",
    variables: ["customer_name", "month", "year", "transaction_count", "total_deposits", "total_withdrawals", "closing_balance"],
    category: "transactional",
    createdAt: "2024-01-01T00:00:00",
    updatedAt: "2024-01-01T00:00:00",
    active: true
  }
]

// Mock Activity Heatmap Data
export const mockActivityHeatmap: ActivityHeatmap[] = [
  { hour: 0, day: "Monday", value: 5, transactionCount: 12 },
  { hour: 1, day: "Monday", value: 2, transactionCount: 5 },
  { hour: 2, day: "Monday", value: 1, transactionCount: 3 },
  { hour: 9, day: "Monday", value: 45, transactionCount: 89 },
  { hour: 10, day: "Monday", value: 52, transactionCount: 104 },
  { hour: 11, day: "Monday", value: 48, transactionCount: 96 },
  { hour: 12, day: "Monday", value: 65, transactionCount: 130 },
  { hour: 13, day: "Monday", value: 58, transactionCount: 116 },
  { hour: 14, day: "Monday", value: 55, transactionCount: 110 },
  { hour: 15, day: "Monday", value: 60, transactionCount: 120 },
  { hour: 16, day: "Monday", value: 42, transactionCount: 84 },
  { hour: 17, day: "Monday", value: 38, transactionCount: 76 },
  { hour: 18, day: "Monday", value: 25, transactionCount: 50 },
  { hour: 19, day: "Monday", value: 15, transactionCount: 30 },
  { hour: 20, day: "Monday", value: 10, transactionCount: 20 },
  // ... Similar data for other days
]

// Mock Geographic Hotspots
export const mockGeoHotspots: GeographicHotspot[] = [
  { country: "USA", city: "New York", latitude: 40.7128, longitude: -74.0060, transactionCount: 1250, totalAmount: 2450000 },
  { country: "USA", city: "Los Angeles", latitude: 34.0522, longitude: -118.2437, transactionCount: 890, totalAmount: 1780000 },
  { country: "USA", city: "Chicago", latitude: 41.8781, longitude: -87.6298, transactionCount: 720, totalAmount: 1440000 },
  { country: "USA", city: "Houston", latitude: 29.7604, longitude: -95.3698, transactionCount: 560, totalAmount: 1120000 },
  { country: "USA", city: "Miami", latitude: 25.7617, longitude: -80.1918, transactionCount: 450, totalAmount: 900000 }
]

// Mock AI Insights
export const mockAIInsights: AIInsight[] = [
  {
    id: "insight-001",
    type: "prediction",
    title: "Transaction Volume Increase Expected",
    description: "Predicted 15% increase in transaction volume next month based on historical trends",
    confidence: 87,
    severity: "info",
    generatedAt: "2024-11-15T06:00:00",
    metadata: { predictedIncrease: 15, basedOnMonths: 6 }
  },
  {
    id: "insight-002",
    type: "anomaly",
    title: "Unusual Login Pattern Detected",
    description: "40% increase in failed login attempts compared to average",
    confidence: 92,
    severity: "warning",
    generatedAt: "2024-11-15T06:00:00",
    metadata: { increasePercent: 40, threshold: 30 }
  },
  {
    id: "insight-003",
    type: "recommendation",
    title: "Optimize Peak Hour Performance",
    description: "Peak transaction hour is 12:00 PM with 130+ transactions. Consider scaling resources.",
    confidence: 95,
    severity: "info",
    generatedAt: "2024-11-15T06:00:00",
    metadata: { peakHour: 12, transactionCount: 130 }
  },
  {
    id: "insight-004",
    type: "forecast",
    title: "Revenue Forecast",
    description: "Forecasted $2.8M revenue next month (+12% growth)",
    confidence: 83,
    severity: "info",
    generatedAt: "2024-11-15T06:00:00",
    metadata: { forecastAmount: 2800000, growthRate: 12 }
  }
]

// Teller-specific Mock Data
import type {
  TellerPerformance,
  CustomerQueue,
  CashDrawer,
  TellerLimit,
  InternalMessage
} from "./types"

export const mockTellerPerformance: TellerPerformance = {
  tellerId: "4420230912",
  tellerName: "mohamed nourdine",
  date: new Date().toISOString().split('T')[0],
  totalDeposits: 45000,
  totalWithdrawals: 23000,
  totalTransfers: 12000,
  depositCount: 15,
  withdrawalCount: 12,
  transferCount: 8,
  totalAmount: 80000,
  successCount: 33,
  errorCount: 2,
  averageProcessingTime: 3.5
}

export const mockCustomerQueue: CustomerQueue[] = [
  {
    id: "queue-001",
    customerId: "105",
    customerName: "Michael Brown",
    serviceType: "deposit",
    priority: "normal",
    requestedAmount: 5000,
    status: "waiting",
    queueNumber: 1,
    requestedAt: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: "queue-002",
    customerId: "108",
    customerName: "Lisa Garcia",
    serviceType: "withdrawal",
    priority: "high",
    requestedAmount: 3000,
    status: "in_progress",
    queueNumber: 2,
    requestedAt: new Date(Date.now() - 600000).toISOString(),
    startedAt: new Date(Date.now() - 60000).toISOString(),
    assignedTeller: "4420230912"
  },
  {
    id: "queue-003",
    customerId: "112",
    customerName: "Olivia White",
    serviceType: "kyc_verification",
    priority: "urgent",
    status: "waiting",
    queueNumber: 3,
    requestedAt: new Date(Date.now() - 900000).toISOString(),
    notes: "Documents uploaded, needs verification"
  },
  {
    id: "queue-004",
    customerId: "115",
    customerName: "Benjamin Lewis",
    serviceType: "transfer",
    priority: "normal",
    requestedAmount: 1500,
    status: "waiting",
    queueNumber: 4,
    requestedAt: new Date(Date.now() - 120000).toISOString()
  }
]

export const mockCashDrawer: CashDrawer = {
  tellerId: "4420230912",
  tellerName: "mohamed nourdine",
  date: new Date().toISOString().split('T')[0],
  startingCash: 50000,
  currentCash: 61000,
  expectedCash: 61000,
  depositsReceived: 45000,
  withdrawalsGiven: 34000,
  transfersProcessed: 0,
  discrepancy: 0,
  status: "balanced",
  lastReconciliation: new Date(Date.now() - 3600000).toISOString()
}

export const mockTellerLimits: TellerLimit[] = [
  {
    limitType: "daily_deposit",
    currentAmount: 45000,
    limitAmount: 100000,
    percentage: 45,
    transactionCount: 15
  },
  {
    limitType: "daily_withdrawal",
    currentAmount: 23000,
    limitAmount: 75000,
    percentage: 30.67,
    transactionCount: 12
  },
  {
    limitType: "single_transaction",
    currentAmount: 8000,
    limitAmount: 10000,
    percentage: 80,
    transactionCount: 1
  },
  {
    limitType: "total_daily",
    currentAmount: 80000,
    limitAmount: 150000,
    percentage: 53.33,
    transactionCount: 35
  }
]

export const mockInternalMessages: InternalMessage[] = [
  {
    id: "msg-001",
    fromId: "1",
    fromName: "Admin User",
    fromRole: "admin",
    toId: "4420230912",
    toName: "mohamed nourdine",
    toRole: "teller",
    subject: "Daily Cash Reconciliation Required",
    message: "Please ensure you complete the end-of-day cash reconciliation by 6 PM today.",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    priority: "high",
    category: "general"
  },
  {
    id: "msg-002",
    fromId: "1",
    fromName: "Admin User",
    fromRole: "admin",
    toId: "4420230912",
    toName: "mohamed nourdine",
    toRole: "teller",
    subject: "Large Transaction Alert",
    message: "Transaction TXN-001 for $8,000 requires supervisor approval. Please review before processing.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: true,
    priority: "urgent",
    category: "approval_request"
  },
  {
    id: "msg-003",
    fromId: "3",
    fromName: "Mike Chen",
    fromRole: "teller",
    toId: "4420230912",
    toName: "mohamed nourdine",
    toRole: "teller",
    subject: "Customer Query - John Doe",
    message: "Customer John Doe (ACC-2024-001) asking about his recent withdrawal. Can you help?",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false,
    priority: "normal",
    category: "transaction_query"
  }
]

// Customer Dashboard Mock Data
import type {
  SpendingCategory,
  MonthlySpending,
  SavingsGoal,
  UpcomingBill,
  CustomerNotification,
  ActivityTimelineItem,
  FinancialInsight
} from "./types"

export const mockSpendingCategories: SpendingCategory[] = [
  { category: "Food & Dining", amount: 1245.50, percentage: 28, color: "#ef4444", icon: "UtensilsCrossed" },
  { category: "Shopping", amount: 980.00, percentage: 22, color: "#3b82f6", icon: "ShoppingBag" },
  { category: "Transportation", amount: 650.00, percentage: 15, color: "#f59e0b", icon: "Car" },
  { category: "Entertainment", amount: 520.00, percentage: 12, color: "#8b5cf6", icon: "Tv" },
  { category: "Bills & Utilities", amount: 450.00, percentage: 10, color: "#10b981", icon: "Receipt" },
  { category: "Healthcare", amount: 340.00, percentage: 8, color: "#ec4899", icon: "Heart" },
  { category: "Other", amount: 215.50, percentage: 5, color: "#6b7280", icon: "MoreHorizontal" }
]

export const mockMonthlySpending: MonthlySpending[] = [
  { month: "Jan", amount: 3200, budget: 4000 },
  { month: "Feb", amount: 3800, budget: 4000 },
  { month: "Mar", amount: 4100, budget: 4000 },
  { month: "Apr", amount: 3600, budget: 4000 },
  { month: "May", amount: 3900, budget: 4000 },
  { month: "Jun", amount: 4401, budget: 4000 }
]

export const mockSavingsGoals: SavingsGoal[] = [
  {
    id: "goal-001",
    name: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 7500,
    deadline: "2024-12-31",
    category: "emergency",
    icon: "Shield",
    color: "#ef4444"
  },
  {
    id: "goal-002",
    name: "Summer Vacation",
    targetAmount: 5000,
    currentAmount: 3200,
    deadline: "2024-07-01",
    category: "vacation",
    icon: "Plane",
    color: "#3b82f6"
  },
  {
    id: "goal-003",
    name: "New Car",
    targetAmount: 25000,
    currentAmount: 8500,
    deadline: "2025-06-01",
    category: "other",
    icon: "Car",
    color: "#10b981"
  },
  {
    id: "goal-004",
    name: "Home Down Payment",
    targetAmount: 50000,
    currentAmount: 15000,
    deadline: "2026-01-01",
    category: "home",
    icon: "Home",
    color: "#f59e0b"
  }
]

export const mockUpcomingBills: UpcomingBill[] = [
  {
    id: "bill-001",
    name: "Rent",
    amount: 1500,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Housing",
    status: "pending",
    autopay: true,
    reminderDays: 3
  },
  {
    id: "bill-002",
    name: "Electric Bill",
    amount: 120.50,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Utilities",
    status: "pending",
    autopay: false,
    reminderDays: 2
  },
  {
    id: "bill-003",
    name: "Internet",
    amount: 79.99,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Utilities",
    status: "pending",
    autopay: true,
    reminderDays: 5
  },
  {
    id: "bill-004",
    name: "Credit Card Payment",
    amount: 450.00,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Credit",
    status: "pending",
    autopay: false,
    reminderDays: 7
  },
  {
    id: "bill-005",
    name: "Phone Bill",
    amount: 65.00,
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Utilities",
    status: "overdue",
    autopay: false,
    reminderDays: 3
  }
]

export const mockCustomerNotifications: CustomerNotification[] = [
  {
    id: "notif-001",
    type: "deposit",
    title: "Deposit Received",
    message: "Your account was credited with a deposit",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    amount: 5000
  },
  {
    id: "notif-002",
    type: "withdrawal",
    title: "ATM Withdrawal",
    message: "Withdrawal at Main Street ATM",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    amount: 200
  },
  {
    id: "notif-003",
    type: "security",
    title: "New Device Login",
    message: "Your account was accessed from a new device in New York",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true
  },
  {
    id: "notif-004",
    type: "alert",
    title: "Low Balance Alert",
    message: "Your account balance is below $1,000",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    read: true
  },
  {
    id: "notif-005",
    type: "info",
    title: "Statement Available",
    message: "Your monthly statement for November is ready",
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    read: true
  }
]

export const mockActivityTimeline: ActivityTimelineItem[] = [
  {
    id: "activity-001",
    type: "transaction",
    title: "Deposit",
    description: "Salary deposit of $5,000",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    icon: "ArrowUpRight",
    status: "success"
  },
  {
    id: "activity-002",
    type: "login",
    title: "Login from New Device",
    description: "Chrome on MacOS from New York, NY",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    icon: "LogIn",
    status: "warning"
  },
  {
    id: "activity-003",
    type: "transaction",
    title: "ATM Withdrawal",
    description: "$200 withdrawn at Main Street ATM",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    icon: "ArrowDownRight",
    status: "success"
  },
  {
    id: "activity-004",
    type: "security",
    title: "Password Changed",
    description: "Your password was successfully updated",
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    icon: "Shield",
    status: "success"
  },
  {
    id: "activity-005",
    type: "system",
    title: "Card Activated",
    description: "Your new debit card ending in 9012 was activated",
    timestamp: new Date(Date.now() - 345600000).toISOString(),
    icon: "CreditCard",
    status: "success"
  }
]

export const mockFinancialInsights: FinancialInsight[] = [
  {
    id: "insight-001",
    type: "spending",
    title: "Spending Up This Month",
    message: "You've spent 10% more than last month. Consider reviewing your budget.",
    amount: 4401,
    percentage: 10,
    icon: "TrendingUp",
    color: "#ef4444"
  },
  {
    id: "insight-002",
    type: "saving",
    title: "Great Savings Progress!",
    message: "You're 75% toward your Emergency Fund goal. Keep it up!",
    percentage: 75,
    icon: "PiggyBank",
    color: "#10b981"
  },
  {
    id: "insight-003",
    type: "tip",
    title: "Reduce Dining Expenses",
    message: "Dining out accounts for 28% of your spending. Try cooking at home to save $300/month.",
    amount: 300,
    icon: "Lightbulb",
    color: "#f59e0b"
  },
  {
    id: "insight-004",
    type: "alert",
    title: "Bill Due Soon",
    message: "Your phone bill is overdue by 2 days. Pay now to avoid late fees.",
    icon: "AlertTriangle",
    color: "#ef4444"
  }
]
