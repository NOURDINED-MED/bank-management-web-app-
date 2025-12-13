import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { securityMiddleware, sanitizeObject } from '@/lib/security-middleware'
import { trackSecurityEvent } from '@/lib/security-monitor'

/**
 * Helper function to check if messages table exists
 * Returns true if table exists, false otherwise
 */
async function checkMessagesTableExists(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('messages')
      .select('id')
      .limit(1)
    
    // If no error, table exists
    if (!error) {
      return true
    }
    
    // If error is about table not existing, return false
    if (error && (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('schema cache'))) {
      return false
    }
    
    // Other errors - assume table exists but there's a different issue
    return true
  } catch {
    return false
  }
}

/**
 * GET /api/messages
 * Get messages for the current user
 * Query params:
 * - userId: User ID (required)
 * - type: 'sent' | 'received' | 'all' (default: 'all')
 * - unread: 'true' | 'false' (filter unread messages)
 * - limit: number (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    // Check if table exists
    const tableExists = await checkMessagesTableExists()
    if (!tableExists) {
      return NextResponse.json(
        { 
          error: 'Messages table not found',
          details: 'The messages table does not exist in the database. Please visit /setup-messages to create it, or run the SQL from database-messages-schema.sql in your Supabase SQL Editor.',
          setupUrl: '/setup-messages'
        },
        { status: 500 }
      )
    }
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') || 'all' // 'sent', 'received', 'all'
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Verify user exists and get their role
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Handle queries separately for null to_user_id (Supabase .or() doesn't handle null well)
    let messages: any[] = []
    
    if (type === 'sent') {
      const { data, error } = await supabaseAdmin
        .from('messages')
        .select(`
          *,
          from_user:users!messages_from_user_id_fkey(id, full_name, email, role),
          to_user:users!messages_to_user_id_fkey(id, full_name, email, role)
        `)
        .eq('from_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      messages = data || []
    } else if (type === 'received') {
      if (user.role === 'admin' || user.role === 'teller') {
        // Get messages sent to this specific user
        const { data: toUser, error: error1 } = await supabaseAdmin
          .from('messages')
          .select(`
            *,
            from_user:users!messages_from_user_id_fkey(id, full_name, email, role),
            to_user:users!messages_to_user_id_fkey(id, full_name, email, role)
          `)
          .eq('to_user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)
        
        if (error1) throw error1
        
        // Get messages sent to all staff (null to_user_id)
        const { data: toAll, error: error2 } = await supabaseAdmin
          .from('messages')
          .select(`
            *,
            from_user:users!messages_from_user_id_fkey(id, full_name, email, role),
            to_user:users!messages_to_user_id_fkey(id, full_name, email, role)
          `)
          .is('to_user_id', null)
          .order('created_at', { ascending: false })
          .limit(limit)
        
        if (error2) throw error2
        
        // Combine and sort by created_at
        messages = [...(toUser || []), ...(toAll || [])]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit)
      } else {
        const { data, error } = await supabaseAdmin
          .from('messages')
          .select(`
            *,
            from_user:users!messages_from_user_id_fkey(id, full_name, email, role),
            to_user:users!messages_to_user_id_fkey(id, full_name, email, role)
          `)
          .eq('to_user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)
        
        if (error) throw error
        messages = data || []
      }
    } else {
      // 'all' - get both sent and received
      if (user.role === 'admin' || user.role === 'teller') {
        // Get sent messages
        const { data: sent, error: error1 } = await supabaseAdmin
          .from('messages')
          .select(`
            *,
            from_user:users!messages_from_user_id_fkey(id, full_name, email, role),
            to_user:users!messages_to_user_id_fkey(id, full_name, email, role)
          `)
          .eq('from_user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)
        
        if (error1) throw error1
        
        // Get messages to this user
        const { data: toUser, error: error2 } = await supabaseAdmin
          .from('messages')
          .select(`
            *,
            from_user:users!messages_from_user_id_fkey(id, full_name, email, role),
            to_user:users!messages_to_user_id_fkey(id, full_name, email, role)
          `)
          .eq('to_user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)
        
        if (error2) throw error2
        
        // Get messages to all staff (null)
        const { data: toAll, error: error3 } = await supabaseAdmin
          .from('messages')
          .select(`
            *,
            from_user:users!messages_from_user_id_fkey(id, full_name, email, role),
            to_user:users!messages_to_user_id_fkey(id, full_name, email, role)
          `)
          .is('to_user_id', null)
          .order('created_at', { ascending: false })
          .limit(limit)
        
        if (error3) throw error3
        
        // Combine, deduplicate, and sort
        const allMessages = [...(sent || []), ...(toUser || []), ...(toAll || [])]
        const uniqueMessages = Array.from(
          new Map(allMessages.map(msg => [msg.id, msg])).values()
        )
        messages = uniqueMessages
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit)
      } else {
        const { data: sent, error: error1 } = await supabaseAdmin
          .from('messages')
          .select(`
            *,
            from_user:users!messages_from_user_id_fkey(id, full_name, email, role),
            to_user:users!messages_to_user_id_fkey(id, full_name, email, role)
          `)
          .eq('from_user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)
        
        if (error1) throw error1
        
        const { data: received, error: error2 } = await supabaseAdmin
          .from('messages')
          .select(`
            *,
            from_user:users!messages_from_user_id_fkey(id, full_name, email, role),
            to_user:users!messages_to_user_id_fkey(id, full_name, email, role)
          `)
          .eq('to_user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)
        
        if (error2) throw error2
        
        const allMessages = [...(sent || []), ...(received || [])]
        const uniqueMessages = Array.from(
          new Map(allMessages.map(msg => [msg.id, msg])).values()
        )
        messages = uniqueMessages
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit)
      }
    }

    // Filter unread messages if needed
    if (unreadOnly && type !== 'sent') {
      messages = messages.filter(msg => !msg.is_read)
    }

    console.log(`📬 Fetched ${messages.length} messages for user ${userId} (role: ${user.role}, type: ${type})`)
    
    // Format messages
    const formattedMessages = messages.map((msg: any) => ({
      id: msg.id,
      fromUserId: msg.from_user_id,
      fromUserName: msg.from_user?.full_name || 'Unknown',
      fromUserEmail: msg.from_user?.email || '',
      fromUserRole: msg.from_user?.role || 'customer',
      toUserId: msg.to_user_id,
      toUserName: msg.to_user?.full_name || (msg.to_user_id ? 'Unknown' : 'All Staff'),
      toUserEmail: msg.to_user?.email || '',
      toUserRole: msg.to_user?.role || null,
      subject: msg.subject || 'No Subject',
      message: msg.message,
      isRead: msg.is_read,
      readAt: msg.read_at,
      threadId: msg.thread_id,
      priority: msg.priority || 'normal',
      category: msg.category || 'general',
      createdAt: msg.created_at
    }))

    // Get unread count
    let unreadCount = 0
    try {
      // For admins/tellers, count messages sent to them OR to all staff (null to_user_id)
      if (user.role === 'admin' || user.role === 'teller') {
        // Use separate queries for null and specific user_id
        const { count: countToUser } = await supabaseAdmin
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('to_user_id', userId)
          .eq('is_read', false)

        const { count: countToAll } = await supabaseAdmin
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .is('to_user_id', null)
          .eq('is_read', false)

        unreadCount = (countToUser || 0) + (countToAll || 0)
      } else {
        const { count } = await supabaseAdmin
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('to_user_id', userId)
          .eq('is_read', false)
        
        unreadCount = count || 0
      }
    } catch (countError: any) {
      console.error('Error counting unread messages:', countError)
      unreadCount = 0
    }

    return NextResponse.json({
      messages: formattedMessages,
      unreadCount: unreadCount || 0
    })
  } catch (error: any) {
    console.error('Error:', error)
    
    // Check if error is about table not existing
    if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('schema cache')) {
      return NextResponse.json(
        { 
          error: 'Messages table not found',
          details: 'The messages table does not exist in the database. Please visit /setup-messages to create it, or run the SQL from database-messages-schema.sql in your Supabase SQL Editor.',
          setupUrl: '/setup-messages'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/messages
 * Send a new message
 * Body:
 * - fromUserId: User ID of sender (required)
 * - toUserId: User ID of recipient (optional - null for all admins/tellers)
 * - subject: Message subject (optional)
 * - message: Message content (required)
 * - priority: 'low' | 'normal' | 'high' | 'urgent' (default: 'normal')
 * - category: Message category (default: 'general')
 * - threadId: Parent message ID if this is a reply (optional)
 */
