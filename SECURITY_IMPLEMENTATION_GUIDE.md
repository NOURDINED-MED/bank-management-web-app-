# 🔐 BAMS Security Implementation Guide

## Overview

This document outlines the comprehensive security features implemented in the Banking Application Management System (BAMS). These features protect user data, prevent fraud, and ensure compliance with banking security standards.

---

## 🛡️ Security Features Implemented

### ✅ 1. Security Headers (OWASP Recommended)
**Location:** `next.config.mjs`

Implemented security headers:
- **Strict-Transport-Security (HSTS)**: Forces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Enables browser XSS protection
- **Content-Security-Policy (CSP)**: Restricts content sources
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### ✅ 2. Rate Limiting
**Location:** `lib/rate-limit.ts`

Prevents brute force attacks and API abuse:
- **Login Rate Limit**: 5 attempts per 15 minutes
- **Transaction Rate Limit**: 10 transactions per minute
- **General API Rate Limit**: 100 requests per minute
- **Strict Rate Limit**: 5 requests per minute (sensitive endpoints)

**Usage Example:**
```typescript
import { rateLimitMiddleware, loginRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const rateLimitResult = await rateLimitMiddleware(request, loginRateLimit)
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response
  }
  // Continue with your logic...
}
```

### ✅ 3. Input Validation (Zod)
**Location:** `lib/validation-schemas.ts`

All user inputs are validated using Zod schemas:
- **Signup validation**: Email, password strength, name format
- **Transaction validation**: Amount limits, description sanitization
- **Profile updates**: Phone, address, ZIP code format
- **Card management**: Daily/monthly limits
- **KYC documents**: File type, size restrictions

**Usage Example:**
```typescript
import { transactionSchema } from '@/lib/validation-schemas'

const result = transactionSchema.safeParse(userInput)
if (!result.success) {
  return { error: result.error.errors }
}
```

### ✅ 4. Session Management
**Location:** `lib/session-manager.ts`

Features:
- **Session timeout**: 30 minutes of inactivity
- **Max concurrent sessions**: 5 devices per user
- **Session tracking**: Device info, IP, location
- **Logout from all devices**: Terminate all sessions at once
- **Suspicious session detection**: Alert on unusual patterns

**Key Functions:**
- `createSession()` - Create new session
- `getUserSessions()` - Get all active sessions
- `terminateSession()` - End specific session
- `terminateAllSessions()` - Logout everywhere
- `isSessionValid()` - Check session validity

### ✅ 5. Transaction Security
**Location:** `lib/transaction-security.ts`

Multi-layered transaction protection:

**Transaction Limits by Account Type:**

| Account Type | Daily Withdrawal | Daily Transfer | Single Transaction | Monthly Limit |
|-------------|------------------|----------------|-------------------|---------------|
| Basic       | $1,000          | $5,000         | $5,000            | $50,000       |
| Premium     | $5,000          | $25,000        | $25,000           | $250,000      |
| Business    | $50,000         | $100,000       | $100,000          | $1,000,000    |

**Velocity Checks:**
- Basic: 5 transactions/minute
- Premium: 10 transactions/minute
- Business: 20 transactions/minute

**Fraud Detection Flags:**
- First transaction (30 points)
- Amount 5x higher than average (40 points)
- Multiple rapid transactions (35 points)
- Unusual hours (2 AM - 5 AM) (20 points)
- Large withdrawal >$10k (25 points)
- Risk Score ≥ 50 = Suspicious

**Usage Example:**
```typescript
import { validateTransaction } from '@/lib/transaction-security'

const result = await validateTransaction(
  userId,
  accountId,
  'premium',
  'transfer',
  5000,
  ipAddress
)

if (!result.allowed) {
  return { error: result.reason }
}

if (result.requiresVerification) {
  // Send OTP for verification
}
```

### ✅ 6. Audit Logging
**Location:** `lib/audit-logger.ts`

Comprehensive activity tracking:

