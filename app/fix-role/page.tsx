"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function FixRolePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [newRole, setNewRole] = useState<"admin" | "teller" | "customer">("admin")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleFixRole = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      // Use current user's ID if available, otherwise use email
      const requestBody: any = { newRole }
      if (user?.id) {
        requestBody.userId = user.id
        // Also include email for verification
        if (email) {
          requestBody.email = email.trim().toLowerCase()
        } else if (user.email) {
          requestBody.email = user.email
        }
      } else if (email) {
        requestBody.email = email.trim().toLowerCase()
      } else {
        setResult({
          success: false,
          message: 'Please provide an email address or log in first'
        })
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin/fix-user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: `Role updated successfully! ${data.instructions || 'Please log out and log back in.'}`
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to update role'
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'An error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogoutAndReload = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Fix User Role</CardTitle>
          <CardDescription>
            Update a user's role in both the database and authentication system.
            Use this if you're being redirected to the wrong dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFixRole} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address {user?.id ? '(Optional - will use your account)' : '*'}</Label>
              <Input
                id="email"
                type="email"
                placeholder={user?.email || "user@example.com"}
                value={email || user?.email || ''}
                onChange={(e) => setEmail(e.target.value)}
                required={!user?.id}
                disabled={loading || !!user?.id}
              />
              {user?.id && (
                <p className="text-xs text-muted-foreground">
                  Will fix role for your current account: {user.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">New Role</Label>
              <Select value={newRole} onValueChange={(value: any) => setNewRole(value)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teller">Teller</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {result && (
              <div className={`p-4 rounded-lg flex items-start gap-3 ${
                result.success 
                  ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50' 
                  : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50'
              }`}>
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <p className={`text-sm ${
                  result.success 
                    ? 'text-green-700 dark:text-green-400' 
                    : 'text-red-700 dark:text-red-400'
                }`}>
                  {result.message}
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating Role...
                </>
              ) : (
                'Fix Role'
              )}
            </Button>

            {result?.success && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleLogoutAndReload}
              >
                Logout and Reload
              </Button>
            )}

            {user && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  <strong>Current User:</strong> {user.email} ({user.role})
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                  If this is your account, enter your email above to fix your role.
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

