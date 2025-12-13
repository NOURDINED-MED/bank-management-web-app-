"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Lock, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  Loader2
} from "lucide-react"

interface SecurityData {
  twoFactor: {
    enabled: boolean
    adoptionRate: number
    totalUsers: number
    usersWith2FA: number
  }
  userCounts: {
    admin: number
    teller: number
    customer: number
  }
  accessLogs: Array<{
    id: string
    user: string
    action: string
    time: string
    status: string
    ip: string
  }>
  suspiciousAccounts: Array<{
    id: string
    name: string
    accountNumber: string
    reason: string
    status: string
  }>
}

export function SecurityManagement() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SecurityData | null>(null)

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/security')
      if (response.ok) {
        const securityData = await response.json()
        setData(securityData)
      }
    } catch (error) {
      console.error('Error fetching security data:', error)
    } finally {
      setLoading(false)
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

  if (!data) {
    return (
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">Failed to load security data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Security Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Two-Factor Authentication Panel */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Two-Factor Authentication Panel</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                {data.twoFactor.enabled ? (
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                    Partial
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">2FA Status</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {data.twoFactor.enabled 
                  ? '2FA is enabled for all admin accounts'
                  : `${data.twoFactor.usersWith2FA} of ${data.twoFactor.totalUsers} users have 2FA enabled`
                }
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{data.twoFactor.adoptionRate}%</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">User Adoption</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {data.twoFactor.usersWith2FA} of {data.twoFactor.totalUsers} users with 2FA enabled
              </p>
            </div>
          </div>
        </div>

        {/* User Access Logs */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">User Access Logs</h3>
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            {data.accessLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">No access logs available</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-gray-100">User</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Action</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Time</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Status</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-900 dark:text-gray-100">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {data.accessLogs.map((log) => (
                    <tr key={log.id} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.user}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{log.action}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{log.time}</span>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {log.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{log.ip}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Permission Audit */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Permission Audit</h3>
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-800/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Admin Users</span>
                <Badge variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                  {data.userCounts.admin} {data.userCounts.admin === 1 ? 'user' : 'users'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Teller Accounts</span>
                <Badge variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                  {data.userCounts.teller} {data.userCounts.teller === 1 ? 'user' : 'users'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Customer Accounts</span>
                <Badge variant="outline" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                  {data.userCounts.customer.toLocaleString()} {data.userCounts.customer === 1 ? 'user' : 'users'}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <FileText className="w-4 h-4 mr-2" />
              Generate Audit Report
            </Button>
          </div>
        </div>

        {/* Security Alerts */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
            Security Alerts
          </h3>
          {data.suspiciousAccounts.length === 0 ? (
            <div className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-700 dark:text-green-400">No security alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.suspiciousAccounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{account.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Account: {account.accountNumber}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{account.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30">
                        <Ban className="w-4 h-4 mr-1" />
                        Block
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Block Suspicious Accounts */}
        {data.suspiciousAccounts.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Block Suspicious Accounts</h3>
            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">Accounts flagged for suspicious activity:</p>
              <div className="space-y-2">
                {data.suspiciousAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{account.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Account: {account.accountNumber}</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <Ban className="w-4 h-4 mr-1" />
                      Block Account
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

