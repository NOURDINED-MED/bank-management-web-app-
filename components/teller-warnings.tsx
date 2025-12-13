"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Ban, Activity, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Customer } from "@/lib/types"

interface TellerWarningsProps {
  customer: Customer
  onDismiss?: () => void
}

export function TellerWarnings({ customer, onDismiss }: TellerWarningsProps) {
  const warnings = []

  // Check for frozen account
  if (customer.status === "inactive" || customer.status === "suspended") {
    warnings.push({
      type: "frozen",
      severity: "critical",
      title: "Account Frozen",
      message: `This account is currently ${customer.status}. No transactions can be processed.`,
      icon: Ban
    })
  }

  // Check for suspicious activity (fraud flags)
  if (customer.fraudFlags && customer.fraudFlags.length > 0) {
    warnings.push({
      type: "suspicious",
      severity: "high",
      title: "Suspicious Activity Detected",
      message: `This account has been flagged: ${customer.fraudFlags.join(", ")}. Verify customer identity before proceeding.`,
      icon: AlertTriangle
    })
  }

  // Check for low balance
  if (customer.balance < 100) {
    warnings.push({
      type: "low_balance",
      severity: "low",
      title: "Low Balance Alert",
      message: `Account balance is ${customer.balance < 0 ? 'negative' : 'very low'} ($${customer.balance.toLocaleString()}). Customer may have insufficient funds for transactions.`,
      icon: Wallet
    })
  }

  // Check for high risk score
  if (customer.riskScore && customer.riskScore > 70) {
    warnings.push({
      type: "high_risk",
      severity: "medium",
      title: "High Risk Customer",
      message: `Risk score: ${customer.riskScore}/100. Exercise additional caution and verification.`,
      icon: Activity
    })
  }

  // Check for pending KYC
  if (customer.kycStatus === "pending") {
    warnings.push({
      type: "kyc_pending",
      severity: "medium",
      title: "KYC Verification Pending",
      message: "Customer KYC verification is pending. Some services may be restricted.",
      icon: AlertTriangle
    })
  }

  // Check for rejected KYC
  if (customer.kycStatus === "rejected") {
    warnings.push({
      type: "kyc_rejected",
      severity: "high",
      title: "KYC Verification Rejected",
      message: "Customer KYC verification was rejected. Account has limited functionality.",
      icon: Ban
    })
  }

  if (warnings.length === 0) return null

  const severityColors = {
    critical: "border-red-500 bg-red-50 dark:bg-red-950",
    high: "border-orange-500 bg-orange-50 dark:bg-orange-950",
    medium: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950",
    low: "border-blue-500 bg-blue-50 dark:bg-blue-950"
  }

  const severityTextColors = {
    critical: "text-red-600",
    high: "text-orange-600",
    medium: "text-yellow-600",
    low: "text-blue-600"
  }

  return (
    <div className="space-y-3">
      {warnings.map((warning, index) => {
        const Icon = warning.icon
        return (
          <Alert
            key={index}
            className={`${severityColors[warning.severity as keyof typeof severityColors]} border-l-4`}
          >
            <Icon className={`h-5 w-5 ${severityTextColors[warning.severity as keyof typeof severityTextColors]}`} />
            <AlertTitle className="flex items-center gap-2">
              {warning.title}
              <Badge variant={warning.severity === "critical" || warning.severity === "high" ? "destructive" : "default"}>
                {warning.severity.toUpperCase()}
              </Badge>
            </AlertTitle>
            <AlertDescription className="mt-2">
              {warning.message}
              {onDismiss && (
                <Button
                  variant="link"
                  size="sm"
                  className="ml-2 p-0 h-auto"
                  onClick={onDismiss}
                >
                  Dismiss
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )
      })}
    </div>
  )
}

