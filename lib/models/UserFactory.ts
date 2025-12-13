import { User } from './User'
import { Admin } from './Admin'
import { Teller } from './Teller'
import { Customer } from './Customer'

/**
 * User Factory - Factory Pattern for creating User instances
 * Demonstrates polymorphism with Object-Oriented Inheritance
 * Takes raw database data and returns the correct User subclass instance
 */
export class UserFactory {
  /**
   * Create a User instance based on role from database data
   * Uses polymorphism to return the appropriate subclass (Admin, Teller, or Customer)
   * @param data - Raw database data containing user information
   * @returns Instance of User subclass (Admin, Teller, or Customer)
   * @throws Error if role is unknown or invalid
   */
  public static createUser(data: {
    id: string
    email: string
    full_name?: string
    name?: string
    role: 'admin' | 'teller' | 'customer' | string
    status?: 'active' | 'inactive' | 'suspended'
    phone?: string
    last_login_at?: string
    lastLogin?: string
    created_at?: string
    createdAt?: string
    avatar?: string
    // Customer-specific fields
    account_number?: string
    accountNumber?: string
    balance?: number
    kyc_status?: 'pending' | 'verified' | 'rejected'
    kycStatus?: 'pending' | 'verified' | 'rejected'
    account_type?: 'savings' | 'checking' | 'business'
    accountType?: 'savings' | 'checking' | 'business'
    card_number?: string
    cardNumber?: string
    card_status?: 'active' | 'locked' | 'blocked' | 'inactive'
    cardStatus?: 'active' | 'locked' | 'blocked' | 'inactive'
    // Teller-specific fields
    branch_id?: string
    branchId?: string
    cash_drawer_balance?: number
    cashDrawerBalance?: number
    daily_transaction_limit?: number
    dailyTransactionLimit?: number
    daily_transaction_count?: number
    dailyTransactionCount?: number
    // Admin-specific fields
    permissions?: string[]
    department?: string
    access_level?: 'full' | 'limited'
    accessLevel?: 'full' | 'limited'
  }): User {
    // Normalize field names (handle both database and API formats)
    const normalizedData = {
      id: data.id,
      email: data.email,
      name: data.name || data.full_name || '',
      role: data.role as 'admin' | 'teller' | 'customer',
      status: data.status,
      phone: data.phone,
      lastLogin: data.lastLogin || data.last_login_at,
      createdAt: data.createdAt || data.created_at,
      avatar: data.avatar
    }

    // Create appropriate subclass based on role
    switch (normalizedData.role) {
      case 'admin':
        return new Admin({
          ...normalizedData,
          permissions: data.permissions,
          department: data.department,
          accessLevel: data.accessLevel || data.access_level
        })

      case 'teller':
        return new Teller({
          ...normalizedData,
          branchId: data.branchId || data.branch_id,
          cashDrawerBalance: data.cashDrawerBalance || data.cash_drawer_balance,
          dailyTransactionLimit: data.dailyTransactionLimit || data.daily_transaction_limit,
          dailyTransactionCount: data.dailyTransactionCount || data.daily_transaction_count
        })

      case 'customer':
        // Validate required customer fields
        const accountNumber = data.accountNumber || data.account_number
        const balance = data.balance ?? 0

        if (!accountNumber) {
          throw new Error('Customer must have an account number')
        }

        return new Customer({
          ...normalizedData,
          accountNumber,
          balance,
          kycStatus: data.kycStatus || data.kyc_status,
          accountType: data.accountType || data.account_type,
          cardNumber: data.cardNumber || data.card_number,
          cardStatus: data.cardStatus || data.card_status
        })

      default:
        throw new Error(`Unknown user role: ${data.role}. Must be 'admin', 'teller', or 'customer'`)
    }
  }

  /**
   * Process a user polymorphically - demonstrates inheritance benefits
   * This method accepts the base User type but can handle all subclasses
   * @param user - User instance (can be Admin, Teller, or Customer)
   */
  public static processUser(user: User): void {
    console.log(`Processing user: ${user.getDisplayName()}`)
    console.log(`Role: ${user.getRole()}`)
    console.log(`Status: ${user.getStatus()}`)
    console.log(`Email: ${user.getEmail()}`)

    // Type-specific behavior using instanceof (polymorphism)
    if (user instanceof Customer) {
      console.log(`Account: ${user.getAccountNumber()}`)
      console.log(`Balance: $${user.getBalance()}`)
      console.log(`KYC Status: ${user.getKycStatus()}`)
    } else if (user instanceof Teller) {
      console.log(`Branch: ${user.getBranchId() || 'N/A'}`)
      console.log(`Cash Drawer: $${user.getCashDrawerBalance()}`)
      console.log(`Daily Limit: $${user.getDailyTransactionLimit() || 'Unlimited'}`)
    } else if (user instanceof Admin) {
      console.log(`Department: ${user.getDepartment() || 'N/A'}`)
      console.log(`Access Level: ${user.getAccessLevel()}`)
      console.log(`Permissions: ${user.getPermissions().length} permissions`)
    }
  }

  /**
   * Convert database row to User instance
   * Helper method for database queries
   * @param dbRow - Database row from Supabase query
   * @returns User instance
   */
  public static fromDatabaseRow(dbRow: any): User {
    return UserFactory.createUser({
      id: dbRow.id,
      email: dbRow.email,
      full_name: dbRow.full_name,
      role: dbRow.role,
      status: dbRow.status,
      phone: dbRow.phone,
      last_login_at: dbRow.last_login_at,
      created_at: dbRow.created_at,
      avatar: dbRow.avatar,
      // Customer fields
      account_number: dbRow.account_number,
      balance: dbRow.balance ? parseFloat(dbRow.balance) : undefined,
      kyc_status: dbRow.kyc_status,
      account_type: dbRow.account_type,
      card_number: dbRow.card_number,
      card_status: dbRow.card_status,
      // Teller fields
      branch_id: dbRow.branch_id,
      cash_drawer_balance: dbRow.cash_drawer_balance ? parseFloat(dbRow.cash_drawer_balance) : undefined,
      daily_transaction_limit: dbRow.daily_transaction_limit ? parseFloat(dbRow.daily_transaction_limit) : undefined,
      daily_transaction_count: dbRow.daily_transaction_count,
      // Admin fields
      permissions: dbRow.permissions,
      department: dbRow.department,
      access_level: dbRow.access_level
    })
  }
}


