"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Shield, Smartphone, Monitor, Tablet, Key, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface LoginAttempt {
  id: string
  date: string
  location: string
  device: string
  status: "success" | "failed"
  ipAddress: string
}

interface Device {
  id: string
  name: string
  type: "desktop" | "mobile" | "tablet"
  browser: string
  lastUsed: string
  isTrusted: boolean
}

export function SecuritySettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([])
  const [authorizedDevices, setAuthorizedDevices] = useState<Device[]>([])

  useEffect(() => {
    if (user?.id) {
      fetchSecurityData()
    }
  }, [user])

  const fetchSecurityData = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/customer/security?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setTwoFactorEnabled(data.twoFactorEnabled || false)
        setLoginAttempts(data.loginAttempts || [])
        
        // Convert sessions to devices format
        const devices = (data.sessions || []).map((session: any, index: number) => ({
          id: session.id,
          name: session.deviceName,
          type: session.deviceType,
          browser: session.browser,
          lastUsed: session.lastActive || new Date().toISOString(),
          isTrusted: index === 0 // Most recent is trusted
        }))
        setAuthorizedDevices(devices)
      }
    } catch (error) {
      console.error('Error fetching security data:', error)
      toast.error('Failed to load security data')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle2FA = async () => {
    if (!user?.id) return
    
    const newValue = !twoFactorEnabled
    try {
      const response = await fetch('/api/customer/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          twoFactorEnabled: newValue
        })
      })

      if (response.ok) {
        setTwoFactorEnabled(newValue)
        toast.success(`Two-factor authentication ${newValue ? 'enabled' : 'disabled'}`)
      } else {
        toast.error('Failed to update 2FA status')
      }
    } catch (error) {
      console.error('Error updating 2FA:', error)
      toast.error('Failed to update 2FA status')
    }
  }

  const handleResetPassword = () => {
    toast.info("Password reset functionality coming soon")
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "desktop":
        return <Monitor className="w-5 h-5" />
      case "mobile":
        return <Smartphone className="w-5 h-5" />
      case "tablet":
        return <Tablet className="w-5 h-5" />
      default:
        return <Monitor className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Security & Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 2FA Status */}
        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
            </div>
          </div>
          <Switch checked={twoFactorEnabled} onCheckedChange={handleToggle2FA} />
        </div>

        {/* Recent Login Attempts */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Recent Login Attempts</h3>
          <div className="space-y-2">
            {loginAttempts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No login attempts found</p>
            ) : (
              loginAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-start justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors bg-white dark:bg-gray-800/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {attempt.status === "success" ? (
                        <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                      )}
                      <span className={`text-sm font-medium ${
                        attempt.status === "success" ? "text-gray-900 dark:text-gray-100" : "text-red-600 dark:text-red-400"
                      }`}>
                        {attempt.status === "success" ? "Successful" : "Failed"} Login
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{attempt.device}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{attempt.location}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">IP: {attempt.ipAddress}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(attempt.date).toLocaleString()}
                    </p>
                  </div>
                  {attempt.status === "failed" && (
                    <Badge className="bg-red-500 dark:bg-red-600 text-white">Failed</Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Authorized Devices */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Authorized Devices</h3>
          <div className="space-y-2">
            {authorizedDevices.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No authorized devices found</p>
            ) : (
              authorizedDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors bg-white dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      {getDeviceIcon(device.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{device.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{device.browser}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last used: {new Date(device.lastUsed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.isTrusted && (
                      <Badge className="bg-green-500 dark:bg-green-600 text-white">Trusted</Badge>
                    )}
                    <Button variant="ghost" size="sm" className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Password Reset */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button 
            variant="outline" 
            onClick={handleResetPassword} 
            className="w-full border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Key className="w-4 h-4 mr-2" />
            Reset Password
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
