"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Clock, AlertCircle, ArrowUp, ArrowDown, ArrowRight, Shield } from "lucide-react"
import type { CustomerQueue } from "@/lib/types"

interface CustomerQueueProps {
  queue: CustomerQueue[]
  onServeCustomer?: (queueId: string) => void
  onCancelService?: (queueId: string) => void
}

const serviceTypeConfig = {
  deposit: { icon: ArrowUp, color: "text-green-600 bg-green-500/10", label: "Deposit" },
  withdrawal: { icon: ArrowDown, color: "text-red-600 bg-red-500/10", label: "Withdrawal" },
  transfer: { icon: ArrowRight, color: "text-blue-600 bg-blue-500/10", label: "Transfer" },
  kyc_verification: { icon: Shield, color: "text-purple-600 bg-purple-500/10", label: "KYC Verification" }
}

const priorityConfig = {
  normal: { label: "Normal", color: "bg-blue-500" },
  high: { label: "High", color: "bg-orange-500" },
  urgent: { label: "Urgent", color: "bg-red-500 animate-pulse" }
}

const statusConfig = {
  waiting: { label: "Waiting", color: "bg-yellow-500" },
  in_progress: { label: "In Progress", color: "bg-blue-500" },
  completed: { label: "Completed", color: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "bg-gray-500" }
}

export function CustomerQueueComponent({ queue, onServeCustomer, onCancelService }: CustomerQueueProps) {
  const waitingCount = queue.filter(q => q.status === "waiting").length
  const inProgressCount = queue.filter(q => q.status === "in_progress").length
  const urgentCount = queue.filter(q => q.priority === "urgent" && q.status === "waiting").length

  // Calculate average wait time
  const waitingCustomers = queue.filter(q => q.status === "waiting")
  const avgWaitTime = waitingCustomers.length > 0
    ? waitingCustomers.reduce((sum, q) => {
        const waitTime = Date.now() - new Date(q.requestedAt).getTime()
        return sum + waitTime
      }, 0) / waitingCustomers.length / 60000 // Convert to minutes
    : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Customer Queue
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
              {waitingCount} Waiting
            </Badge>
            {urgentCount > 0 && (
              <Badge className="bg-red-500 animate-pulse">
                {urgentCount} Urgent
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Queue Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold">{queue.length}</p>
              <p className="text-xs text-muted-foreground">Total in Queue</p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold">{inProgressCount}</p>
              <p className="text-xs text-muted-foreground">Being Served</p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold">{Math.round(avgWaitTime)}</p>
              <p className="text-xs text-muted-foreground">Avg Wait (min)</p>
            </div>
          </div>

          {/* Queue List */}
          {queue.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No customers in queue</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {queue
                .sort((a, b) => {
                  // Sort by priority (urgent first) then by queue number
                  if (a.priority === "urgent" && b.priority !== "urgent") return -1
                  if (a.priority !== "urgent" && b.priority === "urgent") return 1
                  return a.queueNumber - b.queueNumber
                })
                .map((item) => {
                  const serviceType = serviceTypeConfig[item.serviceType]
                  const ServiceIcon = serviceType.icon
                  const priority = priorityConfig[item.priority]
                  const status = statusConfig[item.status]
                  const waitTime = Math.floor((Date.now() - new Date(item.requestedAt).getTime()) / 60000)

                  return (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-lg transition-all ${
                        item.status === "in_progress" 
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950" 
                          : "hover:border-accent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Queue Number Badge */}
                          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            {item.queueNumber}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{item.customerName}</h4>
                              <Badge className={priority.color}>
                                {priority.label}
                              </Badge>
                              <Badge variant="outline" className={status.color}>
                                {status.label}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <div className={`flex items-center gap-1 px-2 py-1 rounded ${serviceType.color}`}>
                                <ServiceIcon className="w-4 h-4" />
                                <span>{serviceType.label}</span>
                              </div>
                              
                              {item.requestedAmount && (
                                <span className="font-medium">
                                  ${item.requestedAmount.toLocaleString()}
                                </span>
                              )}

                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{waitTime} min wait</span>
                              </div>
                            </div>

                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                                {item.notes}
                              </p>
                            )}

                            {item.assignedTeller && (
                              <p className="text-xs text-blue-600 mt-2">
                                Assigned to: {item.assignedTeller}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          {item.status === "waiting" && (
                            <Button 
                              size="sm"
                              onClick={() => onServeCustomer?.(item.id)}
                            >
                              Serve Now
                            </Button>
                          )}
                          {item.status === "in_progress" && (
                            <Button 
                              size="sm"
                              variant="outline"
                            >
                              Complete
                            </Button>
                          )}
                          {(item.status === "waiting" || item.status === "in_progress") && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => onCancelService?.(item.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

