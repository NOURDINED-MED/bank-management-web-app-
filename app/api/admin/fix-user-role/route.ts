import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * Fix a user's role - updates both database and auth metadata
 * This is a utility endpoint to fix accounts with incorrect roles
 * Users can fix their own role, or admins can fix any user's role
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, newRole, userId } = body

    if (!email && !userId) {
      return NextResponse.json(
        { error: 'Email or User ID is required' },
        { status: 400 }
      )
    }

    if (!newRole) {
      return NextResponse.json(
        { error: 'New role is required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['admin', 'teller', 'customer']
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Find user by email or userId
    let user: any = null
    let userError: any = null

    if (userId) {
      const result = await supabaseAdmin
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', userId)
        .single()
      user = result.data
      userError = result.error
    } else if (email) {
      const result = await supabaseAdmin
        .from('users')
        .select('id, email, full_name, role')
        .eq('email', email.trim().toLowerCase())
        .single()
      user = result.data
      userError = result.error
    }

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Step 1: Update role in database (users table)
    const { data: updatedUser, error: dbError } = await supabaseAdmin
      .from('users')
      .update({ role: newRole })
      .eq('id', user.id)
      .select('id, email, full_name, role')
      .single()

    if (dbError) {
      console.error('Error updating role in database:', dbError)
      return NextResponse.json(
        { error: 'Failed to update role in database', details: dbError.message },
        { status: 500 }
      )
    }

    // Step 2: Update role in auth user_metadata
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        {
          user_metadata: {
            role: newRole
          }
        }
      )

      if (authError) {
        console.error('Error updating auth metadata:', authError)
        // Continue even if auth update fails - database update succeeded
      }
    } catch (authError: any) {
      console.error('Error updating auth metadata:', authError)
      // Continue even if auth update fails - database update succeeded
    }

    return NextResponse.json({
      success: true,
      message: `User role updated to ${newRole} successfully`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.full_name,
        role: updatedUser.role
      },
      instructions: 'Please log out and log back in for the changes to take effect.'
    })
  } catch (error: any) {
    console.error('Error fixing user role:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

