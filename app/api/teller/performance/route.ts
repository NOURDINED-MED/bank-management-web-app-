import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tellerId = searchParams.get('tellerId')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    if (!tellerId) {
      return NextResponse.json(
        { error: 'Teller ID required' },
        { status: 400 }
      )
    }

    // Verify user is teller
    const { data: teller, error: tellerError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, role')
      .eq('id', tellerId)
      .single()

    if (tellerError || !teller || teller.role !== 'teller') {
      return NextResponse.json(
        { error: 'Unauthorized - Teller access required' },
        { status: 403 }
      )
    }

    // Get today's date range
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Get all transactions processed by this teller today
    const { data: transactions, error: transactionsError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('processed_by', tellerId)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())

    if (transactionsError) {
      console.error('Error fetching transactions for performance:', transactionsError)
      // Return empty performance instead of failing - teller can still work
      return NextResponse.json({
        tellerId: teller.id,
        tellerName: teller.full_name || 'Unknown',
        date: date,
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalTransfers: 0,
        depositCount: 0,
        withdrawalCount: 0,
        transferCount: 0,
        totalAmount: 0,
        successCount: 0,
        errorCount: 0,
        averageProcessingTime: 0
      })
    }

    // Calculate performance metrics
    const depositTransactions = transactions?.filter(t => t.transaction_type === 'deposit') || []
    const withdrawalTransactions = transactions?.filter(t => t.transaction_type === 'withdrawal') || []
    const transferTransactions = transactions?.filter(t => t.transaction_type === 'transfer') || []

    const totalDeposits = depositTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    const totalWithdrawals = withdrawalTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    const totalTransfers = transferTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

    const completedTransactions = transactions?.filter(t => t.status === 'completed') || []
    const failedTransactions = transactions?.filter(t => t.status === 'failed') || []

    // Calculate average processing time (mock for now, could be stored in transaction metadata)
    const averageProcessingTime = 3.5

    const performance = {
      tellerId: teller.id,
      tellerName: teller.full_name || 'Unknown',
      date: date,
      totalDeposits: totalDeposits,
      totalWithdrawals: totalWithdrawals,
      totalTransfers: totalTransfers,
      depositCount: depositTransactions.length,
      withdrawalCount: withdrawalTransactions.length,
      transferCount: transferTransactions.length,
      totalAmount: totalDeposits + totalWithdrawals + totalTransfers,
      successCount: completedTransactions.length,
      errorCount: failedTransactions.length,
      averageProcessingTime: averageProcessingTime
    }

    return NextResponse.json(performance)
  } catch (error: any) {
    console.error('Error in teller performance API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
