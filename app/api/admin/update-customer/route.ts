import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminId, customerId, name, email, phone, status, kycStatus } = body

    if (!adminId || !customerId) {
      return NextResponse.json(
        { error: 'Admin ID and Customer ID are required' },
        { status: 400 }
      )
    }

    // Verify admin user
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single()

    if (adminError || !admin || admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Verify customer exists
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', customerId)
      .single()

    if (customerError || !customer || customer.role !== 'customer') {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) {
      updateData.full_name = name.trim()
    }

    if (email !== undefined) {
      // Check if email is already taken by another user
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .neq('id', customerId)
        .single()

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use by another user' },
          { status: 400 }
        )
      }

      updateData.email = email.trim().toLowerCase()
      
      // Also update auth email if email changed
      try {
        await supabaseAdmin.auth.admin.updateUserById(customerId, {
          email: email.trim().toLowerCase()
        })
      } catch (authError) {
        console.error('Error updating auth email:', authError)
        // Continue with user update even if auth update fails
      }
    }

    if (phone !== undefined) {
      updateData.phone = phone.trim() || null
    }

    if (status !== undefined) {
      updateData.status = status
      
      // If status is frozen, also update account status
      if (status === 'frozen' || status === 'inactive') {
        await supabaseAdmin
          .from('accounts')
          .update({ 
            status: 'frozen',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', customerId)
      } else if (status === 'active') {
        await supabaseAdmin
          .from('accounts')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', customerId)
      }
    }

    if (kycStatus !== undefined) {
      updateData.kyc_status = kycStatus
    }

    // Update customer
    const { data: updatedCustomer, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', customerId)
      .select('id, email, full_name, phone, status, kyc_status, created_at')
      .single()

    if (updateError) {
      console.error('Error updating customer:', updateError)
      return NextResponse.json(
        { error: 'Failed to update customer' },
        { status: 500 }
      )
    }

    // Get updated account info
    const { data: accounts } = await supabaseAdmin
      .from('accounts')
      .select('id, account_number, account_type, balance, status')
      .eq('user_id', customerId)
      .eq('status', 'active')

    const primaryAccount = accounts?.[0] || null

    return NextResponse.json({
      success: true,
      customer: {
        id: updatedCustomer.id,
        email: updatedCustomer.email,
        name: updatedCustomer.full_name,
        phone: updatedCustomer.phone || '',
        accountNumber: primaryAccount?.account_number || 'N/A',
        accountType: primaryAccount?.account_type || 'checking',
        balance: primaryAccount ? parseFloat(primaryAccount.balance || 0) : 0,
        status: updatedCustomer.status || 'active',
        kycStatus: updatedCustomer.kyc_status || 'pending',
        createdAt: updatedCustomer.created_at
      }
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


























