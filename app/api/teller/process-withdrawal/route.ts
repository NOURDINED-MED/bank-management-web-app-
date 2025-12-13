import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tellerId, accountNumber, amount, description } = body

    if (!tellerId || !accountNumber || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: tellerId, accountNumber, amount' },
        { status: 400 }
      )
    }

    // Verify teller exists and is a teller
    const { data: teller, error: tellerError } = await supabaseAdmin
      .from('users')
      .select('id, role, full_name')
      .eq('id', tellerId)
      .single()

    if (tellerError || !teller || teller.role !== 'teller') {
      return NextResponse.json(
        { error: 'Unauthorized - Teller access required' },
        { status: 403 }
      )
    }

    // Find the account
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('id, user_id, balance, available_balance, status, account_number')
      .eq('account_number', accountNumber.trim())
      .eq('status', 'active')
      .single()

    if (accountError || !account) {
      console.error('Account lookup error:', accountError)
      return NextResponse.json(
        { error: `Account not found or inactive. Account: ${accountNumber}` },
        { status: 404 }
      )
    }

    const withdrawalAmount = parseFloat(amount)
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    const currentBalance = parseFloat(account.balance || 0)
    if (currentBalance < withdrawalAmount) {
      return NextResponse.json(
        { error: 'Insufficient funds' },
        { status: 400 }
      )
    }

    const newBalance = currentBalance - withdrawalAmount
    const newAvailableBalance = parseFloat(account.available_balance || 0) - withdrawalAmount

    // Generate reference number
    const referenceNumber = `WDL${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Create transaction record
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        account_id: account.id,
        transaction_type: 'withdrawal',
        amount: withdrawalAmount.toString(),
        balance_after: newBalance.toString(),
        description: description || 'Cash Withdrawal',
        category: 'withdrawal',
        status: 'completed',
        reference_number: referenceNumber,
        processed_by: tellerId,
        metadata: {
          processed_by_teller: teller.full_name || tellerId,
          teller_id: tellerId
        }
      })
      .select()
      .single()

    if (txError) {
      console.error('Error creating transaction:', txError)
      return NextResponse.json(
        { error: 'Failed to create transaction: ' + txError.message },
        { status: 500 }
      )
    }

    // Update account balance
    const { error: updateError } = await supabaseAdmin
      .from('accounts')
      .update({
        balance: newBalance.toString(),
        available_balance: newAvailableBalance.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', account.id)

    if (updateError) {
      console.error('Error updating balance:', updateError)
      return NextResponse.json(
        { error: 'Transaction created but failed to update balance' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        referenceNumber,
        amount: withdrawalAmount,
        newBalance,
        accountId: account.id
      }
    })
  } catch (error: any) {
    console.error('Error processing withdrawal:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process withdrawal' },
      { status: 500 }
    )
  }
}

