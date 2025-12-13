import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate but don't throw - use placeholder to prevent runtime errors
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase admin environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
}

// Use placeholder values if missing - use valid JWT format to prevent createClient errors
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co'
// Use Supabase demo service role key format (valid JWT) to prevent validation errors
const finalServiceKey = supabaseServiceKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Server-side Supabase client with admin privileges (bypasses RLS)
// ⚠️ USE ONLY IN SERVER-SIDE CODE (API routes, server actions)
export const supabaseAdmin = createClient(finalUrl, finalServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to verify this is only used server-side
export function ensureServerSide() {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin should only be used on the server side')
  }
}

