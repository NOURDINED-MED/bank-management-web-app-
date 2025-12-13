import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, subject, message, category, priority } = body

    if (!customerId || !subject || !message) {
      return NextResponse.json(
        { error: 'Customer ID, subject, and message are required' },
        { status: 400 }
      )
    }

    // Verify the customer exists
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', customerId)
      .eq('role', 'customer')
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Create message record - it will be visible to both admin and teller
    // We'll use a special "to" value of "all_staff" to indicate it goes to all staff
    const { data: messageData, error: insertError } = await supabaseAdmin
      .from('customer_messages')
      .insert({
        customer_id: customerId,
        customer_name: customer.full_name,
        customer_email: customer.email,
        subject: subject.trim(),
        message: message.trim(),
        category: category || 'general',
        priority: priority || 'normal',
        status: 'unread',
        // This message goes to all staff (both admin and teller)
        recipient_type: 'all_staff'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating message:', insertError)
      return NextResponse.json(
        { error: 'Failed to send message', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: messageData,
      message: 'Message sent successfully. Admin and teller will respond soon.'
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

