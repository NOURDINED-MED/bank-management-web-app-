"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  AlertTriangle,
  Star,
  Edit
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface CustomerOverviewProps {
  accountData?: any
}

export function CustomerOverview({ accountData }: CustomerOverviewProps) {
  const { user } = useAuth()
  
  const customerData = accountData?.user || user
  const riskLevel: "low" | "medium" | "high" = "low" // Would come from API
  const customerRating = 4.5 // Would come from API
  const kycStatus = customerData?.kyc_status || accountData?.user?.kyc_status || "verified"

  return (
    <Card className="border border-gray-200 dark:border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Customer Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Photo & Name */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
            {customerData?.full_name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-foreground">
              {customerData?.full_name || user?.name || "Customer"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-muted-foreground">Customer ID: {customerData?.id?.slice(0, 8) || user?.id?.slice(0, 8) || "N/A"}</p>
          </div>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>

        {/* Contact Information */}
        <div className="space-y-3 border-t border-gray-200 dark:border-border pt-4">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400 dark:text-muted-foreground" />
            <div>
              <p className="text-xs text-gray-500 dark:text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-foreground">{customerData?.email || user?.email || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-400 dark:text-muted-foreground" />
            <div>
              <p className="text-xs text-gray-500 dark:text-muted-foreground">Phone</p>
              <p className="text-sm font-medium text-gray-900 dark:text-foreground">{customerData?.phone || user?.phone || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-gray-400 dark:text-muted-foreground" />
            <div>
              <p className="text-xs text-gray-500 dark:text-muted-foreground">Address</p>
              <p className="text-sm font-medium text-gray-900 dark:text-foreground">123 Main St, City, State 12345</p>
            </div>
          </div>
        </div>

        {/* KYC/Verification Status */}
        <div className="border-t border-gray-200 dark:border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-foreground">KYC/Verification Status</span>
            <Badge 
              variant={kycStatus === "verified" ? "default" : "secondary"}
              className={kycStatus === "verified" ? "bg-green-500 dark:bg-green-600" : "bg-yellow-500 dark:bg-yellow-600"}
            >
              <Shield className="w-3 h-3 mr-1" />
              {kycStatus === "verified" ? "Verified" : "Pending"}
            </Badge>
          </div>
        </div>

        {/* Risk Level Indicator */}
        <div className="border-t border-gray-200 dark:border-border pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-foreground">Risk Level</span>
            <Badge 
              variant="outline"
              className={
                riskLevel === "low"
                  ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                  : riskLevel === "medium"
                  ? "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                  : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
              }
            >
              {(riskLevel as string) === "low" && <Shield className="w-3 h-3 mr-1" />}
              {(riskLevel as string) === "medium" && <AlertTriangle className="w-3 h-3 mr-1" />}
              {(riskLevel as string) === "high" && <AlertTriangle className="w-3 h-3 mr-1" />}
              {riskLevel.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 dark:text-muted-foreground">Based on transaction history and account activity</p>
        </div>

        {/* Customer Rating Score */}
        <div className="border-t border-gray-200 dark:border-border pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-foreground">Customer Rating</span>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 dark:text-yellow-400 fill-yellow-500 dark:fill-yellow-400" />
              <span className="text-lg font-bold text-gray-900 dark:text-foreground">{customerRating}</span>
              <span className="text-sm text-gray-500 dark:text-muted-foreground">/ 5.0</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-muted-foreground">Loyalty & trust score based on account activity</p>
        </div>
      </CardContent>
    </Card>
  )
}