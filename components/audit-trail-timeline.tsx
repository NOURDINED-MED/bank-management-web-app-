"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield, User, CreditCard, Settings, AlertTriangle, LogIn, CheckCircle, XCircle } from "lucide-react"
import type { AuditLog } from "@/lib/types"

interface AuditTrailTimelineProps {
  logs: AuditLog[]
  maxHeight?: string
}

const categoryIcons = {
  auth: LogIn,
  user: User,
  transaction: CreditCard,
  system: Settings,
  security: Shield,
  settings: Settings,
}

const categoryColors = {
  auth: "bg-blue-500/10 text-blue-600",
  user: "bg-purple-500/10 text-purple-600",
  transaction: "bg-green-500/10 text-green-600",
  system: "bg-orange-500/10 text-orange-600",
  security: "bg-red-500/10 text-red-600",
  settings: "bg-gray-500/10 text-gray-600",
}

export function AuditTrailTimeline({ logs, maxHeight = "600px" }: AuditTrailTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Audit Trail Timeline
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete history of system activities and user actions
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="pr-4" style={{ height: maxHeight }}>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[21px] top-0 bottom-0 w-[2px] bg-border" />

            {/* Timeline items */}
            <div className="space-y-6">
              {logs.map((log, index) => {
                const Icon = categoryIcons[log.category] || Settings
                const colorClass = categoryColors[log.category] || categoryColors.system
                
                return (
                  <div key={log.id} className="relative pl-12">
                    {/* Icon */}
                    <div className={`absolute left-0 w-[42px] h-[42px] rounded-full ${colorClass} flex items-center justify-center border-4 border-background z-10`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="bg-muted/50 rounded-lg p-4 hover:bg-muted transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{log.action}</h4>
                            <Badge variant="outline" className={colorClass}>
                              {log.category}
                            </Badge>
                            {log.success ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {log.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-2">
                        <div>
                          <p className="text-muted-foreground">User</p>
                          <p className="font-medium">{log.userName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Role</p>
                          <p className="font-medium capitalize">{log.userRole}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">IP Address</p>
                          <p className="font-medium">{log.ipAddress}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Device</p>
                          <p className="font-medium">{log.device}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </p>
                        {log.metadata && (
                          <Badge variant="secondary" className="text-xs">
                            Has metadata
                          </Badge>
                        )}
                      </div>

                      {/* Metadata (expandable) */}
                      {log.metadata && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                            View metadata
                          </summary>
                          <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {logs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Shield className="w-8 h-8 mb-2" />
                <p>No audit logs available</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

