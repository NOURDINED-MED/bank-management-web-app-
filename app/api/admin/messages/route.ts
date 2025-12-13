import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const adminId = searchParams.get('adminId')
    const status = searchParams.get('status') // 'unread', 'read', 'all'
    const limit = parseInt(searchParams.get('limit') || '100')

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID required' },
        { status: 400 }
      )
    }

    // Verify user is admin
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single()

    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get all customer messages (sent to all staff)
    let query = supabaseAdmin
      .from('customer_messages')
      .select('*')
      .or('recipient_type.eq.all_staff,recipient_type.eq.admin')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      messages: messages || [],
      total: messages?.length || 0
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, adminId, action, reply } = body

    if (!messageId || !adminId) {
      return NextResponse.json(
        { error: 'Message ID and Admin ID are required' },
        { status: 400 }
      )
    }

    // Verify user is admin
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single()

    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    if (action === 'mark_read') {
      const { data, error } = await supabaseAdmin
        .from('customer_messages')
        .update({ status: 'read', read_by: adminId, read_at: new Date().toISOString() })
        .eq('id', messageId)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ success: true, message: data })
    }

    if (action === 'reply' && reply) {
      // Mark original as read and add reply
      const { data: originalMessage } = await supabaseAdmin
        .from('customer_messages')
        .select('*')
        .eq('id', messageId)
        .single()

      if (!originalMessage) {
        return NextResponse.json(
          { error: 'Original message not found' },
          { status: 404 }
        )
      }

      // Update original message with reply
      const { data, error } = await supabaseAdmin
        .from('customer_messages')
        .update({
          status: 'replied',
          reply: reply.trim(),
          replied_by: adminId,
          replied_at: new Date().toISOString(),
          read_by: adminId,
          read_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ success: true, message: data })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

