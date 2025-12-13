import type { UserRole, Permission, RolePermissions } from "./types"

// Define permissions for each role
export const rolePermissions: RolePermissions[] = [
  {
    role: "super_admin",
    permissions: [
      "users.view", "users.create", "users.edit", "users.delete",
      "transactions.view", "transactions.edit", "transactions.approve",
      "reports.view", "reports.create", "reports.export",
      "audit.view", "audit.export",
      "settings.view", "settings.edit",
      "fraud.view", "fraud.manage",
      "tickets.view", "tickets.manage",
      "api.manage",
      "notifications.manage",
      "analytics.view"
    ],
    description: "Full system access with all permissions"
  },
  {
    role: "manager",
    permissions: [
      "users.view", "users.create", "users.edit",
      "transactions.view", "transactions.approve",
      "reports.view", "reports.create", "reports.export",
      "audit.view",
      "fraud.view", "fraud.manage",
      "tickets.view", "tickets.manage",
      "analytics.view"
    ],
    description: "Manage users, approve transactions, handle tickets"
  },
  {
    role: "support",
    permissions: [
      "users.view",
      "transactions.view",
      "tickets.view", "tickets.manage",
      "reports.view"
    ],
    description: "Customer support with ticket management"
  },
  {
    role: "auditor",
    permissions: [
      "users.view",
      "transactions.view",
      "reports.view", "reports.export",
      "audit.view", "audit.export",
      "fraud.view",
      "analytics.view"
    ],
    description: "Read-only access for compliance and auditing"
  },
  {
    role: "admin",
    permissions: [
      "users.view", "users.create", "users.edit",
      "transactions.view", "transactions.edit",
      "reports.view", "reports.create",
      "audit.view",
      "settings.view", "settings.edit",
      "fraud.view",
      "tickets.view",
      "analytics.view"
    ],
    description: "Legacy admin role with standard permissions"
  },
  {
    role: "teller",
    permissions: [
      "users.view",
      "transactions.view", "transactions.edit"
    ],
    description: "Process transactions for customers"
  },
  {
    role: "customer",
    permissions: [],
    description: "Standard customer account"
  }
]

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const roleConfig = rolePermissions.find(r => r.role === role)
  return roleConfig ? roleConfig.permissions.includes(permission) : false
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  const roleConfig = rolePermissions.find(r => r.role === role)
  return roleConfig ? roleConfig.permissions : []
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission))
}

/**
 * Check if user has all of the required permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission))
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const roleConfig = rolePermissions.find(r => r.role === role)
  return roleConfig?.description || ""
}

