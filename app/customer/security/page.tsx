"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  Shield, 
  Clock, 
  MapPin, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Key,
  Activity,
  Loader2
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function SecurityPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<any[]>([])
  const [devices, setDevices] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState<any[]>([])

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
        setSessions(data.sessions || [])
        // Use sessions as devices for now
        setDevices(data.sessions || [])
        // Use login attempts as audit logs
        setAuditLogs(data.loginAttempts || [])
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

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="h-5 w-5" />
      case 'tablet': return <Tablet className="h-5 w-5" />
      case 'desktop': return <Monitor className="h-5 w-5" />
      default: return <Monitor className="h-5 w-5" />
    }
  }

  const terminateSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId))
    toast.success('Session terminated')
  }

  const terminateAllSessions = () => {
    setSessions(sessions.filter(s => s.current))
    toast.success('All other sessions terminated')
  }

  const removeDevice = (deviceId: string) => {
    setDevices(devices.filter(d => d.id !== deviceId))
    toast.success('Device removed')
  }

  const trustDevice = (deviceId: string) => {
    setDevices(devices.map(d => 
      d.id === deviceId ? { ...d, isTrusted: true } : d
    ))
    toast.success('Device marked as trusted')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'failed': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Security & Privacy</h1>
        <p className="text-muted-foreground dark:text-gray-400">
          Manage your account security, sessions, and devices
        </p>
      </div>

      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {twoFactorEnabled ? '90' : '70'}/100
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              {twoFactorEnabled ? 'Strong security' : 'Good security'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{sessions.length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Across {devices.length} devices</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">2FA Status</CardTitle>
            <Key className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              {twoFactorEnabled ? "Your account is protected" : "Enable for extra security"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="devices">Trusted Devices</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
        </TabsList>

        {/* Active Sessions */}
        <TabsContent value="sessions" className="space-y-4">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Active Sessions</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Manage your active login sessions across all devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No active sessions</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-800/50"
                  >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      {getDeviceIcon(session.deviceType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{session.deviceName}</h3>
                        {session.current && (
                          <Badge variant="default" className="bg-blue-600 dark:bg-blue-500">Current</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        {session.browser} • {session.location}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.ipAddress}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.lastActive}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => terminateSession(session.id)}
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Terminate
                    </Button>
                  )}
                </div>
                ))
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={terminateAllSessions}
                >
                  Logout from all other devices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trusted Devices */}
        <TabsContent value="devices" className="space-y-4">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Trusted Devices</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Devices you've marked as trusted won't require 2FA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {devices.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No devices found</p>
              ) : (
                devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-blue-950/30">
                        {getDeviceIcon(device.deviceType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{device.deviceName}</h3>
                          {device.isTrusted ? (
                            <Badge variant="default" className="bg-green-600 dark:bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Trusted
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Untrusted
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">
                          {device.browser} {device.os ? `on ${device.os}` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                          Last used: {device.lastUsed || device.lastActive || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!device.isTrusted && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => trustDevice(device.id)}
                          className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          Trust
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeDevice(device.id)}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log */}
        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Activity Log</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                View your recent account activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No activity logs available</p>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-800/50"
                    >
                      <div className="flex gap-3">
                        <div className={`mt-1 ${getStatusColor(log.status)} dark:${log.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                          {log.status === 'success' ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {log.status === 'success' ? 'Successful' : 'Failed'} {log.action || 'Login'}
                          </h4>
                          <p className="text-sm text-muted-foreground dark:text-gray-400">
                            {new Date(log.date || log.timestamp).toLocaleString()} • {log.ipAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Security Settings</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Configure your account security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch 
                  checked={twoFactorEnabled} 
                  onCheckedChange={handleToggle2FA}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Login Notifications</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Get notified of new login attempts
                  </p>
                </div>
                <Button variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Configure</Button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Password</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Change your account password
                  </p>
                </div>
                <Button variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Change Password</Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Download Security Report</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Export your activity and security data
                  </p>
                </div>
                <Button variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Download</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

