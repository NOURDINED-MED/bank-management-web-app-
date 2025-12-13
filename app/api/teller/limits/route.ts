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
      .select('id, role')
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

    // Get today's transactions
    const { data: transactions, error: transactionsError } = await supabaseAdmin
      .from('transactions')
      .select('transaction_type, amount, status')
      .eq('processed_by', tellerId)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())

    if (transactionsError) {
      console.error('Error fetching transactions for limits:', transactionsError)
      // Return empty limits instead of failing - teller can still work
      return NextResponse.json({ 
        limits: [
          {
            limitType: "daily_deposit",
            currentAmount: 0,
            limitAmount: 100000,
            percentage: 0,
            transactionCount: 0
          },
          {
            limitType: "daily_withdrawal",
            currentAmount: 0,
            limitAmount: 75000,
            percentage: 0,
            transactionCount: 0
          },
          {
            limitType: "single_transaction",
            currentAmount: 0,
            limitAmount: 10000,
            percentage: 0,
            transactionCount: 0
          },
          {
            limitType: "total_daily",
            currentAmount: 0,
            limitAmount: 150000,
            percentage: 0,
            transactionCount: 0
          }
        ]
      })
    }

    // Define limits
    const limits = {
      daily_deposit: 100000,
      daily_withdrawal: 75000,
      single_transaction: 10000,
      total_daily: 150000
    }

    // Calculate current amounts
    const completedTransactions = transactions?.filter(t => t.status === 'completed') || []
    const deposits = completedTransactions.filter(t => t.transaction_type === 'deposit')
    const withdrawals = completedTransactions.filter(t => t.transaction_type === 'withdrawal')
    const allTransactions = completedTransactions

    const dailyDepositAmount = deposits.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    const dailyWithdrawalAmount = withdrawals.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    const totalDailyAmount = allTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    const singleTransactionMax = Math.max(...allTransactions.map(t => parseFloat(t.amount || 0)), 0)

    const tellerLimits = [
      {
        limitType: "daily_deposit",
        currentAmount: dailyDepositAmount,
        limitAmount: limits.daily_deposit,
        percentage: (dailyDepositAmount / limits.daily_deposit) * 100,
        transactionCount: deposits.length
      },
      {
        limitType: "daily_withdrawal",
        currentAmount: dailyWithdrawalAmount,
        limitAmount: limits.daily_withdrawal,
        percentage: (dailyWithdrawalAmount / limits.daily_withdrawal) * 100,
        transactionCount: withdrawals.length
      },
      {
        limitType: "single_transaction",
        currentAmount: singleTransactionMax,
        limitAmount: limits.single_transaction,
        percentage: (singleTransactionMax / limits.single_transaction) * 100,
        transactionCount: singleTransactionMax > 0 ? 1 : 0
      },
      {
        limitType: "total_daily",
        currentAmount: totalDailyAmount,
        limitAmount: limits.total_daily,
        percentage: (totalDailyAmount / limits.total_daily) * 100,
        transactionCount: allTransactions.length
      }
    ]

    return NextResponse.json({ limits: tellerLimits })
  } catch (error: any) {
    console.error('Error in teller limits API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
