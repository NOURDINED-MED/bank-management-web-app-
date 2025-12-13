/**
 * Base User Class - Parent class for all user types
 * Implements common properties and methods inherited by Admin, Teller, and Customer
 */
export class User {
  // Common Properties (inherited by all child classes)
  protected id: string
  protected email: string
  protected name: string
  protected role: 'admin' | 'teller' | 'customer'
  protected createdAt: string
  protected status: 'active' | 'inactive' | 'suspended'
  protected phone?: string
  protected lastLogin?: string
  protected avatar?: string

  constructor(data: {
    id: string
    email: string
    name: string
    role: 'admin' | 'teller' | 'customer'
    createdAt?: string
    status?: 'active' | 'inactive' | 'suspended'
    phone?: string
    lastLogin?: string
    avatar?: string
  }) {
    this.id = data.id
    this.email = data.email
    this.name = data.name
    this.role = data.role
    this.createdAt = data.createdAt || new Date().toISOString()
    this.status = data.status || 'active'
    this.phone = data.phone
    this.lastLogin = data.lastLogin
    this.avatar = data.avatar
  }

  // Common Methods (inherited by all child classes)
  public getId(): string {
    return this.id
  }

  public getEmail(): string {
    return this.email
  }

  public getName(): string {
    return this.name
  }

  public getRole(): 'admin' | 'teller' | 'customer' {
    return this.role
  }

  public getStatus(): 'active' | 'inactive' | 'suspended' {
    return this.status
  }

  public getCreatedAt(): string {
    return this.createdAt
  }

  public getPhone(): string | undefined {
    return this.phone
  }

  public getLastLogin(): string | undefined {
    return this.lastLogin
  }

  public getAvatar(): string | undefined {
    return this.avatar
  }

  /**
   * Check if user has a specific role
   * @param role - The role to check
   * @returns true if user has the specified role
   */
  public hasRole(role: 'admin' | 'teller' | 'customer'): boolean {
    return this.role === role
  }

  /**
   * Get display name for the user
   * Can be overridden by child classes
   * @returns Display name string
   */
  public getDisplayName(): string {
    return this.name || this.email
  }

  /**
   * Check if user is active
   * @returns true if user status is active
   */
  public isActive(): boolean {
    return this.status === 'active'
  }

  /**
   * Update last login timestamp
   */
  public updateLastLogin(): void {
    this.lastLogin = new Date().toISOString()
  }

  /**
   * Convert user to database format
   * Can be overridden by child classes
   * @returns Object ready for database insertion
   */
  public toDatabaseFormat(): Record<string, any> {
    return {
      id: this.id,
      email: this.email,
      full_name: this.name,
      role: this.role,
      status: this.status,
      phone: this.phone,
      last_login_at: this.lastLogin,
      created_at: this.createdAt,
      avatar: this.avatar
    }
  }

  /**
   * Convert user to JSON format
   * @returns JSON representation of user
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      status: this.status,
      createdAt: this.createdAt,
      phone: this.phone,
      lastLogin: this.lastLogin,
      avatar: this.avatar
    }
  }
}


