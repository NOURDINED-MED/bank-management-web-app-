import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || searchParams.get('search') || ''

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        customers: [],
        total: 0
      })
    }

    const searchTerm = query.trim()

    // First, try to find by account number
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from('accounts')
      .select('user_id, account_number, account_type, balance, status, id')
      .ilike('account_number', `%${searchTerm}%`)
      .eq('status', 'active')

    let customerIds: string[] = []
    const accountsMap: Record<string, any> = {}

    if (!accountsError && accounts) {
      accounts.forEach((acc: any) => {
        customerIds.push(acc.user_id)
        if (!accountsMap[acc.user_id]) {
          accountsMap[acc.user_id] = []
        }
        accountsMap[acc.user_id].push(acc)
      })
    }

    // Search customers by name, email, or phone
    let customerQuery = supabaseAdmin
      .from('users')
      .select('id, email, full_name, phone, status, kyc_status, created_at')
      .eq('role', 'customer')

    if (customerIds.length > 0) {
      // If we found accounts, search by those customer IDs
      customerQuery = customerQuery.in('id', customerIds)
    } else {
      // Otherwise, search by name, email, or phone
      customerQuery = customerQuery.or(
        `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
      )
    }

    const { data: customers, error: customersError } = await customerQuery

    if (customersError) {
      console.error('Error fetching customers:', customersError)
      return NextResponse.json(
        { error: 'Failed to search customers' },
        { status: 500 }
      )
    }

    // If we searched by name/email/phone, get their accounts
    if (customerIds.length === 0 && customers) {
      const ids = customers.map(c => c.id)
      const { data: allAccounts } = await supabaseAdmin
        .from('accounts')
        .select('user_id, account_number, account_type, balance, status, id')
        .in('user_id', ids)
        .eq('status', 'active')

      if (allAccounts) {
        allAccounts.forEach((acc: any) => {
          if (!accountsMap[acc.user_id]) {
            accountsMap[acc.user_id] = []
          }
          accountsMap[acc.user_id].push(acc)
        })
      }
    }

    // Format customers with their accounts
    const formattedCustomers = (customers || []).map((customer: any) => {
      const userAccounts = accountsMap[customer.id] || []
      const primaryAccount = userAccounts[0] || null

      return {
        id: customer.id,
        email: customer.email,
        name: customer.full_name,
        phone: customer.phone || '',
        accountNumber: primaryAccount?.account_number || '',
        accountType: primaryAccount?.account_type || 'checking',
        balance: primaryAccount ? parseFloat(primaryAccount.balance || 0) : 0,
        status: customer.status || 'active',
        kycStatus: customer.kyc_status || 'pending',
        createdAt: customer.created_at,
        accountId: primaryAccount?.id || null
      }
    })

    return NextResponse.json({
      customers: formattedCustomers,
      total: formattedCustomers.length
    })
  } catch (error: any) {
    console.error('Error searching customers:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to search customers' },
      { status: 500 }
    )
  }
}

