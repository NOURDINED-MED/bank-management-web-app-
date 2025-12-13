"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { FraudDetectionPanel } from "@/components/fraud-detection-panel"
import { mockFraudAlerts } from "@/lib/mock-data"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function FraudDetectionPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin", "manager", "auditor"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/admin">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-2">Fraud Detection & Prevention</h1>
            <p className="text-muted-foreground">
              Real-time fraud monitoring with AI-powered anomaly detection
            </p>
          </div>

          <FraudDetectionPanel alerts={mockFraudAlerts} />
        </main>
      </div>
    </ProtectedRoute>
  )
}

