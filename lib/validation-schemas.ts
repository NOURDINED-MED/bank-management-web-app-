/**
 * Validation Schemas using Zod
 * All user inputs MUST be validated using these schemas
 */

import { z } from 'zod'

// =====================================================
// USER & AUTHENTICATION SCHEMAS
// =====================================================

export const signupSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(5, 'Email is too short')
    .max(100, 'Email is too long')
    .transform(val => val.toLowerCase().trim()),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  
  fullName: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
    .transform(val => val.trim()),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  
  dateOfBirth: z.string()
    .refine((date) => {
      const age = new Date().getFullYear() - new Date(date).getFullYear()
      return age >= 18 && age <= 120
    }, 'You must be at least 18 years old'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').transform(val => val.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

// =====================================================
// TRANSACTION SCHEMAS
// =====================================================

export const transactionSchema = z.object({
  accountId: z.string().uuid('Invalid account ID'),
  
  transactionType: z.enum(['deposit', 'withdrawal', 'transfer', 'payment'], {
    errorMap: () => ({ message: 'Invalid transaction type' })
  }),
  
  amount: z.number()
    .positive('Amount must be positive')
    .max(100000, 'Amount exceeds maximum limit of $100,000')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  
  description: z.string()
    .min(1, 'Description is required')
    .max(200, 'Description is too long')
    .transform(val => val.trim()),
  
  toAccountId: z.string().uuid().optional(),
  category: z.string().max(50).optional(),
  merchantName: z.string().max(100).optional(),
})

export const sendMoneySchema = z.object({
  recipientEmail: z.string().email('Invalid recipient email').or(
    z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
  ),
  
  amount: z.number()
    .positive('Amount must be positive')
    .min(0.01, 'Minimum amount is $0.01')
    .max(10000, 'Maximum amount is $10,000 per transaction'),
  
  description: z.string()
    .max(200, 'Description is too long')
    .optional(),
  
  fromAccountId: z.string().uuid('Invalid account ID'),
})

// Daily transaction limits
export const transactionLimitsSchema = z.object({
  dailyDepositLimit: z.number().min(0).max(1000000),
  dailyWithdrawalLimit: z.number().min(0).max(50000),
  dailyTransferLimit: z.number().min(0).max(100000),
  monthlyLimit: z.number().min(0).max(5000000),
})

// =====================================================
// CARD SCHEMAS
// =====================================================

export const cardSchema = z.object({
  accountId: z.string().uuid('Invalid account ID'),
  cardType: z.enum(['debit', 'credit', 'virtual']),
  dailyLimit: z.number().min(100).max(10000),
  monthlyLimit: z.number().min(500).max(100000),
})

export const updateCardLimitsSchema = z.object({
  cardId: z.string().uuid('Invalid card ID'),
  dailyLimit: z.number().min(100).max(10000).optional(),
  monthlyLimit: z.number().min(500).max(100000).optional(),
})

// =====================================================
// PROFILE & SETTINGS SCHEMAS
// =====================================================

export const updateProfileSchema = z.object({
  fullName: z.string().min(3).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code').optional(),
})

export const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  transactionAlerts: z.boolean(),
  securityAlerts: z.boolean(),
  marketingEmails: z.boolean(),
})

// =====================================================
// KYC & DOCUMENT SCHEMAS
// =====================================================

export const kycDocumentSchema = z.object({
  documentType: z.enum(['id_front', 'id_back', 'proof_of_address', 'tax_form', 'other']),
  fileName: z.string().max(255),
  fileSize: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB'),
  mimeType: z.enum([
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf'
  ], { errorMap: () => ({ message: 'Only JPEG, PNG, and PDF files are allowed' }) }),
})

// =====================================================
// ADMIN SCHEMAS
// =====================================================

export const createUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(3).max(100),
  role: z.enum(['customer', 'teller', 'admin']),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
})

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['customer', 'teller', 'admin']),
})

// =====================================================
// LOAN SCHEMAS
// =====================================================

export const loanApplicationSchema = z.object({
  loanType: z.enum(['personal', 'auto', 'home', 'business']),
  loanAmount: z.number().min(1000).max(1000000),
  termMonths: z.number().min(12).max(360),
  annualIncome: z.number().min(0),
  employmentStatus: z.enum(['employed', 'self-employed', 'unemployed', 'retired']),
  purpose: z.string().max(500),
})

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validate and sanitize amount
 */
export function sanitizeAmount(amount: number): number {
  const sanitized = Math.abs(amount)
  return Math.round(sanitized * 100) / 100 // Round to 2 decimal places
}

/**
 * Validate email format (strict)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email)
}

/**
 * Validate SSN format
 */
export function isValidSSN(ssn: string): boolean {
  // Validates XXX-XX-XXXX or last 4 digits
  return /^\d{3}-?\d{2}-?\d{4}$/.test(ssn) || /^\d{4}$/.test(ssn)
}

/**
 * Mask sensitive data
 */
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@')
  if (username.length <= 2) return `**@${domain}`
  return `${username.slice(0, 2)}***@${domain}`
}

export function maskPhone(phone: string): string {
  return phone.replace(/\d(?=\d{4})/g, '*')
}

export function maskSSN(ssn: string): string {
  return `***-**-${ssn.slice(-4)}`
}

export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '')
  return `${cleaned.slice(0, 4)} **** **** ${cleaned.slice(-4)}`
}

