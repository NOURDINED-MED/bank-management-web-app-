import type { SystemMetrics } from "./types"

/**
 * System Metrics Utilities
 * Simulates system resource monitoring
 */

/**
 * Get current system metrics (simulated)
 */
export function getCurrentSystemMetrics(): SystemMetrics {
  // In a real application, these would come from actual system monitoring
  return {
    timestamp: new Date().toISOString(),
    cpu: Math.random() * 30 + 40, // 40-70%
    memory: Math.random() * 20 + 60, // 60-80%
    disk: Math.random() * 10 + 45, // 45-55%
    uptime: Math.floor(Date.now() / 1000 - Math.random() * 86400 * 30), // Last 30 days
    apiLatency: Math.random() * 100 + 50, // 50-150ms
    activeUsers: Math.floor(Math.random() * 50 + 100), // 100-150
    requestsPerMinute: Math.floor(Math.random() * 500 + 1000), // 1000-1500
    errorRate: Math.random() * 2 // 0-2%
  }
}

/**
 * Generate historical metrics data
 */
export function generateHistoricalMetrics(hours: number = 24): SystemMetrics[] {
  const metrics: SystemMetrics[] = []
  const now = Date.now()

  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now - i * 60 * 60 * 1000).toISOString()
    
    // Simulate realistic patterns
    const hourOfDay = new Date(timestamp).getHours()
    const isBusinessHours = hourOfDay >= 9 && hourOfDay <= 17
    const peakMultiplier = isBusinessHours ? 1.5 : 0.7

    metrics.push({
      timestamp,
      cpu: Math.random() * 20 + 30 * peakMultiplier,
      memory: Math.random() * 15 + 55 * peakMultiplier,
      disk: Math.random() * 5 + 50,
      uptime: Math.floor((Date.now() - i * 60 * 60 * 1000) / 1000),
      apiLatency: Math.random() * 50 + 70 * peakMultiplier,
      activeUsers: Math.floor(Math.random() * 30 + 80 * peakMultiplier),
      requestsPerMinute: Math.floor(Math.random() * 300 + 800 * peakMultiplier),
      errorRate: Math.random() * 1.5
    })
  }

  return metrics
}

/**
 * Format uptime in human-readable format
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)

  return parts.join(" ") || "0m"
}

/**
 * Get system health status based on metrics
 */
export function getSystemHealthStatus(metrics: SystemMetrics): {
  status: "healthy" | "warning" | "critical"
  issues: string[]
} {
  const issues: string[] = []
  let status: "healthy" | "warning" | "critical" = "healthy"

  // Check CPU
  if (metrics.cpu > 90) {
    issues.push("CPU usage is critically high")
    status = "critical"
  } else if (metrics.cpu > 75) {
    issues.push("CPU usage is elevated")
    if (status === "healthy") status = "warning"
  }

  // Check Memory
  if (metrics.memory > 95) {
    issues.push("Memory usage is critically high")
    status = "critical"
  } else if (metrics.memory > 85) {
    issues.push("Memory usage is high")
    if (status === "healthy") status = "warning"
  }

  // Check Disk
  if (metrics.disk > 95) {
    issues.push("Disk usage is critically high")
    status = "critical"
  } else if (metrics.disk > 85) {
    issues.push("Disk usage is high")
    if (status === "healthy") status = "warning"
  }

  // Check API Latency
  if (metrics.apiLatency > 500) {
    issues.push("API response time is critically slow")
    status = "critical"
  } else if (metrics.apiLatency > 200) {
    issues.push("API response time is slow")
    if (status === "healthy") status = "warning"
  }

  // Check Error Rate
  if (metrics.errorRate > 5) {
    issues.push("Error rate is critically high")
    status = "critical"
  } else if (metrics.errorRate > 2) {
    issues.push("Error rate is elevated")
    if (status === "healthy") status = "warning"
  }

  return { status, issues }
}

/**
 * Calculate average metrics over a period
 */
export function calculateAverageMetrics(metrics: SystemMetrics[]): SystemMetrics {
  if (metrics.length === 0) {
    return getCurrentSystemMetrics()
  }

  const sum = metrics.reduce((acc, m) => ({
    cpu: acc.cpu + m.cpu,
    memory: acc.memory + m.memory,
    disk: acc.disk + m.disk,
    apiLatency: acc.apiLatency + m.apiLatency,
    activeUsers: acc.activeUsers + m.activeUsers,
    requestsPerMinute: acc.requestsPerMinute + m.requestsPerMinute,
    errorRate: acc.errorRate + m.errorRate
  }), {
    cpu: 0,
    memory: 0,
    disk: 0,
    apiLatency: 0,
    activeUsers: 0,
    requestsPerMinute: 0,
    errorRate: 0
  })

  const count = metrics.length

  return {
    timestamp: new Date().toISOString(),
    cpu: sum.cpu / count,
    memory: sum.memory / count,
    disk: sum.disk / count,
    uptime: metrics[metrics.length - 1].uptime,
    apiLatency: sum.apiLatency / count,
    activeUsers: Math.floor(sum.activeUsers / count),
    requestsPerMinute: Math.floor(sum.requestsPerMinute / count),
    errorRate: sum.errorRate / count
  }
}

