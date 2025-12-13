"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, XCircle, Clock, User, Phone, Mail, CreditCard, Calendar, FileText } from "lucide-react"
import type { Customer } from "@/lib/types"

interface CustomerVerificationPanelProps {
  customer: Customer | null
  onClose?: () => void
}

export function CustomerVerificationPanel({ customer, onClose }: CustomerVerificationPanelProps) {
  if (!customer) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Customer Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Select a customer to view verification details</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Customer Verification
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Photo ID Preview Placeholder */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm text-gray-500">Photo ID Preview</p>
          <p className="text-xs text-gray-400 mt-1">Uploaded documents will appear here</p>
        </div>

        {/* Basic Customer Info */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{customer.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">{customer.phone || "N/A"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Account:</span>
                  <span className="font-medium text-gray-900 font-mono">{customer.accountNumber}</span>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Account Type:</span>
                <Badge variant="outline" className="capitalize">
                  {customer.accountType}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Last Login / Last Visit */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Activity</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Last Login:</span>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">Today, 10:30 AM</span>
              </div>
            </div>
            <div>
              <span className="text-gray-600">Last Visit:</span>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">2 days ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Verification Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">KYC Status</span>
              </div>
              <Badge 
                variant={customer.kycStatus === "verified" ? "default" : "secondary"}
                className={customer.kycStatus === "verified" ? "bg-green-500" : ""}
              >
                {customer.kycStatus === "verified" ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 mr-1" />
                    {customer.kycStatus || "Pending"}
                  </>
                )}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Documents</span>
              </div>
              <Badge variant="outline">
                <CheckCircle className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}