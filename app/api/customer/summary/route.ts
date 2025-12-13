import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accountNumber = searchParams.get('accountNumber')
    const customerId = searchParams.get('customerId')

    if (!accountNumber && !customerId) {
      return NextResponse.json(
        { error: 'Account number or customer ID required' },
        { status: 400 }
      )
    }

    // Find customer by account number or customer ID
    let query = supabaseAdmin
      .from('accounts')
      .select(`
        id,
        account_number,
        user_id,
        users!inner(
          id,
          full_name,
          email
        )
      `)

    if (accountNumber) {
      query = query.eq('account_number', accountNumber)
    } else if (customerId) {
      // If customerId is actually a user_id
      query = query.eq('user_id', customerId)
    }

    const { data: accounts, error: accountsError } = await query

    if (accountsError || !accounts || accounts.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    const account = accounts[0]
    const userId = account.user_id
    const accountIds = [account.id]

    // Get all transactions for this customer's account
    const { data: transactions, error: transactionsError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .in('account_id', accountIds)
      .order('created_at', { ascending: false })

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    // Calculate totals from all transactions
    const allTransactions = transactions || []
    const deposits = allTransactions
      .filter(t => t.transaction_type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

    const withdrawals = allTransactions
      .filter(t => t.transaction_type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

    // Format recent transactions
    const recentTransactions = allTransactions.slice(0, 10).map((tx: any) => ({
      id: tx.id,
      customerId: userId,
      customerName: (Array.isArray(account.users) ? account.users[0]?.full_name : (account.users as any)?.full_name) || '',
      type: tx.transaction_type,
      amount: parseFloat(tx.amount || 0),
      balance: parseFloat(tx.balance_after || 0),
      description: tx.description || tx.transaction_type,
      date: tx.created_at,
      status: tx.status,
      reference_number: tx.reference_number || tx.id.slice(0, 8).toUpperCase()
    }))

    return NextResponse.json({
      totalDeposits: deposits,
      totalWithdrawals: withdrawals,
      transactions: recentTransactions,
      totalTransactions: allTransactions.length
    })
  } catch (error: any) {
    console.error('Error in customer summary API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

