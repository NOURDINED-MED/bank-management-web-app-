"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock, DollarSign, User } from "lucide-react"

interface Approval {
  id: string
  type: "high_value" | "dispute" | "freeze"
  customerName: string
  amount?: number
  description: string
  timestamp: string
  status: "pending" | "approved" | "rejected"
}

export function ApprovalsRequests() {
  // Mock data - would come from API
  const approvals: Approval[] = [
    {
      id: "1",
      type: "high_value",
      customerName: "John Doe",
      amount: 50000,
      description: "Large withdrawal request",
      timestamp: new Date().toISOString(),
      status: "pending"
    }
  ]

  const pendingApprovals = approvals.filter(a => a.status === "pending")

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            Approvals & Requests
          </CardTitle>
          {pendingApprovals.length > 0 && (
            <Badge className="bg-red-500 text-white">
              {pendingApprovals.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {pendingApprovals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map((approval) => (
              <div
                key={approval.id}
                className="p-4 rounded-lg border border-yellow-200 bg-yellow-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {approval.type === "high_value" && (
                      <DollarSign className="w-4 h-4 text-yellow-600" />
                    )}
                    {approval.type === "dispute" && (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className="text-sm font-medium text-gray-900">{approval.customerName}</span>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                </div>
                <p className="text-xs text-gray-700 mb-2">{approval.description}</p>
                {approval.amount && (
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    ${approval.amount.toLocaleString()}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Manager Approval Placeholder */}
        <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Manager approval requests appear here
          </p>
        </div>
      </CardContent>
    </Card>
  )
}