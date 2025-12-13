"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2, Database, Copy, Check } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function SetupMessagesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const sqlCode = `CREATE TABLE IF NOT EXISTS public.messages (
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

CREATE INDEX IF NOT EXISTS idx_messages_from_user_id ON public.messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user_id ON public.messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_to_user_unread ON public.messages(to_user_id, is_read) WHERE is_read = false;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update received messages" ON public.messages;

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
    USING (auth.uid()::text = to_user_id::text);`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sqlCode)
      setCopied(true)
      toast.success('SQL code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleTestConnection = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      // Test if table exists by trying to query it
      const testResponse = await fetch('/api/messages?userId=' + user?.id + '&type=all&limit=1')
      const testData = await testResponse.json()
      
      if (testData.error && (testData.error.includes('table') || testData.error.includes('schema cache') || testData.error.includes('does not exist'))) {
        setResult({
          success: false,
          message: '❌ Messages table does NOT exist yet. Click "Create Table Automatically" below, or follow the manual steps.'
        })
      } else {
        setResult({
          success: true,
          message: '✅ Messages table exists! You can now send messages. Go back to your dashboard and try sending a message.'
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: '❌ Error checking table. Make sure you are logged in and try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTable = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      // First, copy the SQL to clipboard automatically
      await navigator.clipboard.writeText(sqlCode)
      setCopied(true)
      
      const response = await fetch('/api/setup/messages-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResult({
          success: true,
          message: '✅ ' + data.message
        })
        toast.success('Messages table created successfully!')
      } else {
        // If automatic creation failed, show manual instructions
        const instructions = data.instructions ? '\n\n' + data.instructions.map((inst: string, idx: number) => `${idx + 1}. ${inst}`).join('\n') : ''
        setResult({
          success: false,
          message: '⚠️ Automatic creation is not available. The SQL code has been copied to your clipboard!\n\n' + 
                   'Follow these steps:\n' +
                   '1. Click "Open Supabase Dashboard" button below\n' +
                   '2. Go to SQL Editor → New Query\n' +
                   '3. Paste the SQL (Ctrl+V / Cmd+V)\n' +
                   '4. Click "Run" (or Ctrl+Enter)\n' +
                   '5. Come back here and click "Check if Table Exists"'
        })
        toast.success('SQL code copied to clipboard! Now paste it in Supabase SQL Editor.', { duration: 5000 })
      }
    } catch (error: any) {
      // Even on error, copy SQL to clipboard
      try {
        await navigator.clipboard.writeText(sqlCode)
        setCopied(true)
        toast.success('SQL code copied to clipboard! Use the manual method below.')
      } catch {}
      
      setResult({
        success: false,
        message: '⚠️ Automatic creation failed. SQL code has been copied to your clipboard.\n\nPlease use the manual method: Go to Supabase Dashboard → SQL Editor → Paste and Run.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-2">
            Setup Messages Table
          </h1>
          <p className="text-gray-600 dark:text-muted-foreground">
            Create the messages table in your Supabase database
          </p>
        </div>

        {/* Test Connection */}
        <Card className="mb-6 border border-gray-200 dark:border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Check Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button onClick={handleTestConnection} disabled={loading} variant="outline" className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                    Check if Table Exists
                </>
              )}
            </Button>
              
              <Button onClick={handleCreateTable} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Create Table Automatically
                  </>
                )}
              </Button>
            </div>

            {result && (
              <Alert className={result.success ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'}>
                <AlertDescription className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                  <span>{result.message}</span>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mb-6 border border-gray-200 dark:border-border">
          <CardHeader>
            <CardTitle>Step-by-Step Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-foreground">Open Supabase Dashboard</p>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">
                    Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-semibold">supabase.com/dashboard</a> and select your BAMS project
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-foreground">Open SQL Editor</p>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">
                    In the left sidebar, click <strong>"SQL Editor"</strong>, then click <strong>"New Query"</strong> button (green button at top right)
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-foreground">Copy the SQL Code</p>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">
                    Click the <strong>"Copy SQL"</strong> button below to copy all the SQL code to your clipboard
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-foreground">Paste and Run</p>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">
                    <strong>Paste</strong> the SQL code into the Supabase SQL Editor, then click <strong>"Run"</strong> button (or press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+Enter</kbd> / <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Cmd+Enter</kbd>)
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-foreground">Verify & Test</p>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">
                    Go to <strong>"Table Editor"</strong> in Supabase and verify you see the <strong>"messages"</strong> table. Then come back here and click <strong>"Check if Messages Table Exists"</strong> button above.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SQL Code */}
        <Card className="border border-gray-200 dark:border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>SQL Code to Run in Supabase</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy SQL
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <AlertDescription>
                <strong>Quick Steps:</strong> Click "Copy SQL" above, then go to Supabase Dashboard → SQL Editor → New Query → Paste (Ctrl+V) → Run (Ctrl+Enter)
              </AlertDescription>
            </Alert>
            <pre className="bg-gray-900 dark:bg-black text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              <code>{sqlCode}</code>
            </pre>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopy}
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    SQL Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy SQL Code
                  </>
                )}
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                className="flex-1"
              >
                Open Supabase Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-muted-foreground">
            After creating the table, go back to your dashboard and try sending a message again.
          </p>
        </div>
      </main>
    </div>
  )
}

