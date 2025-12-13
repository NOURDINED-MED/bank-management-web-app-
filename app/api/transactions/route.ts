import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      accountId,
      transactionType,
      amount,
      description,
      category,
      merchantName,
      toAccountId,
    } = body

    // Validate required fields
    if (!userId || !accountId || !transactionType || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Start a transaction
    // 1. Get current account balance
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('balance, user_id')
      .eq('id', accountId)
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    // Verify the account belongs to the user
    if (account.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    let newBalance = parseFloat(account.balance)
    const transactionAmount = parseFloat(amount)

    // Calculate new balance based on transaction type
    if (transactionType === 'withdrawal' || transactionType === 'transfer' || transactionType === 'payment') {
      // Check if sufficient funds
      if (newBalance < transactionAmount) {
        return NextResponse.json(
          { error: 'Insufficient funds' },
          { status: 400 }
        )
      }
      newBalance -= transactionAmount
    } else if (transactionType === 'deposit') {
      newBalance += transactionAmount
    }

    // 2. Create transaction record
    const referenceNumber = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        account_id: accountId,
        transaction_type: transactionType,
        amount: transactionAmount,
        balance_after: newBalance,
        description: description || '',
        category: category || 'other',
        merchant_name: merchantName || null,
        status: 'completed',
        reference_number: referenceNumber,
        to_account_id: toAccountId || null,
        processed_by: userId,
        metadata: {
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        },
      })
      .select()
      .single()

    if (txError) {
      console.error('Transaction creation error:', txError)
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    // 3. Update account balance
    const { error: updateError } = await supabaseAdmin
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', accountId)

    if (updateError) {
      console.error('Balance update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update balance' },
        { status: 500 }
      )
    }

    // 4. If transfer, update recipient account
    if (transactionType === 'transfer' && toAccountId) {
      const { data: toAccount } = await supabaseAdmin
        .from('accounts')
        .select('balance')
        .eq('id', toAccountId)
        .single()

      if (toAccount) {
        const newToBalance = parseFloat(toAccount.balance) + transactionAmount

        // Create transaction for recipient
        await supabaseAdmin.from('transactions').insert({
          account_id: toAccountId,
          transaction_type: 'deposit',
          amount: transactionAmount,
          balance_after: newToBalance,
          description: `Transfer from ${accountId.substring(0, 8)}`,
          category: 'transfer',
          status: 'completed',
          reference_number: `${referenceNumber}-IN`,
          metadata: {
            related_transaction: referenceNumber,
          },
        })

        // Update recipient balance
        await supabaseAdmin
          .from('accounts')
          .update({ balance: newToBalance })
          .eq('id', toAccountId)
      }
    }

    // 5. Create audit log
    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      action: 'transaction_created',
      entity_type: 'transaction',
      entity_id: transaction.id,
      new_data: transaction,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    })

    // 6. Create notification
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      title: 'Transaction Completed',
      message: `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} of $${transactionAmount.toFixed(2)} completed successfully`,
      type: 'success',
    })

    return NextResponse.json({
      success: true,
      transaction,
      newBalance,
      referenceNumber,
    })
  } catch (error: any) {
    console.error('Transaction error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const accountId = searchParams.get('accountId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    let query = supabaseAdmin
      .from('transactions')
      .select(`
        *,
        accounts!inner(user_id, account_number, account_type)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (accountId) {
      query = query.eq('account_id', accountId)
    } else {
      // Get all transactions for user's accounts
      query = query.eq('accounts.user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ transactions: data || [] })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
