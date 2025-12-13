"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Building2, Clock, TrendingUp, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function TellerProfileSection() {
  const { user } = useAuth()

  return (
    <Card className="border border-gray-200 dark:border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Teller Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400 dark:text-muted-foreground" />
              <span className="text-sm text-gray-600 dark:text-muted-foreground">Name:</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-foreground">{user?.name || "Unknown"}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="w-4 h-4 text-gray-400 dark:text-muted-foreground" />
              <span className="text-sm text-gray-600 dark:text-muted-foreground">ID:</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-foreground font-mono">{user?.id?.slice(0, 8) || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400 dark:text-muted-foreground" />
              <span className="text-sm text-gray-600 dark:text-muted-foreground">Branch:</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-foreground">Main Branch</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400 dark:text-muted-foreground" />
              <span className="text-sm text-gray-600 dark:text-muted-foreground">Shift:</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-foreground">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Performance Metrics (UI only) */}
        <div className="border-t border-gray-200 dark:border-border pt-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance Metrics
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-secondary">
              <span className="text-xs text-gray-600 dark:text-muted-foreground">Success Rate</span>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                98.5%
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-secondary">
              <span className="text-xs text-gray-600 dark:text-muted-foreground">Transactions Today</span>
              <span className="text-xs font-medium text-gray-900 dark:text-foreground">45</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-secondary">
              <span className="text-xs text-gray-600 dark:text-muted-foreground">Avg. Processing Time</span>
              <span className="text-xs font-medium text-gray-900 dark:text-foreground">3.2 min</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}