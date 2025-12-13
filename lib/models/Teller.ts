import { User } from './User'

/**
 * Teller Class - Inherits from User
 * Represents bank tellers who process customer transactions
 * Demonstrates Object-Oriented Inheritance pattern
 */
export class Teller extends User {
  // Teller-specific properties
  private branchId?: string
  private cashDrawerBalance: number
  private dailyTransactionLimit?: number
  private dailyTransactionCount?: number

  constructor(data: {
    id: string
    email: string
    name: string
    branchId?: string
    cashDrawerBalance?: number
    dailyTransactionLimit?: number
    dailyTransactionCount?: number
    createdAt?: string
    status?: 'active' | 'inactive' | 'suspended'
    phone?: string
    lastLogin?: string
    avatar?: string
  }) {
    // Call parent constructor with role set to 'teller'
    super({
      ...data,
      role: 'teller'
    })
    
    this.branchId = data.branchId
    this.cashDrawerBalance = data.cashDrawerBalance || 0
    this.dailyTransactionLimit = data.dailyTransactionLimit
    this.dailyTransactionCount = data.dailyTransactionCount || 0
  }

  // Teller-specific getter methods
  public getBranchId(): string | undefined {
    return this.branchId
  }

  public getCashDrawerBalance(): number {
    return this.cashDrawerBalance
  }

  public getDailyTransactionLimit(): number | undefined {
    return this.dailyTransactionLimit
  }

  public getDailyTransactionCount(): number {
    return this.dailyTransactionCount || 0
  }

  /**
   * Process a transaction (deposit, withdrawal, or transfer)
   * Updates cash drawer balance and transaction count
   * @param transactionType - Type of transaction ('deposit' | 'withdrawal' | 'transfer')
   * @param amount - Transaction amount
   * @returns true if transaction was processed successfully
   * @throws Error if transaction limit exceeded or invalid amount
   */
  public processTransaction(transactionType: 'deposit' | 'withdrawal' | 'transfer', amount: number): boolean {
    if (amount <= 0) {
      throw new Error('Transaction amount must be positive')
    }

    // Check daily transaction limit if set
    if (this.dailyTransactionLimit && this.dailyTransactionCount !== undefined) {
      if (this.dailyTransactionCount + amount > this.dailyTransactionLimit) {
        throw new Error('Daily transaction limit exceeded')
      }
    }

    // Update cash drawer based on transaction type
    if (transactionType === 'deposit') {
      this.cashDrawerBalance += amount
    } else if (transactionType === 'withdrawal') {
      if (this.cashDrawerBalance < amount) {
        throw new Error('Insufficient cash in drawer')
      }
      this.cashDrawerBalance -= amount
    }
    // Transfer doesn't affect cash drawer

    // Increment transaction count
    if (this.dailyTransactionCount !== undefined) {
      this.dailyTransactionCount += amount
    }

    return true
  }

  /**
   * Check if teller can process a transaction
   * @param amount - Transaction amount to check
   * @returns true if transaction can be processed
   */
  public canProcessTransaction(amount: number): boolean {
    if (this.dailyTransactionLimit && this.dailyTransactionCount !== undefined) {
      return (this.dailyTransactionCount + amount) <= this.dailyTransactionLimit
    }
    return true
  }

  /**
   * Update cash drawer balance
   * @param amount - Amount to add (positive) or subtract (negative)
   */
  public updateCashDrawer(amount: number): void {
    this.cashDrawerBalance += amount
    if (this.cashDrawerBalance < 0) {
      throw new Error('Cash drawer balance cannot be negative')
    }
  }

  /**
   * Reset daily transaction count
   */
  public resetDailyTransactionCount(): void {
    this.dailyTransactionCount = 0
  }

  /**
   * Override parent method to include teller-specific information
   * @returns Display name with branch information
   */
  public override getDisplayName(): string {
    const branchInfo = this.branchId ? ` (Branch: ${this.branchId})` : ''
    return `Teller: ${this.name}${branchInfo}`
  }

  /**
   * Override parent method to include teller-specific fields
   * @returns Database-ready object with teller fields
   */
  public override toDatabaseFormat(): Record<string, any> {
    const baseData = super.toDatabaseFormat()
    return {
      ...baseData,
      branch_id: this.branchId,
      cash_drawer_balance: this.cashDrawerBalance,
      daily_transaction_limit: this.dailyTransactionLimit,
      daily_transaction_count: this.dailyTransactionCount
    }
  }

  /**
   * Override parent method to include teller-specific fields
   * @returns JSON representation with teller fields
   */
  public override toJSON(): Record<string, any> {
    const baseData = super.toJSON()
    return {
      ...baseData,
      branchId: this.branchId,
      cashDrawerBalance: this.cashDrawerBalance,
      dailyTransactionLimit: this.dailyTransactionLimit,
      dailyTransactionCount: this.dailyTransactionCount
    }
  }
}


