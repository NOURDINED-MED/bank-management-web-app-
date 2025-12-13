"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Cpu, HardDrive, Activity, Clock, Zap, Users, TrendingUp, AlertCircle } from "lucide-react"
import type { SystemMetrics } from "@/lib/types"
import { getCurrentSystemMetrics, formatUptime, getSystemHealthStatus } from "@/lib/system-metrics"

export function SystemMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics>(getCurrentSystemMetrics())
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      setMetrics(getCurrentSystemMetrics())
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [isLive])

  const health = getSystemHealthStatus(metrics)

  const statusColor = {
    healthy: "bg-green-500",
    warning: "bg-yellow-500",
    critical: "bg-red-500",
  }

  const metricCards = [
    {
      title: "CPU Usage",
      value: metrics.cpu.toFixed(1),
      unit: "%",
      icon: Cpu,
      color: metrics.cpu > 80 ? "text-red-600" : metrics.cpu > 60 ? "text-yellow-600" : "text-green-600",
      bgColor: metrics.cpu > 80 ? "bg-red-500/10" : metrics.cpu > 60 ? "bg-yellow-500/10" : "bg-green-500/10",
    },
    {
      title: "Memory",
      value: metrics.memory.toFixed(1),
      unit: "%",
      icon: HardDrive,
      color: metrics.memory > 85 ? "text-red-600" : metrics.memory > 70 ? "text-yellow-600" : "text-green-600",
      bgColor: metrics.memory > 85 ? "bg-red-500/10" : metrics.memory > 70 ? "bg-yellow-500/10" : "bg-green-500/10",
    },
    {
      title: "API Latency",
      value: metrics.apiLatency.toFixed(0),
      unit: "ms",
      icon: Zap,
      color: metrics.apiLatency > 200 ? "text-red-600" : metrics.apiLatency > 100 ? "text-yellow-600" : "text-green-600",
      bgColor: metrics.apiLatency > 200 ? "bg-red-500/10" : metrics.apiLatency > 100 ? "bg-yellow-500/10" : "bg-green-500/10",
    },
    {
      title: "Active Users",
      value: metrics.activeUsers,
      unit: "",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Requests/Min",
      value: metrics.requestsPerMinute,
      unit: "",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Uptime",
      value: formatUptime(metrics.uptime),
      unit: "",
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      {/* System Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Health
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusColor[health.status]} ${isLive ? 'animate-pulse' : ''}`} />
              <Badge
                variant={health.status === "healthy" ? "default" : "destructive"}
                className={
                  health.status === "healthy"
                    ? "bg-green-500"
                    : health.status === "warning"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }
              >
                {health.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {health.issues.length > 0 && (
            <div className="space-y-2 mb-4">
              {health.issues.map((issue, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950 p-2 rounded">
                  <AlertCircle className="w-4 h-4" />
                  {issue}
                </div>
              ))}
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.title}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                    <div className="flex items-baseline gap-1">
                      <p className={`text-3xl font-bold ${metric.color}`}>
                        {metric.value}
                      </p>
                      {metric.unit && (
                        <span className="text-sm text-muted-foreground">{metric.unit}</span>
                      )}
                    </div>
                    {metric.unit === "%" && typeof metric.value === "string" && (
                      <Progress value={parseFloat(metric.value)} className="mt-2 h-2" />
                    )}
                  </div>
                  <div className={`${metric.bgColor} ${metric.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">CPU Usage</span>
                  <span className="text-sm font-medium">{metrics.cpu.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.cpu} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Memory Usage</span>
                  <span className="text-sm font-medium">{metrics.memory.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.memory} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Disk Usage</span>
                  <span className="text-sm font-medium">{metrics.disk.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.disk} className="h-2" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm">Error Rate</span>
                <span className="font-semibold">{metrics.errorRate.toFixed(2)}%</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm">Active Connections</span>
                <span className="font-semibold">{metrics.activeUsers}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm">Avg Response Time</span>
                <span className="font-semibold">{metrics.apiLatency.toFixed(0)}ms</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

