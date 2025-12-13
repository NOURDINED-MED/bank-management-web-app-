import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * POST /api/setup/messages-table
 * Creates the messages table if it doesn't exist
 * This uses the service role key to create the table via Supabase REST API
 */
export async function POST(request: NextRequest) {
  try {
    // First, check if table already exists
    const { error: testError } = await supabaseAdmin
      .from('messages')
      .select('id')
      .limit(1)

    // If no error, table exists
    if (!testError) {
      return NextResponse.json({
        success: true,
        message: 'Messages table already exists!'
      })
    }

    // If error is not about table missing, return it
    if (testError && !testError.message.includes('does not exist') && !testError.message.includes('schema cache')) {
      return NextResponse.json({
        success: false,
        error: testError.message
      }, { status: 500 })
    }

    // Table doesn't exist - create it using Supabase REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({
      success: false,
        error: 'Supabase configuration missing. Please check your environment variables.'
      }, { status: 500 })
    }

    // SQL to create the messages table
    const createTableSQL = `
-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    thread_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'account', 'transaction', 'card', 'technical', 'complaint')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_from_user_id ON public.messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user_id ON public.messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_to_user_unread ON public.messages(to_user_id, is_read) WHERE is_read = false;

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update received messages" ON public.messages;

-- Create RLS policies
CREATE POLICY "Users can view their own messages"
    ON public.messages FOR SELECT
    USING (
        auth.uid()::text = from_user_id::text OR 
        auth.uid()::text = to_user_id::text OR
        (to_user_id IS NULL AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role IN ('admin', 'teller')
        ))
    );

CREATE POLICY "Users can create messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid()::text = from_user_id::text);

CREATE POLICY "Users can update received messages"
    ON public.messages FOR UPDATE
    USING (auth.uid()::text = to_user_id::text);
    `.trim()

    // Execute SQL using Supabase REST API
    // Note: We need to use the PostgREST API or create a function in Supabase
    // Since direct SQL execution isn't available via JS client, we'll use the REST API
    try {
      // Try to execute via REST API using rpc (if exec_sql function exists)
      // Otherwise, we'll need to guide the user to run it manually
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        },
        body: JSON.stringify({ sql: createTableSQL })
      })

      if (response.ok) {
        // Wait a moment for table to be created
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Verify table was created
        const { error: verifyError } = await supabaseAdmin
          .from('messages')
          .select('id')
          .limit(1)

        if (!verifyError) {
          return NextResponse.json({
            success: true,
            message: 'Messages table created successfully!'
          })
        }
      }
    } catch (apiError: any) {
      console.log('RPC method not available, will provide manual instructions')
    }

    // If automatic creation failed, return SQL for manual execution
    return NextResponse.json({
      success: false,
      error: 'Automatic table creation is not available. Please run the SQL manually in Supabase SQL Editor.',
      sql: createTableSQL,
      instructions: [
        '1. Go to your Supabase Dashboard',
        '2. Click "SQL Editor" in the left sidebar',
        '3. Click "New Query"',
        '4. Paste the SQL code above',
        '5. Click "Run" (or press Ctrl+Enter / Cmd+Enter)',
        '6. Wait for success message',
        '7. Come back here and click "Check if Messages Table Exists"'
      ]
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error checking/creating messages table:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check table status'
    }, { status: 500 })
  }
}







