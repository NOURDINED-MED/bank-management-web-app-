/**
 * Supabase Authentication Helpers
 * Simplified functions for common auth operations
 */

import { supabase } from './supabase-client'

export interface SignUpData {
  email: string
  password: string
  fullName: string
  phone?: string
  role?: 'customer' | 'teller' | 'admin'
}

export interface SignInData {
  email: string
  password: string
}

/**
 * Sign up a new user
 */
export async function signUp({ email, password, fullName, phone, role = 'customer' }: SignUpData) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role,
        },
      },
    })

    if (authError) throw authError

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await (supabase
        .from('users') as any)
        .insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          phone: phone || null,
          role,
          status: 'pending_kyc',
        })

      if (profileError) throw profileError

      // Create default checking account
      const { error: accountError } = await (supabase
        .from('accounts') as any)
        .insert({
          user_id: authData.user.id,
          account_number: generateAccountNumber(),
          account_type: 'checking',
          account_name: 'Main Checking',
          balance: 0,
          available_balance: 0,
        })

      if (accountError) throw accountError
    }

    return { data: authData, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

/**
 * Sign in an existing user
 */
export async function signIn({ email, password }: SignInData) {
  try {
    // Check if Supabase is configured first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Check if we're using placeholder values (means env vars weren't loaded)
    if (!supabaseUrl || 
        !supabaseKey || 
        supabaseUrl === 'undefined' || 
        supabaseKey === 'undefined' ||
        supabaseUrl === 'https://placeholder.supabase.co' ||
        supabaseKey === 'placeholder-key' ||
        !supabaseUrl.startsWith('https://') ||
        supabaseKey.length < 10) {
      console.error('❌ Supabase configuration check failed:', {
        url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Missing',
        key: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Missing',
        keyLength: supabaseKey?.length || 0
      })
      return {
        data: null,
        error: 'Supabase is not configured. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly. Then restart your dev server (npm run dev). Visit /login/check-config to verify your configuration.'
      }
    }

    // Add timeout to prevent hanging (set to 20 seconds for better balance)
    const authPromise = supabase.auth.signInWithPassword({
      email,
      password,
    })

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Authentication timeout after 20 seconds')), 20000)
    )

    let result: any
    try {
      result = await Promise.race([authPromise, timeoutPromise])
    } catch (raceError: any) {
      // Handle timeout errors
      if (raceError?.message?.includes('timeout')) {
        return {
          data: null,
          error: 'Authentication request timed out. Please try again.'
        }
      }
      // Re-throw other errors to be handled by outer catch
      throw raceError
    }

    // Supabase returns { data, error } - extract them
    const { data, error } = result || { data: null, error: null }

    if (error) {
      // Extract error message from various possible formats
      const errorMessage = error.message || error.msg || String(error) || ''
      const errorStatus = error.status || error.statusCode || null
      
      // Don't log to console - we'll return user-friendly error instead
      // console.error('🔴 Supabase auth error:', error)
      
      // Check if it's invalid login credentials (most common case)
      if (errorMessage.includes('Invalid login credentials') ||
          errorMessage.includes('Invalid credentials') ||
          errorMessage.includes('invalid_credentials') ||
          errorStatus === 400 ||
          (errorStatus === 401 && errorMessage.toLowerCase().includes('invalid'))) {
        return {
          data: null,
          error: 'Invalid email or password. If you don\'t have an account, please sign up first. Make sure your email is correct and your password matches the one you used when creating your account.'
        }
      }
      
      // Check if it's a network error
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('NetworkError') ||
          error.name === 'TypeError' ||
          errorMessage.includes('fetch')) {
        return {
          data: null,
          error: 'Unable to connect to the server. Please check your internet connection and try again.'
        }
      }
      
      // Check for authentication/configuration errors
      if (errorMessage.includes('Invalid API key') || 
          errorMessage.includes('JWT') ||
          errorStatus === 401) {
        return {
          data: null,
          error: 'Invalid Supabase configuration. Please verify your API keys in .env.local and restart the server.'
        }
      }
      
      // Return generic error message instead of throwing
      return {
        data: null,
        error: errorMessage || 'Sign in failed. Please check your credentials and try again.'
      }
    }

    // Update last login in background (non-blocking)
    if (data.user) {
      setTimeout(async () => {
        try {
          await (supabase
            .from('users') as any)
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', data.user.id)
        } catch (error) {
          // Silently fail - don't block login
        }
      }, 0)
    }

    return { data, error: null }
  } catch (error: any) {
    // Extract error information from various possible formats
    const errorMessage = error?.message || error?.msg || error?.error?.message || String(error) || ''
    const errorStatus = error?.status || error?.statusCode || error?.error?.status || null
    const errorName = error?.name || error?.error?.name || ''
    
    // Handle invalid login credentials FIRST (most common error - check this before anything else)
    if (errorMessage.includes('Invalid login credentials') ||
        errorMessage.includes('Invalid credentials') ||
        errorMessage.includes('invalid_credentials') ||
        errorMessage.toLowerCase().includes('invalid') && (errorStatus === 400 || errorStatus === 401)) {
      return {
        data: null,
        error: 'Invalid email or password. If you don\'t have an account, please sign up first. Make sure your email is correct and your password matches the one you used when creating your account.'
      }
    }
    
    // Handle network errors and timeouts
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('Authentication timeout') ||
        errorName === 'TypeError' ||
        (errorName === 'TypeError' && errorMessage.includes('fetch'))) {
      
      // Provide more helpful error message with troubleshooting steps
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const hasConfig = supabaseUrl && supabaseUrl !== 'undefined' && supabaseUrl.startsWith('https://')
      
      if (!hasConfig) {
        return {
          data: null,
          error: 'Supabase is not configured. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly. Then restart your dev server (npm run dev). Visit /login/check-config to verify your configuration.'
        }
      }
      
      return {
        data: null,
        error: 'Unable to connect to Supabase. Please check: 1) Your internet connection, 2) That your dev server is running (npm run dev), 3) Your Supabase credentials in .env.local. Visit /login/check-config for detailed diagnostics.'
      }
    }
    
    // Handle API key errors
    if (error.message?.includes('Invalid API key') || 
        error.message?.includes('JWT') ||
        error.status === 401) {
      return {
        data: null,
        error: 'Supabase configuration error. Please check your API keys in .env.local and restart the server.'
      }
    }
    
    // Handle specific Supabase error messages
    if (error.message) {
      return { 
        data: null, 
        error: error.message 
      }
    }
    
    return { data: null, error: 'Sign in failed. Please try again.' }
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Get the current user (simplified)
 */
