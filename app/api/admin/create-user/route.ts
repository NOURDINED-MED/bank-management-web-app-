import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      adminId, // ID of the admin creating this user (for verification)
      name,
      email,
      password,
      role, // 'admin' or 'teller'
      phone
    } = body

    // Validate required fields
    if (!adminId || !name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Admin ID, name, email, password, and role are required' },
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

    // Validate role
    if (role !== 'admin' && role !== 'teller') {
      return NextResponse.json(
        { error: 'Role must be either "admin" or "teller"' },
        { status: 400 }
      )
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Step 1: Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email - no verification needed
      user_metadata: {
        full_name: name,
        phone: phone || null,
        role: role
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      
      let errorMessage = authError.message || 'Failed to create user account'
      
      // Better error messages
      const errorMsg = authError.message?.toLowerCase() || ''
      if (errorMsg.includes('already registered') || 
          errorMsg.includes('already exists') ||
          errorMsg.includes('email') && (errorMsg.includes('taken') || errorMsg.includes('already'))) {
        errorMessage = 'This email is already registered. Please use a different email.'
      } else if (errorMsg.includes('invalid') && errorMsg.includes('email')) {
        errorMessage = 'Please enter a valid email address.'
      } else if (errorMsg.includes('password')) {
        errorMessage = 'Password does not meet requirements. Please use a stronger password.'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? authError.message : undefined
        },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Step 2: Create user profile in public.users table
    const userId = authData.user.id
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email,
        full_name: name,
        phone: phone || null,
        role: role, // Set the role (admin or teller)
        status: 'active',
        is_active: true,
        kyc_status: 'verified' // Admin/teller accounts are pre-verified
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      
      // Cleanup: Delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {})
      
      // Check if user already exists
      if (profileError.code === '23505' || profileError.message?.includes('duplicate')) {
        return NextResponse.json(
          { error: 'This email is already registered' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        {
          error: 'Failed to create user profile',
          details: process.env.NODE_ENV === 'development' ? profileError.message : undefined
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: profileData.id,
        email: profileData.email,
        name: profileData.full_name,
        role: profileData.role,
        status: profileData.status,
        createdAt: profileData.created_at
      },
      message: `${role === 'admin' ? 'Admin' : 'Teller'} user created successfully`
    })
  } catch (error: any) {
    console.error('Create user API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

