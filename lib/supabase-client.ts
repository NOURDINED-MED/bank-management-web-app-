/**
 * Supabase Client (Browser/Client-Side)
 * Use this in React components, pages, and client-side code
 * This respects Row Level Security (RLS) policies
 */

import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
// In Next.js, NEXT_PUBLIC_* variables are embedded at build time and available on client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔍 Supabase Client Debug:', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing',
    key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'missing',
    keyLength: supabaseAnonKey?.length || 0
  })
}

// Validate environment variables
const isValidUrl = supabaseUrl && 
  supabaseUrl !== 'undefined' && 
  supabaseUrl.trim() !== '' && 
  supabaseUrl.startsWith('https://') &&
  supabaseUrl !== 'https://placeholder.supabase.co'

const isValidKey = supabaseAnonKey && 
  supabaseAnonKey !== 'undefined' && 
  supabaseAnonKey.trim() !== '' &&
  supabaseAnonKey.length > 10 &&
  supabaseAnonKey !== 'placeholder-key'

// Better error messages for missing environment variables
if (!isValidUrl || !isValidKey) {
  if (typeof window !== 'undefined') {
    console.error('❌ Supabase client not properly configured.')
    if (!isValidUrl) {
      console.error('Missing or invalid NEXT_PUBLIC_SUPABASE_URL')
      console.error('Current value:', supabaseUrl || 'undefined')
    }
    if (!isValidKey) {
      console.error('Missing or invalid NEXT_PUBLIC_SUPABASE_ANON_KEY')
      console.error('Current value:', supabaseAnonKey ? 'Set' : 'Not set')
    }
    console.error('Please check your .env.local file and restart the dev server (npm run dev)')
  }
}

// Use actual values - Next.js will replace these at build time
// If missing, we need to provide valid JWT format to prevent createClient from throwing
// These will fail on actual use but won't break app initialization
const finalUrl = isValidUrl ? supabaseUrl! : 'https://placeholder.supabase.co'
// Use Supabase demo anon key format (valid JWT) to prevent validation errors
const finalKey = isValidKey ? supabaseAnonKey! : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Only create client if we have valid values, otherwise create a dummy client
let supabaseClient: ReturnType<typeof createClient>

try {
  supabaseClient = createClient(finalUrl, finalKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'apikey': finalKey
      }
    }
  })
} catch (error) {
  // If createClient fails, create a minimal client that won't throw
  // This should only happen if Supabase library changes its validation
  console.error('Failed to create Supabase client:', error)
  // Create with minimal valid JWT format to prevent errors
  supabaseClient = createClient(
    'https://placeholder.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export const supabase = supabaseClient

// Export a helper to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'undefined' && 
    supabaseAnonKey !== 'undefined' &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  )
}
