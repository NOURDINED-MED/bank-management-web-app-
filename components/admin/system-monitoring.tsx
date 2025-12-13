"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Server, 
  Database,
  Shield,
  Lock,
  Unlock,
  Clock
} from "lucide-react"

export function SystemMonitoring() {
  // Mock data - would come from API
  const apiStatus = {
    status: "operational",
    uptime: 99.9,
    responseTime: 120
  }

  const recentErrors = [
    { id: "1", type: "Warning", message: "Slow query detected", timestamp: "2 minutes ago", severity: "low" },
    { id: "2", type: "Error", message: "Connection timeout", timestamp: "15 minutes ago", severity: "medium" },
  ]

  const loginAttempts = {
    successful: 1247,
    failed: 23,
    suspicious: 3
  }

  return (
    <Card className="border border-gray-200 dark:border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          System Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Status */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">API Status</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card">
              <div className="flex items-center justify-between mb-2">
                <Server className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Operational
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-muted-foreground">API Server</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card">
              <div className="flex items-center justify-between mb-2">
                <Database className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-muted-foreground">Database</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Secure
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-muted-foreground">Security</p>
            </div>
          </div>
        </div>

        {/* Service Uptime */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Service Uptime</h3>
          <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700 dark:text-foreground">System Uptime</span>
              <span className="text-lg font-bold text-gray-900 dark:text-foreground">{apiStatus.uptime}%</span>
            </div>
            <Progress value={apiStatus.uptime} className="h-2" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500 dark:text-muted-foreground">Response Time</span>
              <span className="text-xs font-medium text-gray-900 dark:text-foreground">{apiStatus.responseTime}ms</span>
            </div>
          </div>
        </div>

        {/* Error Logs & Warnings */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Error Logs & Warnings</h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {recentErrors.map((error) => (
              <div
                key={error.id}
                className={`p-3 border rounded-lg ${
                  error.severity === "medium" 
                    ? "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30" 
                    : "border-gray-200 dark:border-border bg-gray-50 dark:bg-secondary/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {error.severity === "medium" ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-foreground">{error.type}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-muted-foreground">{error.message}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-muted-foreground">{error.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Login Attempts */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Login Attempts</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Unlock className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-lg font-bold text-green-600 dark:text-green-400">{loginAttempts.successful}</span>
              </div>
              <p className="text-xs text-gray-700 dark:text-foreground">Successful</p>
            </div>
            <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-lg font-bold text-red-600 dark:text-red-400">{loginAttempts.failed}</span>
              </div>
              <p className="text-xs text-gray-700 dark:text-foreground">Failed</p>
            </div>
            <div className="p-4 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{loginAttempts.suspicious}</span>
              </div>
              <p className="text-xs text-gray-700 dark:text-foreground">Suspicious</p>
            </div>
          </div>
        </div>

        {/* Suspicious Login Alerts */}
        {loginAttempts.suspicious > 0 && (
          <div className="p-4 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h4 className="font-medium text-yellow-900 dark:text-yellow-300">Suspicious Login Alerts</h4>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              {loginAttempts.suspicious} suspicious login attempt(s) detected. Review security logs.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

