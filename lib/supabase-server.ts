/**
 * Supabase Admin Client (Server-Side Only)
 * Use this ONLY in API routes and server actions
 * This bypasses Row Level Security (RLS) - use with caution!
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate but don't throw - use placeholder to prevent runtime errors
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase service role key')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
}

// Use placeholder values if missing - use valid JWT format to prevent createClient errors
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co'
// Use Supabase demo service role key format (valid JWT) to prevent validation errors
const finalServiceKey = supabaseServiceKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Admin client with full access (bypasses RLS)
export const supabaseAdmin = createClient(finalUrl, finalServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

