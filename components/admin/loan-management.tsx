"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  DollarSign
} from "lucide-react"

export function LoanManagement() {
  // Mock data - would come from API
  const pendingLoans = [
    {
      id: "1",
      customerName: "John Doe",
      amount: 50000,
      purpose: "Business expansion",
      requestedDate: "2024-01-15",
      riskScore: 75
    },
    {
      id: "2",
      customerName: "Jane Smith",
      amount: 25000,
      purpose: "Home improvement",
      requestedDate: "2024-01-14",
      riskScore: 85
    }
  ]

  const overdueLoans = [
    {
      id: "3",
      customerName: "Bob Johnson",
      amount: 35000,
      overdueDays: 15,
      totalOverdue: 1250
    }
  ]

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Loan Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pending Loan Requests */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Pending Loan Requests</h3>
          {pendingLoans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No pending loan requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{loan.customerName}</p>
                      <p className="text-sm text-gray-600">{loan.purpose}</p>
                      <p className="text-xs text-gray-500 mt-1">Requested: {new Date(loan.requestedDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${loan.amount.toLocaleString()}</p>
                      <Badge 
                        variant="outline"
                        className={`mt-1 ${
                          loan.riskScore >= 80 
                            ? "bg-green-50 text-green-600 border-green-200"
                            : loan.riskScore >= 60
                            ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                            : "bg-red-50 text-red-600 border-red-200"
                        }`}
                      >
                        Risk: {loan.riskScore}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Loan Alerts */}
        {overdueLoans.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Overdue Loan Alerts
            </h3>
            <div className="space-y-3">
              {overdueLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="p-4 border border-red-200 bg-red-50 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-red-900">{loan.customerName}</p>
                      <p className="text-sm text-red-700">Overdue: {loan.overdueDays} days</p>
                      <p className="text-xs text-red-600 mt-1">Total overdue: ${loan.totalOverdue.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-900">${loan.amount.toLocaleString()}</p>
                      <Button size="sm" variant="outline" className="mt-2 border-red-300 text-red-600">
                        Contact Customer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loan Status Summary */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Loan Status Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">12</span>
              </div>
              <p className="text-xs text-gray-500">Active Loans</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-lg font-bold text-gray-900">$450K</span>
              </div>
              <p className="text-xs text-gray-500">Total Outstanding</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-lg font-bold text-gray-900">2</span>
              </div>
              <p className="text-xs text-gray-500">Pending Approval</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

