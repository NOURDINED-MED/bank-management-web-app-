"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"
import type { CashDrawer } from "@/lib/types"

interface CashDrawerProps {
  drawer: CashDrawer
  onReconcile?: () => void
}

export function CashDrawerComponent({ drawer, onReconcile }: CashDrawerProps) {
  const statusConfig = {
    open: { label: "Open", color: "bg-blue-500", icon: Wallet },
    balanced: { label: "Balanced", color: "bg-green-500", icon: CheckCircle },
    over: { label: "Over", color: "bg-yellow-500", icon: TrendingUp },
    short: { label: "Short", color: "bg-red-500", icon: TrendingDown },
    closed: { label: "Closed", color: "bg-gray-500", icon: Wallet }
  }

  const status = statusConfig[drawer.status]
  const StatusIcon = status.icon
  const discrepancyPercent = drawer.expectedCash > 0 
    ? Math.abs((drawer.discrepancy / drawer.expectedCash) * 100) 
    : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Cash Drawer Management
          </CardTitle>
          <Badge className={status.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Cash Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Starting Cash</p>
              <p className="text-2xl font-bold text-blue-600">
                ${drawer.startingCash.toLocaleString()}
              </p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Current Cash</p>
              <p className="text-2xl font-bold text-green-600">
                ${drawer.currentCash.toLocaleString()}
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Expected Cash</p>
              <p className="text-2xl font-bold text-purple-600">
                ${drawer.expectedCash.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="space-y-3">
            <h4 className="font-semibold">Today's Activity</h4>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm">Deposits Received</span>
              </div>
              <span className="font-semibold text-green-600">
                +${drawer.depositsReceived.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm">Withdrawals Given</span>
              </div>
              <span className="font-semibold text-red-600">
                -${drawer.withdrawalsGiven.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm">Transfers Processed</span>
              </div>
              <span className="font-semibold">
                ${drawer.transfersProcessed.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Discrepancy Alert */}
          {drawer.discrepancy !== 0 && (
            <div className={`p-4 rounded-lg border-l-4 ${
              Math.abs(drawer.discrepancy) > 100 
                ? 'bg-red-50 dark:bg-red-950 border-red-500' 
                : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-500'
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                  Math.abs(drawer.discrepancy) > 100 ? 'text-red-600' : 'text-yellow-600'
                }`} />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">
                    Cash Discrepancy Detected
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your drawer is {drawer.discrepancy > 0 ? 'over' : 'short'} by{' '}
                    <strong>${Math.abs(drawer.discrepancy).toLocaleString()}</strong>
                    {' '}({discrepancyPercent.toFixed(2)}%)
                  </p>
                  {Math.abs(drawer.discrepancy) > 100 && (
                    <p className="text-sm font-medium text-red-600">
                      This requires immediate supervisor attention.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Last Reconciliation */}
          {drawer.lastReconciliation && (
            <div className="text-sm text-muted-foreground">
              Last reconciled: {new Date(drawer.lastReconciliation).toLocaleString()}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={onReconcile}
              className="flex-1"
            >
              Reconcile Cash Drawer
            </Button>
            <Button variant="outline">
              View History
            </Button>
          </div>

          {/* Notes */}
          {drawer.notes && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <strong>Notes:</strong> {drawer.notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

