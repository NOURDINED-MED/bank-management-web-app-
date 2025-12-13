"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Calendar, CheckCircle, AlertCircle, Clock } from "lucide-react"
import type { UpcomingBill } from "@/lib/types"

interface UpcomingBillsProps {
  bills: UpcomingBill[]
  onPayBill?: (billId: string) => void
  onToggleAutopay?: (billId: string) => void
}

export function UpcomingBills({ bills, onPayBill, onToggleAutopay }: UpcomingBillsProps) {
  const totalDue = bills.filter(b => b.status !== "paid").reduce((sum, bill) => sum + bill.amount, 0)
  const overdueCount = bills.filter(b => b.status === "overdue").length

  const sortedBills = [...bills].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  const statusConfig = {
    paid: { label: "Paid", color: "bg-green-500", icon: CheckCircle },
    pending: { label: "Pending", color: "bg-yellow-500", icon: Clock },
    overdue: { label: "Overdue", color: "bg-red-500", icon: AlertCircle }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upcoming Bills</CardTitle>
          {overdueCount > 0 && (
            <Badge className="bg-red-500">
              {overdueCount} Overdue
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Due</p>
                <p className="text-2xl font-bold">${totalDue.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Bills This Month</p>
                <p className="text-2xl font-bold">{bills.length}</p>
              </div>
            </div>
          </div>

          {/* Bills List */}
          <div className="space-y-3">
            {sortedBills.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming bills</p>
              </div>
            ) : (
              sortedBills.map((bill) => {
                const status = statusConfig[bill.status]
                const StatusIcon = status.icon
                const daysUntilDue = getDaysUntilDue(bill.dueDate)

                return (
                  <div
                    key={bill.id}
                    className={`p-4 border rounded-lg ${
                      bill.status === "overdue" 
                        ? "border-red-500 bg-red-50 dark:bg-red-950" 
                        : "hover:border-accent"
                    } transition-colors`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{bill.name}</h4>
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{bill.category}</p>
                        <p className="text-lg font-bold">${bill.amount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm">
                        <p className="text-muted-foreground">Due Date</p>
                        <p className="font-medium">
                          {new Date(bill.dueDate).toLocaleDateString()}
                          {bill.status !== "paid" && (
                            <span className={`ml-2 ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 3 ? 'text-yellow-600' : ''}`}>
                              ({daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days`})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={bill.autopay}
                          onCheckedChange={() => onToggleAutopay?.(bill.id)}
                          disabled={bill.status === "paid"}
                        />
                        <span className="text-sm text-muted-foreground">Autopay</span>
                      </div>
                      {bill.status !== "paid" && (
                        <Button 
                          size="sm"
                          onClick={() => onPayBill?.(bill.id)}
                          variant={bill.status === "overdue" ? "destructive" : "default"}
                        >
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

