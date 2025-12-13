import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET statement data for a date range
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get user's accounts
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from('accounts')
      .select('id, account_number, account_type, balance')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (accountsError) {
      console.error('Error fetching accounts:', accountsError)
      return NextResponse.json(
        { error: 'Failed to fetch accounts' },
        { status: 500 }
      )
    }

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({
        user: null,
        accounts: [],
        transactions: []
      })
    }

    const accountIds = accounts.map(acc => acc.id)

    // Get user info
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, phone')
      .eq('id', userId)
      .single()

    // Build query for transactions
    let query = supabaseAdmin
      .from('transactions')
      .select('*')
      .in('account_id', accountIds)
      .order('created_at', { ascending: false })

    // Add date filters if provided
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: transactions, error: transactionsError } = await query

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    // Format transactions
    const formattedTransactions = (transactions || []).map((tx: any) => {
      const account = accounts.find(acc => acc.id === tx.account_id)
      return {
        id: tx.id,
        date: tx.created_at,
        accountNumber: account?.account_number || 'N/A',
        accountType: account?.account_type || 'N/A',
        type: tx.transaction_type,
        amount: parseFloat(tx.amount || 0),
        balance: parseFloat(tx.balance_after || 0),
        description: tx.description || tx.transaction_type,
        status: tx.status,
        referenceNumber: tx.reference_number || tx.id.slice(0, 8).toUpperCase()
      }
    })

    return NextResponse.json({
      user: user ? {
        name: user.full_name,
        email: user.email,
        phone: user.phone
      } : null,
      accounts: accounts.map(acc => ({
        accountNumber: acc.account_number,
        accountType: acc.account_type,
        balance: parseFloat(acc.balance || 0)
      })),
      transactions: formattedTransactions,
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}