**Logged Events:**
- User authentication (login/logout)
- Profile changes
- Transaction activity
- Security events
- Admin actions
- Failed login attempts
- Account modifications

**Data Captured:**
- User ID, action type, timestamp
- IP address, user agent
- Old data vs. new data (for updates)
- Additional metadata

**Usage Example:**
```typescript
import { logAudit } from '@/lib/audit-logger'

await logAudit({
  userId,
  action: 'transaction.create',
  entityType: 'transaction',
  entityId: transactionId,
  description: `Transfer of $${amount}`,
  request,
  newData: { amount, recipient }
})
```

### ✅ 7. Device Management
**Location:** `lib/device-manager.ts`

Track and manage trusted devices:
- **Device fingerprinting**: Unique device identification
- **Trusted devices**: Skip 2FA for known devices
- **New device alerts**: Email/SMS notification
- **Device removal**: Revoke device access
- **Auto cleanup**: Remove devices unused for 90 days

**Usage Example:**
```typescript
import { isDeviceTrusted, registerDevice } from '@/lib/device-manager'

const isTrusted = await isDeviceTrusted(userId, request)
if (!isTrusted) {
  const device = await registerDevice(userId, request)
  await sendNewDeviceAlert(userId, device)
  // Require 2FA
}
```

### ✅ 8. OTP System
**Location:** `lib/otp-manager.ts`

One-Time Password for verification:
- **OTP length**: 6 digits
- **Expiry time**: 10 minutes
- **Max attempts**: 3 attempts before invalidation
- **Channels**: Email and SMS
- **Purposes**: Transaction, 2FA, password reset, email verification

**Usage Example:**
```typescript
import { createOTP, verifyOTP } from '@/lib/otp-manager'

// Send OTP
const { code, id } = await createOTP(userId, 'transaction', 'email')
await sendOTPEmail(userEmail, code, 'transaction verification')

// Verify OTP
const result = await verifyOTP(userId, userEnteredCode, 'transaction')
if (!result.valid) {
  return { error: result.reason }
}
```

---

## 📊 Database Schema

### Required Tables

The following tables need to be created in Supabase:

```sql
-- See supabase-security-schema.sql for full schema
```

**Core Security Tables:**
1. `sessions` - Active user sessions
2. `trusted_devices` - Registered devices
3. `otp_codes` - Verification codes
4. `security_events` - Security alerts
5. `audit_logs` - Activity tracking
6. `failed_login_attempts` - Brute force protection

### Setup Instructions

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor

2. **Run Security Schema**
   ```bash
   # Copy contents of supabase-security-schema.sql
   # Paste into SQL Editor
   # Click "Run"
   ```

3. **Verify Tables Created**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('sessions', 'trusted_devices', 'otp_codes', 'security_events', 'audit_logs');
   ```

---

## 🚀 Quick Start Implementation

### Example: Secure Login Flow

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { rateLimitMiddleware, loginRateLimit } from '@/lib/rate-limit'
import { loginSchema } from '@/lib/validation-schemas'
import { logLogin } from '@/lib/audit-logger'
import { isDeviceTrusted } from '@/lib/device-manager'
import { send2FAOTP } from '@/lib/otp-manager'

export async function POST(request: NextRequest) {
  // 1. Rate limiting
  const rateLimitResult = await rateLimitMiddleware(request, loginRateLimit)
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response
  }

  // 2. Validate input
  const body = await request.json()
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { email, password } = result.data

  // 3. Verify credentials
  // ... authentication logic ...

  // 4. Check if device is trusted
  const isTrusted = await isDeviceTrusted(userId, request)
  if (!isTrusted) {
    // Send 2FA code
    await send2FAOTP(userId, email, userPhone, 'email')
    return NextResponse.json({ 
      requires2FA: true,
      message: 'Verification code sent'
    })
  }

  // 5. Log successful login
  await logLogin(userId, email, request, true)

  // 6. Return success
  return NextResponse.json({ success: true, token: '...' })
}
```

