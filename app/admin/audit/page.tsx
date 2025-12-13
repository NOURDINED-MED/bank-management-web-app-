"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download, User, Shield, DollarSign, Settings, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

// Mock audit logs
const mockAuditLogs = [
  {
    id: "AUD-001",
    timestamp: "2024-11-15T14:30:00",
    user: "Admin User",
    action: "User Role Changed",
    target: "teller1@financeapp.com",
    details: "Changed role from 'user' to 'teller'",
    ip: "192.168.1.100",
    severity: "medium",
    status: "success"
  },
  {
    id: "AUD-002",
    timestamp: "2024-11-15T13:45:00",
    user: "mohamed nourdine",
    action: "Large Transfer Processed",
    target: "ACC-2024-001 → ACC-2024-002",
    details: "Transfer of $5,000.00 processed",
    ip: "192.168.1.101",
    severity: "high",
    status: "success"
  },
  {
    id: "AUD-003",
    timestamp: "2024-11-15T12:20:00",
    user: "System",
    action: "Security Alert",
    target: "Login Attempt",
    details: "Failed login attempt from unknown IP",
    ip: "203.0.113.45",
    severity: "high",
    status: "warning"
  },
  {
    id: "AUD-004",
    timestamp: "2024-11-15T11:15:00",
    user: "Admin User",
    action: "System Settings Changed",
    target: "Transfer Limits",
    details: "Updated daily transfer limit to $10,000",
    ip: "192.168.1.100",
    severity: "medium",
    status: "success"
  },
  {
    id: "AUD-005",
    timestamp: "2024-11-15T10:30:00",
    user: "mohamed nourdine",
    action: "Account Created",
    target: "New Customer",
    details: "Created account ACC-2024-104 for John Smith",
    ip: "192.168.1.101",
    severity: "low",
    status: "success"
  },
  {
    id: "AUD-006",
    timestamp: "2024-11-15T09:45:00",
    user: "System",
    action: "Backup Completed",
    target: "Database",
    details: "Daily backup completed successfully",
    ip: "localhost",
    severity: "low",
    status: "success"
  },
  {
    id: "AUD-007",
    timestamp: "2024-11-15T08:00:00",
    user: "Admin User",
    action: "User Deactivated",
    target: "olduser@financeapp.com",
    details: "Account deactivated due to inactivity",
    ip: "192.168.1.100",
    severity: "medium",
    status: "success"
  }
]

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter
    const matchesAction = actionFilter === "all" || log.action === actionFilter

    return matchesSearch && matchesSeverity && matchesAction
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/10 text-red-600"
      case "medium":
        return "bg-yellow-500/10 text-yellow-600"
      case "low":
        return "bg-green-500/10 text-green-600"
      default:
        return "bg-gray-500/10 text-gray-600"
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes("User") || action.includes("Account")) return <User className="w-4 h-4" />
    if (action.includes("Transfer") || action.includes("Deposit") || action.includes("Withdrawal")) return <DollarSign className="w-4 h-4" />
    if (action.includes("Security") || action.includes("Login")) return <Shield className="w-4 h-4" />
    if (action.includes("Settings") || action.includes("System")) return <Settings className="w-4 h-4" />
    return <AlertTriangle className="w-4 h-4" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold text-balance">Audit Logs</h1>
              <p className="text-muted-foreground mt-2">Timeline of sensitive actions and system events</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="User Role Changed">User Role Changed</SelectItem>
                    <SelectItem value="Large Transfer Processed">Large Transfer Processed</SelectItem>
                    <SelectItem value="Security Alert">Security Alert</SelectItem>
                    <SelectItem value="System Settings Changed">System Settings Changed</SelectItem>
                    <SelectItem value="Account Created">Account Created</SelectItem>
                    <SelectItem value="Backup Completed">Backup Completed</SelectItem>
                    <SelectItem value="User Deactivated">User Deactivated</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => {
                  setSearchTerm("")
                  setSeverityFilter("all")
                  setActionFilter("all")
                }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Timeline ({filteredLogs.length} events)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredLogs.map((log, index) => (
                  <div key={log.id} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        log.severity === 'high' ? 'bg-red-500/10 text-red-600' :
                        log.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-600' :
                        'bg-green-500/10 text-green-600'
                      }`}>
                        {getActionIcon(log.action)}
                      </div>
                      {index < filteredLogs.length - 1 && (
                        <div className="w-0.5 h-16 bg-border mt-2"></div>
                      )}
                    </div>

                    {/* Log content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{log.action}</h3>
                            <Badge className={getSeverityColor(log.severity)}>
                              {log.severity}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(log.status)}
                              <span className="text-sm capitalize">{log.status}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">{log.user}</span> • {log.target}
                          </p>
                          <p className="text-sm">{log.details}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                            <span>IP: {log.ip}</span>
                            <span className="font-mono">ID: {log.id}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No audit logs found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
