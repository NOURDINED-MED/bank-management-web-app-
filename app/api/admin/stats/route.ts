import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

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

    // Get all users
    const { data: allUsers } = await supabaseAdmin
      .from('users')
      .select('id, role, is_active')

    // Get all customers
    const { data: customers } = await supabaseAdmin
      .from('users')
      .select('id, is_active, kyc_status')
      .eq('role', 'customer')

    // Get all accounts with balances
    const { data: accounts } = await supabaseAdmin
      .from('accounts')
      .select('balance, status')

    // Get ALL transactions for statistics (no limit)
    const { data: allTransactions } = await supabaseAdmin
      .from('transactions')
      .select('id, transaction_type, amount, status, created_at')

    // Get recent transactions with customer info for display (limited to 5)
    const { data: recentTransactions } = await supabaseAdmin
      .from('transactions')
      .select(`
        id,
        transaction_type,
        amount,
        status,
        description,
        created_at,
        accounts!inner(
          users!inner(
            full_name,
            email
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    // Calculate statistics from ALL transactions
    const totalUsers = allUsers?.length || 0
    const totalTellers = allUsers?.filter(u => u.role === 'teller').length || 0
    const totalCustomers = customers?.length || 0
    const activeCustomers = customers?.filter(c => c.is_active).length || 0
    const totalBalance = accounts?.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0) || 0
    const totalTransactions = allTransactions?.length || 0

    // Get transaction statistics from ALL transactions
    const totalDeposits = (allTransactions || [])
      .filter(t => t.transaction_type === 'deposit')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

    const totalWithdrawals = (allTransactions || [])
      .filter(t => t.transaction_type === 'withdrawal')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

    const totalTransfers = (allTransactions || [])
      .filter(t => t.transaction_type === 'transfer')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

    const totalPayments = (allTransactions || [])
      .filter(t => t.transaction_type === 'payment')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

    const netFlow = totalDeposits - totalWithdrawals

    // Get transaction counts by type from ALL transactions
    const depositsCount = (allTransactions || []).filter(t => t.transaction_type === 'deposit').length
    const withdrawalsCount = (allTransactions || []).filter(t => t.transaction_type === 'withdrawal').length
    const transfersCount = (allTransactions || []).filter(t => t.transaction_type === 'transfer').length
    const paymentsCount = (allTransactions || []).filter(t => t.transaction_type === 'payment').length

    // Get today's transactions
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTransactions = (allTransactions || []).filter(t => {
      const txDate = new Date(t.created_at)
      return txDate >= today
    })
    const todayCount = todayTransactions.length
    const todayDeposits = todayTransactions
      .filter(t => t.transaction_type === 'deposit')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    const todayWithdrawals = todayTransactions
      .filter(t => t.transaction_type === 'withdrawal')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

    // Get this month's transactions
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    const thisMonthTransactions = (allTransactions || []).filter(t => {
      const txDate = new Date(t.created_at)
      return txDate >= thisMonth
    })
    const thisMonthCount = thisMonthTransactions.length
    const thisMonthDeposits = thisMonthTransactions
      .filter(t => t.transaction_type === 'deposit')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    const thisMonthWithdrawals = thisMonthTransactions
      .filter(t => t.transaction_type === 'withdrawal')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

    // Get pending KYC
    const pendingKYC = customers?.filter(c => c.kyc_status === 'pending').length || 0

    return NextResponse.json({
      totalUsers,
      totalTellers,
      totalCustomers,
      activeCustomers,
      totalBalance,
      totalTransactions,
      totalDeposits,
      totalWithdrawals,
      totalTransfers,
      totalPayments,
      netFlow,
      depositsCount,
      withdrawalsCount,
      transfersCount,
      paymentsCount,
      pendingKYC,
      todayCount,
      todayDeposits,
      todayWithdrawals,
      thisMonthCount,
      thisMonthDeposits,
      thisMonthWithdrawals,
      recentTransactions: (recentTransactions || []).map((t: any) => ({
        id: t.id || '',
        type: t.transaction_type,
        amount: parseFloat(t.amount || 0),
        status: t.status,
        description: t.description || t.transaction_type,
        customerName: t.accounts?.users?.full_name || 'Unknown',
        customerEmail: t.accounts?.users?.email || '',
        date: t.created_at
      }))
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