export async function POST(request: NextRequest) {
  try {
    // Check if table exists first
    const tableExists = await checkMessagesTableExists()
    if (!tableExists) {
      return NextResponse.json(
        { 
          error: 'Messages table not found',
          details: 'The messages table does not exist in the database. Please visit /setup-messages to create it, or run the SQL from database-messages-schema.sql in your Supabase SQL Editor.',
          setupUrl: '/setup-messages'
        },
        { status: 500 }
      )
    }
    
    // Security: Rate limiting
    const { rateLimitMiddleware } = await import('@/lib/rate-limit')
    const rateLimitResult = await rateLimitMiddleware(request as any, {
      interval: 60 * 1000,
      maxRequests: 20 // 20 messages per minute
    })
    
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }
    
    const body = await request.json()
    
    // Security: Sanitize all input
    const sanitizedBody = sanitizeObject(body)
    const {
      fromUserId,
      toUserId,
      subject,
      message,
      priority = 'normal',
      category = 'general',
      threadId
    } = sanitizedBody

    if (!fromUserId || !message) {
      console.error('❌ Missing required fields:', { fromUserId: !!fromUserId, message: !!message })
      return NextResponse.json(
        { error: 'Sender ID and message content are required' },
        { status: 400 }
      )
    }

    // Security: Get client IP for logging
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Log the incoming request for debugging
    console.log('📨 POST /api/messages - Request received:', {
      fromUserId,
      toUserId: toUserId || 'null (all staff)',
      subject: subject || 'No subject',
      category,
      priority,
      messageLength: message.trim().length,
      ip: clientIP
    })

    // Verify sender exists - be more lenient with the check
    let sender: any = null
    let senderRole = 'customer' // Default role
    
    const { data: senderData, error: senderError } = await supabaseAdmin
      .from('users')
      .select('id, role, full_name, email')
      .eq('id', fromUserId)
      .single()

    if (senderError) {
      console.warn('⚠️ Sender lookup error:', senderError.message)
      // If user doesn't exist in users table, try to get from auth
      try {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(fromUserId)
        if (authUser?.user) {
          console.log('✅ Found user in auth, using default customer role')
          senderRole = 'customer'
          sender = { id: fromUserId, role: 'customer' }
        } else {
          // User doesn't exist at all - this is a real error
          console.error('❌ User not found in auth or users table:', fromUserId)
          return NextResponse.json(
            { 
              error: 'Sender not found',
              details: 'Your user account was not found. Please log out and log back in, or contact support.',
              debug: senderError.message
            },
            { status: 404 }
          )
        }
      } catch (authError: any) {
        console.error('❌ Error checking auth user:', authError)
      return NextResponse.json(
          { 
            error: 'Sender not found',
            details: 'Unable to verify your account. Please try logging out and back in.',
            debug: authError.message
          },
        { status: 404 }
      )
      }
    } else if (senderData) {
      sender = senderData
      senderRole = senderData.role || 'customer'
      console.log('✅ Sender verified:', { id: sender.id, role: sender.role })
    } else {
      // No data returned but no error - this shouldn't happen, but be lenient
      console.warn('⚠️ No sender data returned, but no error. Proceeding with default role.')
      sender = { id: fromUserId, role: 'customer' }
      senderRole = 'customer'
    }

    // If toUserId is provided, verify recipient exists
    if (toUserId) {
      const { data: recipient, error: recipientError } = await supabaseAdmin
        .from('users')
        .select('id, role')
        .eq('id', toUserId)
        .single()

      if (recipientError || !recipient) {
        return NextResponse.json(
          { error: 'Recipient not found' },
          { status: 404 }
        )
      }
    }

    // Ensure user exists in users table (required for foreign key)
    if (!senderData) {
      // User doesn't exist in users table - try to create a basic record
      console.log('⚠️ User not in users table, attempting to create basic record...')
      try {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(fromUserId)
        if (authUser?.user) {
          const { error: createUserError } = await supabaseAdmin
            .from('users')
            .insert({
              id: fromUserId,
              email: authUser.user.email || '',
              full_name: authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0] || 'User',
              role: 'customer',
              status: 'active'
            })
          
          if (createUserError && !createUserError.message.includes('duplicate')) {
            console.warn('⚠️ Could not create user record:', createUserError.message)
          } else {
            console.log('✅ Created user record in users table')
          }
        }
      } catch (createError) {
        console.warn('⚠️ Error creating user record:', createError)
        // Continue anyway - might work if user exists
      }
    }

    // Insert message - toUserId is null means message goes to all admins/tellers
    console.log('📨 Creating message:', {
      fromUserId,
      toUserId: toUserId || null,
      subject,
      category,
      messageLength: message.trim().length,
      senderRole: senderRole,
      usingAdminClient: true
    })
    
    const { data: newMessage, error: insertError } = await supabaseAdmin
      .from('messages')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId || null,
        subject: subject || null,
        message: message.trim(),
        priority: priority,
        category: category,
        thread_id: threadId || null,
        is_read: false
      })
      .select(`
        *,
        from_user:users!messages_from_user_id_fkey(id, full_name, email, role),
        to_user:users!messages_to_user_id_fkey(id, full_name, email, role)
      `)
      .single()
    
    console.log('📨 Message insert result:', {
      success: !!newMessage,
      error: insertError?.message,
      messageId: newMessage?.id
    })

    if (insertError) {
      console.error('❌ Error creating message:', insertError)
      console.error('Error code:', insertError.code)
      console.error('Error message:', insertError.message)
      console.error('Error details:', insertError)
      
      // Provide more specific error messages
      if (insertError.code === '42P01' || insertError.message?.includes('does not exist') || insertError.message?.includes('schema cache')) {
        // Table doesn't exist
        return NextResponse.json(
          { 
            error: 'Messages table not found',
            details: 'The messages table does not exist in the database. Please visit /setup-messages to create it, or run the SQL from database-messages-schema.sql in your Supabase SQL Editor.',
            setupUrl: '/setup-messages'
          },
          { status: 500 }
        )
      } else if (insertError.code === '23503') {
        // Foreign key violation - user doesn't exist in users table
        console.error('❌ Foreign key violation - user might not exist in users table')
        // Try to create user record or use auth user
        return NextResponse.json(
          { 
            error: 'User account issue',
            details: 'Your account might not be properly set up in the database. Please contact support or try logging out and back in.',
            debug: insertError.message
          },
          { status: 400 }
        )
      } else if (insertError.code === '42501') {
        // Permission denied (RLS) - this is likely the issue!
        console.error('❌ RLS Policy blocking insert - user might not match auth.uid()')
        return NextResponse.json(
          { 
            error: 'Permission denied',
            details: 'Row Level Security policy is blocking the message. This might happen if your user ID doesn\'t match your authenticated session. Please try logging out and back in.',
            debug: insertError.message,
            hint: 'Make sure you are logged in and your user ID matches your session.'
          },
          { status: 403 }
        )
      } else if (insertError.message?.includes('violates row-level security') || insertError.message?.includes('RLS')) {
        // RLS error (different format)
        return NextResponse.json(
          { 
            error: 'Permission denied by security policy',
            details: 'The security policy is preventing this message from being created. Please ensure you are logged in correctly.',
            debug: insertError.message
          },
          { status: 403 }
        )
      }
      
      // Generic error with full details for debugging
      return NextResponse.json(
        { 
          error: 'Failed to send message',
          details: insertError.message || 'Unknown database error',
          errorCode: insertError.code,
          hint: 'Check the server logs for more details. Common issues: RLS policies, foreign key constraints, or missing user record.'
        },
        { status: 500 }
      )
    }

    // Format response
    const formattedMessage = {
      id: newMessage.id,
      fromUserId: newMessage.from_user_id,
      fromUserName: newMessage.from_user?.full_name || 'Unknown',
      fromUserEmail: newMessage.from_user?.email || '',
      fromUserRole: newMessage.from_user?.role || 'customer',
      toUserId: newMessage.to_user_id,
      toUserName: newMessage.to_user?.full_name || (newMessage.to_user_id ? 'Unknown' : 'All Staff'),
      toUserEmail: newMessage.to_user?.email || '',
      toUserRole: newMessage.to_user?.role || null,
      subject: newMessage.subject || 'No Subject',
      message: newMessage.message,
      isRead: newMessage.is_read,
      readAt: newMessage.read_at,
      threadId: newMessage.thread_id,
      priority: newMessage.priority || 'normal',
      category: newMessage.category || 'general',
      createdAt: newMessage.created_at
    }

    return NextResponse.json({
      success: true,
      message: formattedMessage
    })
  } catch (error: any) {
    console.error('Error:', error)
    
    // Check if error is about table not existing
    if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('schema cache')) {
      return NextResponse.json(
        { 
          error: 'Messages table not found',
          details: 'The messages table does not exist in the database. Please visit /setup-messages to create it, or run the SQL from database-messages-schema.sql in your Supabase SQL Editor.',
          setupUrl: '/setup-messages'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

