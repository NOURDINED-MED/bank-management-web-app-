import { User } from './User'

/**
 * Customer Class - Inherits from User
 * Represents bank customers with accounts and banking capabilities
 * Demonstrates Object-Oriented Inheritance pattern
 */
export class Customer extends User {
  // Customer-specific properties
  private accountNumber: string
  private balance: number
  private kycStatus: 'pending' | 'verified' | 'rejected'
  private accountType?: 'savings' | 'checking' | 'business'
  private cardNumber?: string
  private cardStatus?: 'active' | 'locked' | 'blocked' | 'inactive'

  constructor(data: {
    id: string
    email: string
    name: string
    accountNumber: string
    balance: number
    kycStatus?: 'pending' | 'verified' | 'rejected'
    accountType?: 'savings' | 'checking' | 'business'
    cardNumber?: string
    cardStatus?: 'active' | 'locked' | 'blocked' | 'inactive'
    createdAt?: string
    status?: 'active' | 'inactive' | 'suspended'
    phone?: string
    lastLogin?: string
    avatar?: string
  }) {
    // Call parent constructor with role set to 'customer'
    super({
      ...data,
      role: 'customer'
    })
    
    this.accountNumber = data.accountNumber
    this.balance = data.balance
    this.kycStatus = data.kycStatus || 'pending'
    this.accountType = data.accountType
    this.cardNumber = data.cardNumber
    this.cardStatus = data.cardStatus || 'active'
  }

  // Customer-specific getter methods
  public getAccountNumber(): string {
    return this.accountNumber
  }

  public getBalance(): number {
    return this.balance
  }

  public getKycStatus(): 'pending' | 'verified' | 'rejected' {
    return this.kycStatus
  }

  public getAccountType(): 'savings' | 'checking' | 'business' | undefined {
    return this.accountType
  }

  public getCardNumber(): string | undefined {
    return this.cardNumber
  }

  public getCardStatus(): 'active' | 'locked' | 'blocked' | 'inactive' | undefined {
    return this.cardStatus
  }

  /**
   * Deposit money into customer account
   * @param amount - Amount to deposit (must be positive)
   * @throws Error if amount is invalid
   */
  public deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive')
    }
    this.balance += amount
  }

  /**
   * Withdraw money from customer account
   * @param amount - Amount to withdraw (must be positive)
   * @throws Error if amount is invalid or insufficient balance
   */
  public withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive')
    }
    if (this.balance < amount) {
      throw new Error('Insufficient balance')
    }
    this.balance -= amount
  }

  /**
   * Check if customer has sufficient balance
   * @param amount - Amount to check
   * @returns true if balance is sufficient
   */
  public hasSufficientBalance(amount: number): boolean {
    return this.balance >= amount
  }

  /**
   * Check if customer KYC is verified
   * @returns true if KYC status is verified
   */
  public isKycVerified(): boolean {
    return this.kycStatus === 'verified'
  }

  /**
   * Override parent method to include customer-specific information
   * @returns Display name with account number
   */
  public override getDisplayName(): string {
    return `Customer: ${this.name} (${this.accountNumber})`
  }

  /**
   * Override parent method to include customer-specific fields
   * @returns Database-ready object with customer fields
   */
  public override toDatabaseFormat(): Record<string, any> {
    const baseData = super.toDatabaseFormat()
    return {
      ...baseData,
      account_number: this.accountNumber,
      balance: this.balance,
      kyc_status: this.kycStatus,
      account_type: this.accountType,
      card_number: this.cardNumber,
      card_status: this.cardStatus
    }
  }

  /**
   * Override parent method to include customer-specific fields
   * @returns JSON representation with customer fields
   */
  public override toJSON(): Record<string, any> {
    const baseData = super.toJSON()
    return {
      ...baseData,
      accountNumber: this.accountNumber,
      balance: this.balance,
      kycStatus: this.kycStatus,
      accountType: this.accountType,
      cardNumber: this.cardNumber,
      cardStatus: this.cardStatus
    }
  }
}


