"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  LogIn, 
  Shield, 
  CreditCard, 
  Settings,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react"
import type { ActivityTimelineItem } from "@/lib/types"

interface ActivityTimelineProps {
  activities: ActivityTimelineItem[]
  maxHeight?: string
}

const iconMap: Record<string, any> = {
  ArrowUpRight,
  ArrowDownRight,
  LogIn,
  Shield,
  CreditCard,
  Settings
}

const statusColors = {
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600"
}

const statusIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle
}

const typeColors = {
  transaction: "bg-blue-500/10 text-blue-600",
  login: "bg-purple-500/10 text-purple-600",
  security: "bg-orange-500/10 text-orange-600",
  system: "bg-gray-500/10 text-gray-600"
}

export function ActivityTimeline({ activities, maxHeight = "500px" }: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <p className="text-sm text-muted-foreground">
          Your account activity and security events
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[21px] top-0 bottom-0 w-[2px] bg-border" />

            {/* Timeline items */}
            <div className="space-y-6">
              {activities.map((activity, index) => {
                const Icon = iconMap[activity.icon] || Settings
                const typeColor = typeColors[activity.type]
                const StatusIcon = activity.status ? statusIcons[activity.status] : null

                return (
                  <div key={activity.id} className="relative pl-12">
                    {/* Icon */}
                    <div className={`absolute left-0 w-[42px] h-[42px] rounded-full ${typeColor} flex items-center justify-center border-4 border-background z-10`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="bg-muted/50 rounded-lg p-4 hover:bg-muted transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{activity.title}</h4>
                            {StatusIcon && activity.status && (
                              <StatusIcon className={`w-4 h-4 ${statusColors[activity.status]}`} />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {activities.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

