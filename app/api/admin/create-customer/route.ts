import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Generate a unique account number
function generateAccountNumber(): string {
  const prefix = 'ACC'
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Generate a random card number (last 4 digits visible)
 */
function generateCardNumber(): string {
  // Generate 16-digit card number
  const digits = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10))
  
  // Ensure it starts with 4 (Visa) or 5 (Mastercard)
  digits[0] = Math.random() > 0.5 ? 4 : 5
  
  // Apply Luhn algorithm for valid card number
  let sum = 0
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i]
    if ((digits.length - i) % 2 === 0) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  
  // Adjust last digit to make it valid
  digits[15] = (10 - (sum % 10)) % 10
  
  return digits.join('')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      adminId,
      name,
      email,
      phone,
      accountType,
      initialBalance
    } = body

    // Validate required fields
    if (!adminId || !name || !email) {
      return NextResponse.json(
        { error: 'Admin ID, name, and email are required' },
        { status: 400 }
      )
    }

    // Verify the requesting user is an admin
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single()

    if (adminError || !adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate account type
    const validAccountTypes = ['checking', 'savings', 'business']
    const finalAccountType = accountType || 'checking'
    if (!validAccountTypes.includes(finalAccountType)) {
      return NextResponse.json(
        { error: 'Invalid account type' },
        { status: 400 }
      )
    }

    // Validate initial balance
    const balance = parseFloat(initialBalance || '0')
    if (isNaN(balance) || balance < 0) {
      return NextResponse.json(
        { error: 'Initial balance must be a positive number' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 400 }
      )
    }

    // Generate a temporary password (customer will need to set their own via email)
    const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`

    // Step 1: Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        phone: phone || null,
        role: 'customer',
        account_type: finalAccountType
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      
      let errorMessage = authError.message || 'Failed to create customer account'
      
      const errorMsg = authError.message?.toLowerCase() || ''
      if (errorMsg.includes('already registered') || 
          errorMsg.includes('already exists') ||
          errorMsg.includes('email') && (errorMsg.includes('taken') || errorMsg.includes('already'))) {
        errorMessage = 'This email is already registered. Please use a different email.'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? authError.message : undefined
        },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create customer account' },
        { status: 500 }
      )
    }

    const userId = authData.user.id
    const accountNumber = generateAccountNumber()

    // Step 2: Create user profile and account in parallel
    const [profileResult, accountResult] = await Promise.allSettled([
      supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email: email.trim().toLowerCase(),
          full_name: name.trim(),
          phone: phone?.trim() || null,
          role: 'customer',
          status: 'active',
          kyc_status: 'pending'
        })
        .select()
        .single(),
      supabaseAdmin
        .from('accounts')
        .insert({
          user_id: userId,
          account_number: accountNumber,
          account_type: finalAccountType,
          account_name: finalAccountType === 'business' ? 'Business Account' : finalAccountType === 'savings' ? 'Savings Account' : 'Main Checking Account',
          balance: balance.toString(),
          available_balance: balance.toString(),
          currency: 'USD',
          status: 'active'
        })
        .select()
        .single()
    ])

    // Handle profile creation result
    const profileError = profileResult.status === 'rejected' 
      ? { message: profileResult.reason?.message || String(profileResult.reason) }
      : (profileResult.value?.error || null)

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Cleanup: Delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {})
      
      return NextResponse.json(
        { error: 'Failed to create customer profile', details: profileError.message },
        { status: 500 }
      )
    }

    // Handle account creation result
    const accountError = accountResult.status === 'rejected'
      ? { message: accountResult.reason?.message || String(accountResult.reason) }
      : (accountResult.value?.error || null)

    // Create a card automatically when account is created
    let cardData = null
    if (accountResult.status === 'fulfilled' && !accountResult.value?.error && accountResult.value?.data) {
      try {
        const accountId = accountResult.value.data.id
        const cardNumber = generateCardNumber()
        const expiryMonth = new Date().getMonth() + 1
        const expiryYear = new Date().getFullYear() + 3 // 3 years from now
        const cvv = Math.floor(Math.random() * 900 + 100).toString() // Generate 3-digit CVV

        const { data: newCard, error: cardError } = await supabaseAdmin
          .from('cards')
          .insert({
            account_id: accountId,
            card_number: cardNumber,
            card_type: 'debit',
            card_status: 'active',
            expiry_month: expiryMonth,
            expiry_year: expiryYear,
            cvv: cvv, // Store CVV (in production, this should be encrypted)
            daily_limit: 1000.00,
            monthly_limit: 10000.00
          })
          .select()
          .single()

        if (!cardError && newCard) {
          cardData = newCard
          console.log('✅ Card created automatically for new account')
        } else {
          console.warn('⚠️ Card creation failed (non-critical):', cardError?.message)
        }
      } catch (cardErr: any) {
        console.warn('⚠️ Card creation error (non-critical):', cardErr.message)
      }
    }

    if (accountError) {
      console.error('Account creation error:', accountError)
      // Cleanup: Delete auth user and profile if account creation fails
      try {
        await supabaseAdmin.from('users').delete().eq('id', userId)
        await supabaseAdmin.auth.admin.deleteUser(userId)
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError)
      }
      
      return NextResponse.json(
        { error: 'Failed to create customer account', details: accountError.message },
        { status: 500 }
      )
    }

    const profileData = profileResult.status === 'fulfilled' ? profileResult.value.data : null
    const accountData = accountResult.status === 'fulfilled' ? accountResult.value.data : null

    return NextResponse.json({
      success: true,
      customer: {
        id: profileData?.id || userId,
        email: profileData?.email || email,
        name: profileData?.full_name || name,
        phone: profileData?.phone || phone || '',
        accountNumber: accountData?.account_number || accountNumber,
        accountType: accountData?.account_type || finalAccountType,
        balance: accountData ? parseFloat(accountData.balance || '0') : balance,
        status: profileData?.status || 'active',
        kycStatus: profileData?.kyc_status || 'pending'
      },
      tempPassword: tempPassword, // Return temporary password for admin to share with customer
      message: 'Customer created successfully'
    })
  } catch (error: any) {
    console.error('Create customer API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

    