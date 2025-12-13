import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get user data - if not found, try to get from auth and create profile
    let user = null
    let userError = null
    
    const { data: userData, error: userDataError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userDataError || !userData) {
      // Profile doesn't exist - try to get from auth and create basic profile
      console.log('⚠️ User profile not found, attempting to create from auth user')
      
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
      
      if (authError || !authUser?.user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Create basic profile from auth user
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authUser.user.id,
          email: authUser.user.email || '',
          full_name: authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0] || 'User',
          role: 'customer',
          status: 'active',
          kyc_status: 'pending'
        })
        .select()
        .single()

      if (createError || !newProfile) {
        console.error('Failed to create profile:', createError)
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        )
      }

      user = newProfile
    } else {
      user = userData
    }

    // Get user's accounts
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (accountsError) {
      console.error('Error fetching accounts:', accountsError)
    }

    // Calculate total balance
    const totalBalance = accounts?.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0) || 0

    // Get primary account (first account or checking account)
    const primaryAccount = accounts?.find(acc => acc.account_type === 'checking') || accounts?.[0]

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        kyc_status: user.kyc_status,
        created_at: user.created_at
      },
      accounts: accounts || [],
      primaryAccount: primaryAccount ? {
        id: primaryAccount.id,
        account_number: primaryAccount.account_number,
        account_type: primaryAccount.account_type,
        balance: parseFloat(primaryAccount.balance || 0),
        status: primaryAccount.status
      } : null,
      totalBalance
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}





