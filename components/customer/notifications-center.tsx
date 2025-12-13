"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, ArrowUpRight, ArrowDownRight, Shield, Info, AlertTriangle, X } from "lucide-react"
import type { CustomerNotification } from "@/lib/types"

interface NotificationsCenterProps {
  notifications: CustomerNotification[]
  onMarkAsRead?: (notificationId: string) => void
  onDismiss?: (notificationId: string) => void
}

const notificationIcons = {
  deposit: ArrowUpRight,
  withdrawal: ArrowDownRight,
  security: Shield,
  info: Info,
  alert: AlertTriangle
}

const notificationColors = {
  deposit: "text-green-600 bg-green-500/10",
  withdrawal: "text-red-600 bg-red-500/10",
  security: "text-orange-600 bg-orange-500/10",
  info: "text-blue-600 bg-blue-500/10",
  alert: "text-yellow-600 bg-yellow-500/10"
}

export function NotificationsCenter({ 
  notifications, 
  onMarkAsRead, 
  onDismiss 
}: NotificationsCenterProps) {
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          {unreadCount > 0 && (
            <Badge className="bg-red-500">{unreadCount} New</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type]
                const colorClass = notificationColors[notification.type]

                return (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      !notification.read 
                        ? "bg-accent/50 border-accent" 
                        : "hover:bg-accent/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onDismiss?.(notification.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>

                        {notification.amount && (
                          <p className={`text-sm font-semibold mb-2 ${
                            notification.type === "deposit" ? "text-green-600" : "text-red-600"
                          }`}>
                            {notification.type === "deposit" ? "+" : "-"}$
                            {notification.amount.toLocaleString()}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                          {!notification.read && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() => onMarkAsRead?.(notification.id)}
                            >
                              Mark as read
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
        </ScrollArea>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => {
              notifications.forEach(n => {
                if (!n.read) onMarkAsRead?.(n.id)
              })
            }}
          >
            Mark All as Read
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