### Example: Secure Transaction Flow

See `app/api/secure-transaction/route.ts` for complete implementation.

---

## 🎯 Security Best Practices

### 1. Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NEVER expose service role key in client-side code
```

### 2. Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### 3. Transaction Verification
Always require OTP for:
- Transactions ≥ $10,000
- Risk score ≥ 50
- First transaction from account
- Login from new device

### 4. Session Security
- Expire sessions after 30 minutes of inactivity
- Limit to 5 concurrent sessions per user
- Detect and alert on suspicious session patterns

### 5. Data Encryption
- Passwords: Hashed with bcrypt
- Sensitive data: Encrypted with AES-256
- Communication: HTTPS/TLS 1.3 only

---

## 📱 UI Components

### Security Dashboard
**Location:** `app/customer/security/page.tsx`

Features:
- View active sessions
- Manage trusted devices
- Activity log
- Security settings
- 2FA management

### Navigation Integration
Add to customer navbar:
```tsx
<Link href="/customer/security">
  <Shield className="h-4 w-4 mr-2" />
  Security
</Link>
```

---

## 🔍 Monitoring & Alerts

### Security Events to Monitor

1. **Critical Events (Immediate Alert)**
   - Multiple failed login attempts (5+)
   - Large withdrawal (>$50,000)
   - Account takeover indicators
   - Fraud detection score >70

2. **High Priority Events**
   - Login from new location
   - Transaction from new device
   - Password change
   - 2FA disabled

3. **Medium Priority Events**
   - Multiple transactions in short time
   - Large transaction (>$10,000)
   - Profile information change

### Admin Dashboard Integration

Add security monitoring to admin dashboard:
```tsx
import { getAuditStatistics } from '@/lib/audit-logger'

const stats = await getAuditStatistics(undefined, 7) // Last 7 days

console.log(`
  Total Events: ${stats.totalLogs}
  Login Attempts: ${stats.loginAttempts}
  Failed Logins: ${stats.failedLogins}
  Transactions: ${stats.transactions}
  Security Events: ${stats.securityEvents}
`)
```

---

## 🧪 Testing Checklist

- [ ] Rate limiting prevents brute force
- [ ] Invalid inputs are rejected
- [ ] Sessions expire after 30 minutes
- [ ] Transaction limits enforced
- [ ] OTP codes work correctly
- [ ] Device fingerprinting works
- [ ] Audit logs capture all events
- [ ] Security headers present
- [ ] HTTPS enforced in production
- [ ] Suspicious activity detected

---

## 📚 Additional Resources

### OWASP Top 10 Coverage

✅ A01:2021 – Broken Access Control
✅ A02:2021 – Cryptographic Failures  
✅ A03:2021 – Injection (SQL, XSS)
✅ A04:2021 – Insecure Design
✅ A05:2021 – Security Misconfiguration
✅ A07:2021 – Identification and Authentication Failures

### Compliance Standards

- **PCI DSS**: Payment Card Industry Data Security Standard
- **GDPR**: General Data Protection Regulation
- **SOC 2**: Service Organization Control 2
- **ISO 27001**: Information Security Management

---

## 🆘 Troubleshooting

### Common Issues

**1. Rate Limit False Positives**
```typescript
// Reset rate limit for specific user
import { resetRateLimit } from '@/lib/rate-limit'
resetRateLimit(userIdentifier)
```

**2. Session Not Expiring**
```typescript
// Manually expire session
import { terminateSession } from '@/lib/session-manager'
await terminateSession(sessionId)
```

**3. OTP Not Received**
- Check email/SMS service configuration
- Verify OTP expiry time (10 minutes)
- Check spam folder

---

## 📞 Support

For security concerns or questions:
- Review this documentation
- Check `lib/` folder for implementation details
- Refer to inline code comments

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Security Level:** Enterprise Grade 🔐

