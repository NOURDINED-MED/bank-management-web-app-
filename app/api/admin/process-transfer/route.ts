import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminId, senderAccountNumber, recipientAccountNumber, amount, description } = body

    // Validate required fields
    if (!adminId || !senderAccountNumber || !recipientAccountNumber || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: adminId, senderAccountNumber, recipientAccountNumber, and amount are required' },
        { status: 400 }
      )
    }

    const transferAmount = parseFloat(amount)
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number' },
        { status: 400 }
      )
    }

    // Verify admin exists and is an admin
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, role')
      .eq('id', adminId)
      .single()

    if (adminError || !admin || admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get sender account
    const { data: senderAccounts, error: senderError } = await supabaseAdmin
      .from('accounts')
      .select(`
        id,
        account_number,
        balance,
        user_id,
        users!inner(
          id,
          full_name,
          email
        )
      `)
      .eq('account_number', senderAccountNumber)
      .eq('status', 'active')
      .single()

    if (senderError || !senderAccounts) {
      return NextResponse.json(
        { error: 'Sender account not found or inactive' },
        { status: 404 }
      )
    }

    const senderAccount = senderAccounts
    const senderBalance = parseFloat(senderAccount.balance || 0)

    // Check sufficient balance
    if (senderBalance < transferAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance in sender account' },
        { status: 400 }
      )
    }

    // Get recipient account
    const { data: recipientAccounts, error: recipientError } = await supabaseAdmin
      .from('accounts')
      .select(`
        id,
        account_number,
        balance,
        user_id,
        users!inner(
          id,
          full_name,
          email
        )
      `)
      .eq('account_number', recipientAccountNumber)
      .eq('status', 'active')
      .single()

    if (recipientError || !recipientAccounts) {
      return NextResponse.json(
        { error: 'Recipient account not found or inactive' },
        { status: 404 }
      )
    }

    const recipientAccount = recipientAccounts
    
    // Extract user names (handle array or object)
    const recipientUserName = Array.isArray(recipientAccount.users) 
      ? recipientAccount.users[0]?.full_name 
      : (recipientAccount.users as any)?.full_name
    const senderUserName = Array.isArray(senderAccount.users) 
      ? senderAccount.users[0]?.full_name 
      : (senderAccount.users as any)?.full_name

    // Check if sender and recipient are the same
    if (senderAccount.id === recipientAccount.id) {
      return NextResponse.json(
        { error: 'Cannot transfer to the same account' },
        { status: 400 }
      )
    }

    // Calculate new balances
    const senderNewBalance = senderBalance - transferAmount
    const recipientNewBalance = parseFloat(recipientAccount.balance || 0) + transferAmount

    // Generate reference number
    const referenceNumber = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Start transaction - update both accounts and create transaction records
    // Update sender account balance
    const { error: updateSenderError } = await supabaseAdmin
      .from('accounts')
      .update({ balance: senderNewBalance.toString() })
      .eq('id', senderAccount.id)

    if (updateSenderError) {
      console.error('Error updating sender account:', updateSenderError)
      return NextResponse.json(
        { error: 'Failed to update sender account balance' },
        { status: 500 }
      )
    }

    // Update recipient account balance
    const { error: updateRecipientError } = await supabaseAdmin
      .from('accounts')
      .update({ balance: recipientNewBalance.toString() })
      .eq('id', recipientAccount.id)

    if (updateRecipientError) {
      console.error('Error updating recipient account:', updateRecipientError)
      // Try to revert sender balance (best effort)
      await supabaseAdmin
        .from('accounts')
        .update({ balance: senderBalance.toString() })
        .eq('id', senderAccount.id)
      
      return NextResponse.json(
        { error: 'Failed to update recipient account balance' },
        { status: 500 }
      )
    }

    // Create sender transaction (outgoing transfer)
    const { data: senderTransaction, error: senderTxError } = await supabaseAdmin
      .from('transactions')
      .insert({
        account_id: senderAccount.id,
        transaction_type: 'transfer',
        amount: transferAmount.toString(),
        balance_before: senderBalance.toString(),
        balance_after: senderNewBalance.toString(),
        description: description || `Transfer to ${recipientUserName || recipientAccountNumber}`,
        status: 'completed',
        reference_number: referenceNumber,
        processed_by: adminId,
        metadata: {
          transfer_type: 'outgoing',
          recipient_account: recipientAccountNumber,
          recipient_name: recipientUserName || '',
          processed_by_admin: admin.full_name || adminId
        }
      })
      .select()
      .single()

    if (senderTxError) {
      console.error('Error creating sender transaction:', senderTxError)
    }

    // Create recipient transaction (incoming transfer)
    const { data: recipientTransaction, error: recipientTxError } = await supabaseAdmin
      .from('transactions')
      .insert({
        account_id: recipientAccount.id,
        transaction_type: 'transfer',
        amount: transferAmount.toString(),
        balance_before: (recipientNewBalance - transferAmount).toString(),
        balance_after: recipientNewBalance.toString(),
        description: description || `Transfer from ${senderUserName || senderAccountNumber}`,
        status: 'completed',
        reference_number: referenceNumber,
        processed_by: adminId,
        metadata: {
          transfer_type: 'incoming',
          sender_account: senderAccountNumber,
          sender_name: senderUserName || '',
          processed_by_admin: admin.full_name || adminId
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
      transaction: senderTransaction || recipientTransaction,
      referenceNumber: referenceNumber,
      senderAccount: {
        accountNumber: senderAccount.account_number,
        newBalance: senderNewBalance
      },
      recipientAccount: {
        accountNumber: recipientAccount.account_number,
        newBalance: recipientNewBalance
      }
    })
  } catch (error: any) {
    console.error('Error processing transfer:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}









