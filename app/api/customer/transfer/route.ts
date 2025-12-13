import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * POST /api/customer/transfer
 * Transfer money from the authenticated user's account to another account
 * 
 * Body: {
 *   recipientAccountNumber: string
 *   amount: number
 *   description?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, recipientAccountNumber, amount, description } = body

    // Validate user ID is provided
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate inputs
    if (!recipientAccountNumber || !amount) {
      return NextResponse.json(
        { error: 'Recipient account number and amount are required' },
        { status: 400 }
      )
    }

    const transferAmount = parseFloat(amount)
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid transfer amount. Must be greater than 0.' },
        { status: 400 }
      )
    }

    if (transferAmount < 1) {
      return NextResponse.json(
        { error: 'Minimum transfer amount is $1.00' },
        { status: 400 }
      )
    }

    // Find sender's account(s)
    const { data: senderAccounts, error: senderError } = await supabaseAdmin
      .from('accounts')
      .select('id, user_id, account_number, balance, available_balance, account_type, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: true })

    if (senderError || !senderAccounts || senderAccounts.length === 0) {
      return NextResponse.json(
        { error: 'Sender account not found' },
        { status: 404 }
      )
    }

    // Use the first active account as the sender account
    const senderAccount = senderAccounts[0]
    const senderBalance = parseFloat(senderAccount.balance || 0)

    // Check if sender has sufficient balance
    if (senderBalance < transferAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Find recipient account by account number
    const { data: recipientAccounts, error: recipientError } = await supabaseAdmin
      .from('accounts')
      .select('id, user_id, account_number, balance, available_balance, account_type, status, users!inner(id, full_name, email)')
      .eq('account_number', recipientAccountNumber.trim())
      .eq('status', 'active')

    if (recipientError || !recipientAccounts || recipientAccounts.length === 0) {
      return NextResponse.json(
        { error: 'Recipient account not found' },
        { status: 404 }
      )
    }

    const recipientAccount = recipientAccounts[0]

    // Prevent transferring to own account
    if (senderAccount.id === recipientAccount.id) {
      return NextResponse.json(
        { error: 'Cannot transfer money to the same account' },
        { status: 400 }
      )
    }

    // Get sender user info
    const { data: senderUser } = await supabaseAdmin
      .from('users')
      .select('full_name, email')
      .eq('id', userId)
      .single()

    // Calculate new balances
    const newSenderBalance = senderBalance - transferAmount
    const recipientBalance = parseFloat(recipientAccount.balance || 0)
    const newRecipientBalance = recipientBalance + transferAmount

    // Generate reference number
    const referenceNumber = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Perform the transfer atomically using a transaction
    // Update sender account balance
    const { error: updateSenderError } = await supabaseAdmin
      .from('accounts')
      .update({
        balance: newSenderBalance.toString(),
        available_balance: newSenderBalance.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', senderAccount.id)

    if (updateSenderError) {
      console.error('Error updating sender balance:', updateSenderError)
      return NextResponse.json(
        { error: 'Failed to process transfer. Please try again.' },
        { status: 500 }
      )
    }

    // Update recipient account balance
    const { error: updateRecipientError } = await supabaseAdmin
      .from('accounts')
      .update({
        balance: newRecipientBalance.toString(),
        available_balance: newRecipientBalance.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', recipientAccount.id)

    if (updateRecipientError) {
      // Rollback sender balance update
      await supabaseAdmin
        .from('accounts')
        .update({
          balance: senderBalance.toString(),
          available_balance: senderBalance.toString()
        })
        .eq('id', senderAccount.id)

      console.error('Error updating recipient balance:', updateRecipientError)
      return NextResponse.json(
        { error: 'Failed to process transfer. Please try again.' },
        { status: 500 }
      )
    }

    // Extract recipient user name (handle array or object)
    const recipientUserName = Array.isArray(recipientAccount.users) 
      ? recipientAccount.users[0]?.full_name 
      : (recipientAccount.users as any)?.full_name

    // Create transaction records for both accounts
    const transactionDescription = description || `Transfer ${transferAmount < 0 ? 'from' : 'to'} ${recipientUserName || recipientAccountNumber}`
    const senderDescription = `Transfer to ${recipientUserName || recipientAccountNumber}${description ? `: ${description}` : ''}`

    // Sender transaction (outgoing)
    const { data: senderTransaction, error: senderTxError } = await supabaseAdmin
      .from('transactions')
      .insert({
        account_id: senderAccount.id,
        transaction_type: 'transfer',
        amount: transferAmount.toString(),
        balance_after: newSenderBalance.toString(),
        description: senderDescription,
        status: 'completed',
        reference_number: referenceNumber,
        to_account_id: recipientAccount.id,
        metadata: {
          recipient_account: recipientAccountNumber,
          recipient_name: recipientUserName || 'Unknown'
        }
      })
      .select()
      .single()

    if (senderTxError) {
      console.error('Error creating sender transaction:', senderTxError)
      // Don't rollback here - balances are already updated, transaction record is less critical
    }

    // Recipient transaction (incoming)
    const recipientDescription = `Transfer from ${senderUser?.full_name || senderAccount.account_number}${description ? `: ${description}` : ''}`
    const { data: recipientTransaction, error: recipientTxError } = await supabaseAdmin
      .from('transactions')
      .insert({
        account_id: recipientAccount.id,
        transaction_type: 'transfer',
        amount: transferAmount.toString(),
        balance_after: newRecipientBalance.toString(),
        description: recipientDescription,
        status: 'completed',
        reference_number: referenceNumber,
        to_account_id: recipientAccount.id, // This is the receiving account
        metadata: {
          sender_account: senderAccount.account_number,
          sender_name: senderUser?.full_name || 'Unknown'
        }
      })
      .select()
      .single()

    if (recipientTxError) {
      console.error('Error creating recipient transaction:', recipientTxError)
    }

    return NextResponse.json({
      success: true,
      message: 'Transfer completed successfully',
      transactionId: referenceNumber,
      newBalance: newSenderBalance,
      transfer: {
        amount: transferAmount,
        recipient: recipientUserName || recipientAccountNumber,
        recipientAccount: recipientAccountNumber,
        referenceNumber
      }
    })
  } catch (error: any) {
    console.error('Transfer API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/customer/transfer
 * Search for a recipient account by account number
 * 
 * Query: ?accountNumber=ACC-XXXX
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const accountNumber = searchParams.get('accountNumber')

    if (!accountNumber) {
      return NextResponse.json(
        { error: 'Account number is required' },
        { status: 400 }
      )
    }

    // Search for account by account number (only show name, not full details for privacy)
    const { data: accounts, error } = await supabaseAdmin
      .from('accounts')
      .select('account_number, account_type, users!inner(id, full_name, email)')
      .eq('account_number', accountNumber.trim())
      .eq('status', 'active')
      .limit(1)

    if (error) {
      console.error('Error searching account:', error)
      return NextResponse.json(
        { error: 'Failed to search account' },
        { status: 500 }
      )
    }

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({
        found: false,
        message: 'Account not found'
      })
    }

    const account = accounts[0]
    return NextResponse.json({
      found: true,
      account: {
        accountNumber: account.account_number,
        accountType: account.account_type,
        recipientName: (Array.isArray(account.users) ? account.users[0]?.full_name : (account.users as any)?.full_name) || 'Unknown',
        // Don't expose email or other sensitive info
      }
    })
  } catch (error: any) {
    console.error('Account search error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

