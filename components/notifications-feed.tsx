"use client"

import { useState } from "react"
import { Bell, X, AlertTriangle, UserPlus, Shield, AlertCircle, Ticket } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { Notification } from "@/lib/types"
import Link from "next/link"

interface NotificationsFeedProps {
  notifications: Notification[]
  onMarkAsRead?: (id: string) => void
  onDismiss?: (id: string) => void
}

const iconMap = {
  signup: UserPlus,
  kyc_submission: Shield,
  kyc_approved: Shield,
  transaction_flagged: AlertTriangle,
  system_alert: AlertCircle,
  ticket_created: Ticket,
  fraud_detected: AlertTriangle,
}

const priorityColors = {
  low: "bg-blue-500/10 text-blue-600 border-blue-200",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  high: "bg-red-500/10 text-red-600 border-red-200",
}

export function NotificationsFeed({ 
  notifications, 
  onMarkAsRead,
  onDismiss 
}: NotificationsFeedProps) {
  const [localNotifications, setLocalNotifications] = useState(notifications)

  const unreadCount = localNotifications.filter(n => !n.read).length

  const handleMarkAsRead = (id: string) => {
    setLocalNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    onMarkAsRead?.(id)
  }

  const handleDismiss = (id: string) => {
    setLocalNotifications(prev => prev.filter(n => n.id !== id))
    onDismiss?.(id)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <CardTitle>Notifications</CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localNotifications.forEach(n => !n.read && handleMarkAsRead(n.id))
            }}
          >
            Mark all as read
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {localNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {localNotifications.map((notification, index) => {
                const Icon = iconMap[notification.type] || Bell
                return (
                  <div key={notification.id}>
                    <div
                      className={`p-4 rounded-lg border transition-colors ${
                        notification.read
                          ? "bg-background"
                          : "bg-accent/50 border-accent"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            priorityColors[notification.priority]
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDismiss(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            {!notification.read && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                Mark as read
                              </Button>
                            )}
                            {notification.actionUrl && (
                              <Link href={notification.actionUrl}>
                                <Button variant="default" size="sm">
                                  View Details
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < localNotifications.length - 1 && (
                      <Separator className="my-3" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

