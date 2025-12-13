/**
 * Secure Transaction API Route
 * Example of how to use all security features
 */

import { NextRequest, NextResponse } from 'next/server'
import { rateLimitMiddleware, transactionRateLimit } from '@/lib/rate-limit'
import { validateTransaction } from '@/lib/transaction-security'
import { transactionSchema } from '@/lib/validation-schemas'
import { logTransaction } from '@/lib/audit-logger'
import { isDeviceTrusted, registerDevice, sendNewDeviceAlert } from '@/lib/device-manager'
import { sendTransactionOTP, verifyOTP } from '@/lib/otp-manager'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // 1. RATE LIMITING
    const rateLimitResult = await rateLimitMiddleware(request, transactionRateLimit)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response
    }

    // 2. PARSE & VALIDATE REQUEST
    const body = await request.json()
    const { userId, accountId, accountType = 'basic', otpCode } = body

    // Validate with Zod schema
    const validationResult = transactionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // 3. DEVICE VERIFICATION
    const isTrusted = await isDeviceTrusted(userId, request)
    if (!isTrusted) {
      const device = await registerDevice(userId, request, false)
      await sendNewDeviceAlert(userId, device)
      
      return NextResponse.json({
        error: 'Device verification required',
        message: 'This is a new device. Please verify via email/SMS.',
        requiresVerification: true
      }, { status: 403 })
    }

    // 4. TRANSACTION SECURITY VALIDATION
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'Unknown'
    
    const securityCheck = await validateTransaction(
      userId,
      accountId,
      accountType,
      data.transactionType,
      data.amount,
      ipAddress
    )

    if (!securityCheck.allowed) {
      return NextResponse.json({
        error: 'Transaction blocked',
        reason: securityCheck.reason
      }, { status: 403 })
    }

    // 5. OTP VERIFICATION (for high-risk transactions)
    if (securityCheck.requiresVerification) {
      if (!otpCode) {
        // Send OTP
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('email, phone')
          .eq('id', userId)
          .single()

        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        await sendTransactionOTP(
          userId,
          user.email,
          user.phone,
          data.amount,
          data.transactionType,
          'email'
        )

        return NextResponse.json({
          requiresOTP: true,
          message: 'Verification code sent to your email',
          riskScore: securityCheck.riskScore
        }, { status: 202 })
      }

      // Verify OTP
      const otpResult = await verifyOTP(userId, otpCode, 'transaction')
      if (!otpResult.valid) {
        return NextResponse.json({
          error: 'Invalid verification code',
          reason: otpResult.reason
        }, { status: 400 })
      }
    }

    // 6. EXECUTE TRANSACTION
    const { data: transaction, error } = await supabaseAdmin
      .from('transactions')
      .insert({
        account_id: accountId,
        transaction_type: data.transactionType,
        amount: data.amount,
        description: data.description,
        to_account_id: data.toAccountId,
        category: data.category,
        merchant_name: data.merchantName,
        status: 'completed',
        metadata: {
          ip_address: ipAddress,
          risk_score: securityCheck.riskScore
        }
      })
      .select()
      .single()

    if (error || !transaction) {
      return NextResponse.json(
        { error: 'Transaction failed', details: error },
        { status: 500 }
      )
    }

    // 7. AUDIT LOGGING
    await logTransaction(
      userId,
      transaction.id,
      data.transactionType,
      data.amount,
      request
    )

    // 8. SUCCESS RESPONSE
    return NextResponse.json({
      success: true,
      transaction,
      message: 'Transaction completed successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Transaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

