import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const checks = {
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl && supabaseUrl !== 'undefined' ? '✅ Set' : '❌ Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseAnonKey && supabaseAnonKey !== 'undefined' ? '✅ Set' : '❌ Missing',
      SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey && supabaseServiceKey !== 'undefined' ? '✅ Set' : '❌ Missing',
    },
    urlFormat: {
      isValid: supabaseUrl?.startsWith('https://') ? '✅ Valid' : '❌ Invalid (should start with https://)',
      url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'Not set'
    },
    connection: {
      status: 'Testing...',
      error: null as string | null
    }
  }

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'undefined' || supabaseAnonKey === 'undefined') {
    return NextResponse.json({
      success: false,
      message: 'Environment variables are missing or not set correctly',
      checks
    }, { status: 500 })
  }

  // Test connection
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Try to make a simple query to test connection
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (error) {
      checks.connection.status = '❌ Connection Failed'
      checks.connection.error = error.message
    } else {
      checks.connection.status = '✅ Connected Successfully'
    }

    return NextResponse.json({
      success: !error,
      message: error ? 'Cannot connect to Supabase' : 'Supabase connection successful',
      checks,
      error: error?.message
    })
  } catch (err: any) {
    checks.connection.status = '❌ Connection Failed'
    checks.connection.error = err.message
    
    return NextResponse.json({
      success: false,
      message: 'Network error: Cannot reach Supabase',
      checks,
      error: err.message
    }, { status: 500 })
  }
}
