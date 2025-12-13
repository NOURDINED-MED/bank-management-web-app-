import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * API endpoint to fix accounts that were created with 0 balance
 * This gives them the $100,000 starting balance
 * 
 * Usage: POST /api/admin/fix-balances
 * Body: { userId?: string } // Optional - if not provided, fixes all accounts with 0 balance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { userId } = body

    const startingBalance = 100000

    // Build query to find accounts with 0 balance
    let query = supabaseAdmin
      .from('accounts')
      .select('id, user_id, account_number, balance, available_balance, created_at')
      .eq('balance', 0)
      .eq('status', 'active')

    // If userId is provided, only fix that user's accounts
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: accounts, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching accounts:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch accounts' },
        { status: 500 }
      )
    }

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({
        message: 'No accounts found with $0 balance',
        updated: 0
      })
    }

    // Update all accounts
    const updatePromises = accounts.map(account => 
      supabaseAdmin
        .from('accounts')
        .update({
          balance: startingBalance.toString(),
          available_balance: startingBalance.toString()
        })
        .eq('id', account.id)
    )

    const results = await Promise.allSettled(updatePromises)
    
    const successful = results.filter(r => r.status === 'fulfilled' && !r.value.error).length
    const failed = results.filter(r => r.status === 'rejected' || r.value?.error).length

    return NextResponse.json({
      message: `Updated ${successful} account(s) with $100,000 starting balance`,
      total: accounts.length,
      successful,
      failed,
      accounts: accounts.map(acc => ({
        id: acc.id,
        account_number: acc.account_number,
        old_balance: acc.balance,
        new_balance: startingBalance
      }))
    })
  } catch (error: any) {
    console.error('Error fixing balances:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check which accounts have 0 balance
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    let query = supabaseAdmin
      .from('accounts')
      .select('id, user_id, account_number, balance, available_balance, created_at, users!inner(email, full_name)')
      .eq('balance', 0)
      .eq('status', 'active')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: accounts, error } = await query

    if (error) {
      console.error('Error fetching accounts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch accounts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      accounts: accounts || [],
      count: accounts?.length || 0
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

