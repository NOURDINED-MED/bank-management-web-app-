import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tellerId = searchParams.get('tellerId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!tellerId) {
      return NextResponse.json(
        { error: 'Teller ID required' },
        { status: 400 }
      )
    }

    // Verify user is teller
    const { data: teller, error: tellerError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', tellerId)
      .single()

    if (tellerError || !teller || teller.role !== 'teller') {
      return NextResponse.json(
        { error: 'Unauthorized - Teller access required' },
        { status: 403 }
      )
    }

    // Get transactions processed by this teller
    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .select(`
        *,
        accounts!transactions_account_id_fkey(
          account_number,
          users!inner(
            full_name,
            email
          )
        )
      `)
      .eq('processed_by', tellerId)
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
    const formattedTransactions = transactions?.map((tx: any) => ({
      id: tx.id,
      customerId: tx.accounts?.users?.id || '',
      customerName: tx.accounts?.users?.full_name || 'Unknown',
      type: tx.transaction_type || 'deposit',
      amount: parseFloat(tx.amount || 0),
      balance: parseFloat(tx.balance_after || 0),
      description: tx.description || tx.transaction_type,
      date: tx.created_at,
      status: tx.status || 'pending',
      tellerId: tx.teller_id,
      tellerName: (teller as any)?.full_name || 'Unknown',
      reference: tx.reference_number || tx.id
    })) || []

    return NextResponse.json({ transactions: formattedTransactions })
  } catch (error: any) {
    console.error('Error in teller transactions API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
