import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '500') // Increased limit to show more transactions
    const status = searchParams.get('status')
    const type = searchParams.get('type')

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

    // Get all transactions first
    let transactionsQuery = supabaseAdmin
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      transactionsQuery = transactionsQuery.eq('status', status)
    }

    if (type) {
      transactionsQuery = transactionsQuery.eq('transaction_type', type)
    }

    const { data: transactions, error: transactionsError } = await transactionsQuery

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
      return NextResponse.json(
        { error: 'Failed to fetch transactions: ' + transactionsError.message },
        { status: 500 }
      )
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        transactions: [],
        statistics: {
          total: 0,
          totalAmount: 0,
          byType: { deposit: 0, withdrawal: 0, transfer: 0, payment: 0 },
          byStatus: { completed: 0, pending: 0, failed: 0 },
        },
      })
    }

    // Get unique account IDs
    const accountIds = [...new Set(transactions.map((tx: any) => tx.account_id).filter(Boolean))]
    
    // Fetch accounts
    let accountsMap: Record<string, any> = {}
    if (accountIds.length > 0) {
      const { data: accounts, error: accountsError } = await supabaseAdmin
        .from('accounts')
        .select('id, account_number, account_type, user_id')
        .in('id', accountIds)

      if (!accountsError && accounts) {
        // Get unique user IDs
        const userIds = [...new Set(accounts.map((acc: any) => acc.user_id).filter(Boolean))]
        
        if (userIds.length > 0) {
          const { data: users, error: usersError } = await supabaseAdmin
            .from('users')
            .select('id, full_name, email, role')
            .in('id', userIds)

          if (!usersError && users) {
            const usersMap = users.reduce((acc: Record<string, any>, user: any) => {
              acc[user.id] = user
              return acc
            }, {})

            // Combine accounts with users
            accounts.forEach((account: any) => {
              accountsMap[account.id] = {
                account_number: account.account_number,
                account_type: account.account_type,
                users: usersMap[account.user_id] || null
              }
            })
          }
        }
      }
    }

    // Format transactions with account and user data
    const formattedTransactions = transactions.map((tx: any) => {
      const account = accountsMap[tx.account_id]
      return {
        ...tx,
        accounts: account ? {
          account_number: account.account_number,
          account_type: account.account_type,
          users: account.users
        } : null
      }
    })

    // Get transaction statistics (from all transactions, not just limited ones)
    const { data: allStats } = await supabaseAdmin
      .from('transactions')
      .select('transaction_type, amount, status')

    const statistics = {
      total: allStats?.length || 0,
      totalAmount: allStats?.reduce((sum: number, tx: any) => sum + parseFloat(tx.amount || 0), 0) || 0,
      byType: {
        deposit: allStats?.filter((tx: any) => tx.transaction_type === 'deposit').length || 0,
        withdrawal: allStats?.filter((tx: any) => tx.transaction_type === 'withdrawal').length || 0,
        transfer: allStats?.filter((tx: any) => tx.transaction_type === 'transfer').length || 0,
        payment: allStats?.filter((tx: any) => tx.transaction_type === 'payment').length || 0,
      },
      byStatus: {
        completed: allStats?.filter((tx: any) => tx.status === 'completed').length || 0,
        pending: allStats?.filter((tx: any) => tx.status === 'pending').length || 0,
        failed: allStats?.filter((tx: any) => tx.status === 'failed').length || 0,
      },
    }

    return NextResponse.json({
      transactions: formattedTransactions || [],
      statistics,
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
