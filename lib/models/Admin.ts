import { User } from './User'

/**
 * Admin Class - Inherits from User
 * Represents bank administrators with full system access
 * Demonstrates Object-Oriented Inheritance pattern
 */
export class Admin extends User {
  // Admin-specific properties
  private permissions: string[]
  private department?: string
  private accessLevel?: 'full' | 'limited'

  constructor(data: {
    id: string
    email: string
    name: string
    permissions?: string[]
    department?: string
    accessLevel?: 'full' | 'limited'
    createdAt?: string
    status?: 'active' | 'inactive' | 'suspended'
    phone?: string
    lastLogin?: string
    avatar?: string
  }) {
    // Call parent constructor with role set to 'admin'
    super({
      ...data,
      role: 'admin'
    })
    
    this.permissions = data.permissions || []
    this.department = data.department
    this.accessLevel = data.accessLevel || 'full'
  }

  // Admin-specific getter methods
  public getPermissions(): string[] {
    return this.permissions
  }

  public getDepartment(): string | undefined {
    return this.department
  }

  public getAccessLevel(): 'full' | 'limited' {
    return this.accessLevel || 'full'
  }

  /**
   * Check if admin has a specific permission
   * @param permission - Permission string to check
   * @returns true if admin has the permission or has full access
   */
  public hasPermission(permission: string): boolean {
    if (this.accessLevel === 'full') {
      return true
    }
    return this.permissions.includes(permission)
  }

  /**
   * Add a permission to admin
   * @param permission - Permission string to add
   */
  public addPermission(permission: string): void {
    if (!this.permissions.includes(permission)) {
      this.permissions.push(permission)
    }
  }

  /**
   * Remove a permission from admin
   * @param permission - Permission string to remove
   */
  public removePermission(permission: string): void {
    this.permissions = this.permissions.filter(p => p !== permission)
  }

  /**
   * Check if admin has full access
   * @returns true if access level is 'full'
   */
  public hasFullAccess(): boolean {
    return this.accessLevel === 'full'
  }

  /**
   * Override parent method to include admin-specific information
   * @returns Display name with department information
   */
  public override getDisplayName(): string {
    const deptInfo = this.department ? ` (${this.department})` : ''
    return `Admin: ${this.name}${deptInfo}`
  }

  /**
   * Override parent method to include admin-specific fields
   * @returns Database-ready object with admin fields
   */
  public override toDatabaseFormat(): Record<string, any> {
    const baseData = super.toDatabaseFormat()
    return {
      ...baseData,
      permissions: this.permissions,
      department: this.department,
      access_level: this.accessLevel
    }
  }

  /**
   * Override parent method to include admin-specific fields
   * @returns JSON representation with admin fields
   */
  public override toJSON(): Record<string, any> {
    const baseData = super.toJSON()
    return {
      ...baseData,
      permissions: this.permissions,
      department: this.department,
      accessLevel: this.accessLevel
    }
  }
}


