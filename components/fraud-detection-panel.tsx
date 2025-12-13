"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, TrendingUp, Shield, Eye, CheckCircle, XCircle } from "lucide-react"
import type { FraudAlert } from "@/lib/types"
import { useState } from "react"

interface FraudDetectionPanelProps {
  alerts: FraudAlert[]
  onInvestigate?: (id: string) => void
  onResolve?: (id: string) => void
}

const severityConfig = {
  low: { color: "bg-blue-500/10 text-blue-600 border-blue-200", icon: Shield },
  medium: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-200", icon: AlertTriangle },
  high: { color: "bg-orange-500/10 text-orange-600 border-orange-200", icon: AlertTriangle },
  critical: { color: "bg-red-500/10 text-red-600 border-red-200", icon: AlertTriangle },
}

const statusConfig = {
  new: { label: "New", color: "bg-blue-500" },
  investigating: { label: "Investigating", color: "bg-yellow-500" },
  resolved: { label: "Resolved", color: "bg-green-500" },
  false_positive: { label: "False Positive", color: "bg-gray-500" },
}

export function FraudDetectionPanel({ 
  alerts, 
  onInvestigate,
  onResolve 
}: FraudDetectionPanelProps) {
  const [filter, setFilter] = useState<"all" | "new" | "investigating">("all")

  const filteredAlerts = alerts.filter(alert => {
    if (filter === "all") return true
    return alert.status === filter
  })

  const criticalCount = alerts.filter(a => a.severity === "critical" && a.status === "new").length
  const highCount = alerts.filter(a => a.severity === "high" && a.status === "new").length
  const activeCount = alerts.filter(a => a.status === "new" || a.status === "investigating").length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Critical Alerts</p>
                <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Require immediate attention</p>
              </div>
              <div className="bg-red-500/10 text-red-600 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">High Priority</p>
                <p className="text-3xl font-bold text-orange-600">{highCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Need investigation</p>
              </div>
              <div className="bg-orange-500/10 text-orange-600 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Cases</p>
                <p className="text-3xl font-bold text-blue-600">{activeCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Total in progress</p>
              </div>
              <div className="bg-blue-500/10 text-blue-600 p-3 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fraud Alerts</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All ({alerts.length})
              </Button>
              <Button
                variant={filter === "new" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("new")}
              >
                New ({alerts.filter(a => a.status === "new").length})
              </Button>
              <Button
                variant={filter === "investigating" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("investigating")}
              >
                Investigating ({alerts.filter(a => a.status === "investigating").length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Shield className="w-8 h-8 mb-2" />
              <p>No fraud alerts</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                const severityStyle = severityConfig[alert.severity]
                const Icon = severityStyle.icon
                const statusStyle = statusConfig[alert.status]

                return (
                  <div
                    key={alert.id}
                    className="p-4 border rounded-lg hover:border-accent transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${severityStyle.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">
                                {alert.type.split("_").map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(" ")}
                              </h4>
                              <Badge variant="outline" className={severityStyle.color}>
                                {alert.severity}
                              </Badge>
                              <Badge className={statusStyle.color}>
                                {statusStyle.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {alert.description}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-muted-foreground">Customer</p>
                            <p className="font-medium">{alert.customerName}</p>
                          </div>
                          {alert.transactionId && (
                            <div>
                              <p className="text-muted-foreground">Transaction ID</p>
                              <p className="font-medium">{alert.transactionId}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground">Detected</p>
                            <p className="font-medium">
                              {new Date(alert.detectedAt).toLocaleString()}
                            </p>
                          </div>
                          {alert.assignedTo && (
                            <div>
                              <p className="text-muted-foreground">Assigned To</p>
                              <p className="font-medium">Admin #{alert.assignedTo}</p>
                            </div>
                          )}
                        </div>

                        {alert.metadata && (
                          <div className="mb-3 p-2 bg-muted rounded text-xs">
                            <strong>Details:</strong> {JSON.stringify(alert.metadata, null, 2)}
                          </div>
                        )}

                        <div className="flex gap-2">
                          {alert.status === "new" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onInvestigate?.(alert.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Investigate
                            </Button>
                          )}
                          {(alert.status === "new" || alert.status === "investigating") && (
                            <Button
                              size="sm"
                              onClick={() => onResolve?.(alert.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

