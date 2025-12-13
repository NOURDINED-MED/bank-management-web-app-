import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Verify user is admin
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get all tellers
    const { data: tellers, error: tellersError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, phone, is_active, created_at')
      .eq('role', 'teller')
      .order('created_at', { ascending: false })

    if (tellersError) {
      console.error('Error fetching tellers:', tellersError)
      return NextResponse.json(
        { error: 'Failed to fetch tellers' },
        { status: 500 }
      )
    }

    // Get today's date range
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Fetch performance data for each teller
    const tellersWithPerformance = await Promise.all(
      (tellers || []).map(async (teller) => {
        // Get today's transactions for this teller
        const { data: transactions } = await supabaseAdmin
          .from('transactions')
          .select('transaction_type, amount, status')
          .eq('processed_by', teller.id)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())

        const depositTransactions = transactions?.filter(t => t.transaction_type === 'deposit' && t.status === 'completed') || []
        const withdrawalTransactions = transactions?.filter(t => t.transaction_type === 'withdrawal' && t.status === 'completed') || []
        const transferTransactions = transactions?.filter(t => t.transaction_type === 'transfer' && t.status === 'completed') || []

        const totalDeposits = depositTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
        const totalWithdrawals = withdrawalTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
        const totalTransfers = transferTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

        // Calculate cash drawer balance (starting cash + deposits - withdrawals)
        const startingCash = 50000 // Default starting cash
        const currentCash = startingCash + totalDeposits - totalWithdrawals

        return {
          id: teller.id,
          name: teller.full_name || 'Unknown',
          email: teller.email || '',
          phone: teller.phone || '',
          branch: 'Main Branch', // Could be stored in user metadata
          status: teller.is_active ? 'active' : 'inactive',
          transactions: (transactions?.length || 0),
          cashIn: totalDeposits,
          cashOut: totalWithdrawals,
          transfers: totalTransfers,
          currentBalance: currentCash,
          depositCount: depositTransactions.length,
          withdrawalCount: withdrawalTransactions.length,
          transferCount: transferTransactions.length,
          createdAt: teller.created_at
        }
      })
    )

    // Calculate daily totals
    const dailyTotals = tellersWithPerformance.reduce((acc, teller) => {
      acc.totalTransactions += teller.transactions
      acc.totalAmount += teller.cashIn + teller.cashOut + teller.transfers
      return acc
    }, { totalTransactions: 0, totalAmount: 0 })

    return NextResponse.json({
      tellers: tellersWithPerformance,
      dailyTotals,
      date
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

