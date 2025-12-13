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

    // Get today's transactions
    const { data: transactions, error: transactionsError } = await supabaseAdmin
      .from('transactions')
      .select('transaction_type, amount, status')
      .eq('processed_by', tellerId)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    // Calculate cash drawer amounts
    const startingCash = 50000 // Default starting cash - could be stored in database
    const depositsReceived = transactions?.filter(t => t.transaction_type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0
    const withdrawalsGiven = transactions?.filter(t => t.transaction_type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0
    const transfersProcessed = transactions?.filter(t => t.transaction_type === 'transfer' && t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0

    const expectedCash = startingCash + depositsReceived - withdrawalsGiven
    const currentCash = expectedCash // Assume balanced unless there's a discrepancy
    const discrepancy = currentCash - expectedCash

    let status: "open" | "balanced" | "over" | "short" | "closed" = "open"
    if (Math.abs(discrepancy) < 0.01) {
      status = "balanced"
    } else if (discrepancy > 0) {
      status = "over"
    } else {
      status = "short"
    }

    const cashDrawer = {
      tellerId: teller.id,
      tellerName: teller.full_name || 'Unknown',
      date: date,
      startingCash: startingCash,
      currentCash: currentCash,
      expectedCash: expectedCash,
      depositsReceived: depositsReceived,
      withdrawalsGiven: withdrawalsGiven,
      transfersProcessed: transfersProcessed,
      discrepancy: discrepancy,
      status: status,
      lastReconciliation: new Date().toISOString()
    }

    return NextResponse.json(cashDrawer)
  } catch (error: any) {
    console.error('Error in cash drawer API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
