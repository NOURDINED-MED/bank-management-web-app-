import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Generate a random 16-digit card number
function generateCardNumber(): string {
  // Generate 16 digits
  let cardNumber = ''
  for (let i = 0; i < 16; i++) {
    cardNumber += Math.floor(Math.random() * 10).toString()
  }
  return cardNumber
}

// Generate a random 3-digit CVV
function generateCvv(): string {
  return Math.floor(Math.random() * 900 + 100).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      fullName,
      phone,
      address,
      city,
      state,
      zipCode,
      dateOfBirth,
      accountType,
      businessName,
      // KYC fields
      ssnLast4,
      citizenship,
      employmentStatus,
      employer,
      occupation,
      annualIncome,
      sourceOfFunds,
      emergencyName,
      emergencyRelationship,
      emergencyPhone
    } = body

    // Validate required fields
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    // Step 1: Create auth user directly (Supabase will error if email exists)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email - no email verification needed
      user_metadata: {
        full_name: fullName,
        phone,
        account_type: accountType
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      
      // Better error handling for specific cases
      let errorMessage = authError.message || 'Failed to create account'
      
      // Check for email already exists errors
      const errorMsg = authError.message?.toLowerCase() || ''
      if (errorMsg.includes('already registered') || 
          errorMsg.includes('already exists') ||
          errorMsg.includes('email') && (errorMsg.includes('taken') || errorMsg.includes('already')) ||
          errorMsg.includes('user already registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.'
      } else if (errorMsg.includes('invalid') && errorMsg.includes('email')) {
        errorMessage = 'Please enter a valid email address.'
      } else if (errorMsg.includes('password')) {
        errorMessage = 'Password does not meet requirements. Please use a stronger password.'
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
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Step 2 & 3: Create profile and account in parallel for faster signup
    const accountNumber = `ACC-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    const userId = authData.user.id
    
    // Starting balance for new customers
    const startingBalance = 0

    // Run profile and account creation in parallel
    const [profileResult, accountResult] = await Promise.allSettled([
      // Create user profile
      supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email,
          full_name: fullName,
          phone: phone || null,
          role: 'customer',
          address: address || null,
          city: city || null,
          state: state || null,
          postal_code: zipCode || null,
          date_of_birth: dateOfBirth || null,
          ssn_last_four: ssnLast4 || null,
          status: 'active',
          kyc_status: 'pending'
        })
        .select()
        .single(),
      // Create initial account with $0 starting balance
      supabaseAdmin
        .from('accounts')
        .insert({
          user_id: userId,
          account_number: accountNumber,
          account_type: accountType === 'business' ? 'business' : 'checking',
          account_name: accountType === 'business' ? `${businessName || 'Business'} - Main Account` : 'Main Checking Account',
          balance: startingBalance.toString(), // Ensure it's a string for DECIMAL type
          available_balance: startingBalance.toString(), // Ensure it's a string for DECIMAL type
          currency: 'USD',
          status: 'active'
        })
        .select()
        .single()
    ])

    // Handle profile creation result
    const profileError = profileResult.status === 'rejected' 
      ? { message: profileResult.reason?.message || String(profileResult.reason), code: null }
      : (profileResult.value?.error || null)

    if (profileResult.status === 'rejected' || profileError) {
      console.error('Profile creation error:', profileError)
      
      // Check if profile already exists
      if (profileError && (profileError.code === '23505' || profileError.message?.includes('duplicate') || profileError.message?.includes('unique'))) {
        const { data: existingProfile } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (existingProfile) {
          const accountData = accountResult.status === 'fulfilled' && !accountResult.value?.error 
            ? accountResult.value?.data 
            : null
          return NextResponse.json({
            success: true,
            user: existingProfile,
            account: accountData,
            message: 'Account already exists. You can now sign in.'
          })
        }
      }
      
      // Table not found error
      if (profileError && (profileError.code === '42P01' || profileError.message?.includes('does not exist'))) {
        // Cleanup auth user
        await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {})
        return NextResponse.json(
          { error: 'Database tables not found. Please run the schema.sql file in your Supabase SQL Editor.' },
          { status: 400 }
        )
      }
      
      // Cleanup auth user on profile failure
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {})
      
      return NextResponse.json(
        { 
          error: profileError?.message || 'Failed to create user profile',
          code: profileError?.code
        },
        { status: 400 }
      )
    }

    // Get profile data safely
    const profileData = profileResult.status === 'fulfilled' && profileResult.value?.data 
      ? profileResult.value.data 
      : null

    if (!profileData) {
      // Cleanup auth user if we don't have profile data
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {})
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    // Get account data safely
    const accountData = accountResult.status === 'fulfilled' && !accountResult.value?.error 
      ? accountResult.value?.data 
      : null

    // Create a card automatically when account is created
    let cardData = null
    if (accountData) {
      try {
        const cardNumber = generateCardNumber()
        const expiryMonth = new Date().getMonth() + 1
        const expiryYear = new Date().getFullYear() + 3 // 3 years from now
        const cvv = generateCvv() // Generate 3-digit CVV

        const { data: newCard, error: cardError } = await supabaseAdmin
          .from('cards')
          .insert({
            account_id: accountData.id,
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

    // Account creation is critical - check if it failed
    if (accountResult.status === 'rejected' || accountResult.value?.error || !accountData) {
      const accountError = accountResult.status === 'rejected' 
        ? accountResult.reason 
        : accountResult.value?.error
      
      console.error('❌ Account creation failed:', accountError)
      
      // Try to create account again as a fallback
      try {
        console.log('🔄 Retrying account creation...')
        const { data: retryAccountData, error: retryError } = await supabaseAdmin
          .from('accounts')
          .insert({
            user_id: userId,
            account_number: accountNumber,
            account_type: accountType === 'business' ? 'business' : 'checking',
            account_name: accountType === 'business' ? `${businessName || 'Business'} - Main Account` : 'Main Checking Account',
            balance: startingBalance,
            available_balance: startingBalance,
            currency: 'USD',
            status: 'active'
          })
          .select()
          .single()

        if (retryError || !retryAccountData) {
          console.error('❌ Retry failed:', retryError)
          return NextResponse.json(
            { 
              error: 'Account created but failed to set initial balance. Please contact support.',
              details: process.env.NODE_ENV === 'development' ? retryError?.message : undefined
            },
            { status: 500 }
          )
        }

        console.log('✅ Account created successfully on retry with balance:', retryAccountData.balance)
        return NextResponse.json({
          success: true,
          user: profileData,
          account: retryAccountData,
          message: 'Account created successfully'
        })
      } catch (retryError: any) {
        console.error('❌ Retry exception:', retryError)
        return NextResponse.json(
          { 
            error: 'Failed to create account. Please contact support.',
            details: process.env.NODE_ENV === 'development' ? retryError?.message : undefined
          },
          { status: 500 }
        )
      }
    }

    // Verify balance was set correctly
    if (accountData && (parseFloat(accountData.balance) !== startingBalance)) {
      console.warn('⚠️ Balance mismatch. Expected:', startingBalance, 'Got:', accountData.balance)
      
      // Update balance if it's wrong
      try {
        const { data: updatedAccount, error: updateError } = await supabaseAdmin
          .from('accounts')
          .update({ 
            balance: startingBalance,
            available_balance: startingBalance 
          })
          .eq('id', accountData.id)
          .select()
          .single()

        if (updateError) {
          console.error('❌ Failed to update balance:', updateError)
        } else {
          console.log('✅ Balance updated to:', updatedAccount?.balance)
          accountData.balance = startingBalance
          accountData.available_balance = startingBalance
        }
      } catch (updateError) {
        console.error('❌ Balance update exception:', updateError)
      }
    }

    console.log('✅ Signup successful. Account balance:', accountData?.balance)

    return NextResponse.json({
      success: true,
      user: profileData,
      account: accountData,
      message: 'Account created successfully'
    })
  } catch (error: any) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

