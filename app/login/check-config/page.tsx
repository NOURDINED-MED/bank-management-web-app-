"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CheckConfigPage() {
  const [checks, setChecks] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/test-supabase')
      const data = await response.json()
      setChecks(data)
    } catch (error) {
      setChecks({
        success: false,
        message: 'Failed to check configuration',
        error: error
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Supabase Configuration Check</h1>
          <Link href="/login">
            <Button variant="outline">Back to Login</Button>
          </Link>
        </div>

        {checks && (
          <>
            {/* Environment Variables */}
            <Card>
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {checks.checks?.envVars && Object.entries(checks.checks.envVars).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-mono text-sm">{key}</span>
                    <span className={value.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                      {value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* URL Format */}
            {checks.checks?.urlFormat && (
              <Card>
                <CardHeader>
                  <CardTitle>URL Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span>URL Valid</span>
                    <span className={checks.checks.urlFormat.isValid.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                      {checks.checks.urlFormat.isValid}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{checks.checks.urlFormat.url}</p>
                </CardContent>
              </Card>
            )}

            {/* Connection Status */}
            {checks.checks?.connection && (
              <Card>
                <CardHeader>
                  <CardTitle>Connection Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {checks.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span>{checks.checks.connection.status || (checks.success ? 'Connected' : 'Failed')}</span>
                  </div>
                  {checks.checks.connection.error && (
                    <Alert className="mt-4" variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{checks.checks.connection.error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Overall Status */}
            <Alert variant={checks.success ? "default" : "destructive"}>
              {checks.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {checks.message || (checks.success ? 'Supabase is configured correctly!' : 'Configuration issue detected')}
              </AlertDescription>
            </Alert>

            {!checks.success && (
              <Card>
                <CardHeader>
                  <CardTitle>How to Fix</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">1. Check your .env.local file</h3>
                    <p className="text-sm text-gray-600 mb-2">Make sure it contains:</p>
                    <pre className="bg-gray-100 p-3 rounded text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here`}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">2. Get your credentials</h3>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Go to <a href="https://app.supabase.com" target="_blank" className="text-blue-600 underline">Supabase Dashboard</a></li>
                      <li>Select your project</li>
                      <li>Go to Settings → API</li>
                      <li>Copy the Project URL and anon/public key</li>
                    </ol>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">3. Restart your dev server</h3>
                    <p className="text-sm text-gray-600">After updating .env.local, restart with:</p>
                    <pre className="bg-gray-100 p-3 rounded text-xs">npm run dev</pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <Button onClick={checkConfiguration} className="w-full">
          Re-check Configuration
        </Button>
      </div>
    </div>
  )
}

