import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

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

    // Get user data for last login
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('last_login_at')
      .eq('id', userId)
      .single()

    // Get transactions for interactions (last 10)
    const { data: accounts } = await supabaseAdmin
      .from('accounts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')

    const accountIds = accounts?.map(acc => acc.id) || []

    let interactions: any[] = []
    if (accountIds.length > 0) {
      const { data: transactions } = await supabaseAdmin
        .from('transactions')
        .select('id, transaction_type, description, created_at, processed_by')
        .in('account_id', accountIds)
        .order('created_at', { ascending: false })
        .limit(10)

      interactions = (transactions || []).map((tx: any) => ({
        id: tx.id,
        type: 'transaction',
        description: tx.description || `${tx.transaction_type} transaction`,
        date: tx.created_at,
        tellerName: tx.processed_by ? 'Teller: Staff' : undefined
      }))
    }

    // Get notifications for alerts
    const { data: notifications } = await supabaseAdmin
      .from('notifications')
      .select('id, type, message, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    const alerts = (notifications || []).map((notif: any) => ({
      id: notif.id,
      type: notif.type,
      message: notif.message,
      date: notif.created_at,
      priority: notif.type === 'error' ? 'high' : notif.type === 'warning' ? 'medium' : 'low'
    }))

    return NextResponse.json({
      lastOnlineLogin: userData?.last_login_at || null,
      lastBranchVisit: null, // Would need branch visits table
      interactions: interactions,
      alerts: alerts
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

