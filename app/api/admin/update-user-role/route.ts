import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * Update a user's role in both the database and auth metadata
 * This fixes accounts that have the wrong role
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminId, userId, newRole } = body

    if (!adminId || !userId || !newRole) {
      return NextResponse.json(
        { error: 'Admin ID, User ID, and new role are required' },
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

    // Verify the requesting user is an admin
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single()

    if (adminError || !adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Step 1: Update role in database (users table)
    const { data: updatedUser, error: dbError } = await supabaseAdmin
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
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
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
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
      }
    })
  } catch (error: any) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

