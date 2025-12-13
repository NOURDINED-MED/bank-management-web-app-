import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '100')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get user's accounts using admin client to bypass RLS
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from('accounts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')

    // If error fetching accounts or no accounts, return empty transactions
    if (accountsError) {
      console.error('Error fetching accounts:', accountsError)
      // Don't return error, just return empty transactions
      return NextResponse.json({
        transactions: [],
        total: 0
      })
    }

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({
        transactions: [],
        total: 0
      })
    }

    const accountIds = accounts.map(acc => acc.id)

    // Get transactions for all user accounts using admin client
    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .in('account_id', accountIds)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    // Format transactions to match expected structure
    const formattedTransactions = (transactions || []).map((tx: any) => ({
      id: tx.id,
      customerId: userId,
      customerName: '', // Will be filled from user data if needed
      type: tx.transaction_type,
      amount: parseFloat(tx.amount || 0),
      balance: parseFloat(tx.balance_after || 0),
      description: tx.description || tx.transaction_type,
      date: tx.created_at,
      status: tx.status,
      reference_number: tx.reference_number || tx.id.slice(0, 8).toUpperCase(),
      category: tx.category,
      merchant_name: tx.merchant_name
    }))

    return NextResponse.json({
      transactions: formattedTransactions,
      total: formattedTransactions.length
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}





