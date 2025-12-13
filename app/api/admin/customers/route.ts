import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const search = searchParams.get('search')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Verify user is admin or teller
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (userError || !user || (user.role !== 'admin' && user.role !== 'teller')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin or Teller access required' },
        { status: 403 }
      )
    }

    let customers: any[] | null = null
    let customersError: any = null

    // If search is provided, filter by account number first
    if (search && search.trim()) {
      // First, find accounts matching the search term
      const { data: matchingAccounts } = await supabaseAdmin
        .from('accounts')
        .select('user_id, account_number')
        .eq('status', 'active')
        .ilike('account_number', `%${search.trim()}%`)

      if (matchingAccounts && matchingAccounts.length > 0) {
        const matchingUserIds = matchingAccounts.map(acc => acc.user_id)
        const result = await supabaseAdmin
          .from('users')
          .select('id, email, full_name, phone, status, kyc_status, created_at')
          .eq('role', 'customer')
          .in('id', matchingUserIds)
          .order('created_at', { ascending: false })
        customers = result.data
        customersError = result.error
      } else {
        // If no account match, search by name or email
        const result = await supabaseAdmin
          .from('users')
          .select('id, email, full_name, phone, status, kyc_status, created_at')
          .eq('role', 'customer')
          .or(`full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`)
          .order('created_at', { ascending: false })
        customers = result.data
        customersError = result.error
      }
    } else {
      // No search - get all customers
      const result = await supabaseAdmin
        .from('users')
        .select('id, email, full_name, phone, status, kyc_status, created_at')
        .eq('role', 'customer')
        .order('created_at', { ascending: false })
      customers = result.data
      customersError = result.error
    }

    if (customersError) {
      console.error('Error fetching customers:', customersError)
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      )
    }

    // Get accounts for each customer
    const customerIds = customers?.map(c => c.id) || []
    
    let accountsMap: Record<string, any[]> = {}
    if (customerIds.length > 0) {
      const { data: accounts, error: accountsError } = await supabaseAdmin
        .from('accounts')
        .select('id, user_id, account_number, account_type, balance, status')
        .in('user_id', customerIds)
        .eq('status', 'active')

      if (!accountsError && accounts) {
        // Group accounts by user_id
        accountsMap = accounts.reduce((acc: Record<string, any[]>, account: any) => {
          const userId = account.user_id
          if (!acc[userId]) {
            acc[userId] = []
          }
          acc[userId].push(account)
          return acc
        }, {})
      }
    }

    // Format customers with their primary account
    const formattedCustomers = (customers || []).map((customer: any) => {
      const userAccounts = accountsMap[customer.id] || []
      const primaryAccount = userAccounts[0] || null // Get first account as primary

      return {
        id: customer.id,
        email: customer.email,
        name: customer.full_name,
        phone: customer.phone || '',
        accountNumber: primaryAccount?.account_number || 'N/A',
        accountType: primaryAccount?.account_type || 'checking',
        balance: primaryAccount ? parseFloat(primaryAccount.balance || 0) : 0,
        status: customer.status || 'active',
        kycStatus: customer.kyc_status || 'pending',
        createdAt: customer.created_at
      }
    })

    return NextResponse.json({
      customers: formattedCustomers,
      total: formattedCustomers.length
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