export async function getCurrentUser() {
  try {
    // Use getSession first (cached) before getUser (network request)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) throw sessionError
    if (!session?.user) return { user: null, profile: null, error: null }

    const user = session.user

    // Fetch user profile - simple query with timeout
    const profilePromise = supabase
      .from('users')
      .select('id, email, full_name, role, status')
      .eq('id', user.id)
      .single()

    // Add timeout to prevent hanging (increased to 10 seconds for better reliability)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile fetch timeout after 10 seconds')), 10000)
    )

    const { data: profile, error: profileError } = await Promise.race([
      profilePromise,
      timeoutPromise
    ]) as any

    if (profileError) {
      // If profile fetch fails, still return user but log the error
      console.warn('Profile fetch failed:', profileError)
      return { user, profile: null, error: profileError.message || 'Profile not found' }
    }

    return { user, profile, error: null }
  } catch (error: any) {
    // Handle network errors gracefully
    if (error.message?.includes('Failed to fetch') || 
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.name === 'TypeError') {
      console.warn('Network error getting current user:', error.message)
      return { user: null, profile: null, error: 'Network error. Please check your connection.' }
    }
    return { user: null, profile: null, error: error.message || 'Failed to get current user' }
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, updates: any) {
  try {
    const { data, error } = await (supabase
      .from('users') as any)
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

/**
 * Get user role
 */
export async function getUserRole() {
  const { profile } = await getCurrentUser()
  return profile?.role || null
}

/**
 * Generate a unique account number (temporary - should be done server-side)
 */
function generateAccountNumber(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString()
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}


