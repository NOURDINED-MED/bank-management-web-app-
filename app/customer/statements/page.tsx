"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Download, ArrowLeft, FileText, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

export default function StatementsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("current-month")
  const [selectedFormat, setSelectedFormat] = useState("pdf")

  const handleDownload = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("Statement downloaded successfully!")
    } catch (error) {
      toast.error("Failed to download statement. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const statements = [
    { period: "January 2024", format: "PDF", date: "2024-01-31" },
    { period: "December 2023", format: "PDF", date: "2023-12-31" },
    { period: "November 2023", format: "PDF", date: "2023-11-30" },
    { period: "October 2023", format: "PDF", date: "2023-10-31" },
  ]

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/customer" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold mb-2">Account Statements</h1>
            <p className="text-muted-foreground">
              Download your account statements in PDF or CSV format
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Download Statement</CardTitle>
                  <CardDescription>
                    Generate and download your account statement for a specific period
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Period</label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current-month">Current Month</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                        <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                        <SelectItem value="this-year">This Year</SelectItem>
                        <SelectItem value="last-year">Last Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">File Format</label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleDownload} 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Statement
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recent Statements</CardTitle>
                  <CardDescription>
                    Previously generated account statements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statements.map((statement, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{statement.period}</p>
                            <p className="text-sm text-muted-foreground">
                              Generated on {new Date(statement.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Statement Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">What's Included</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Account transactions</li>
                      <li>Deposits and withdrawals</li>
                      <li>Transfers</li>
                      <li>Account balance history</li>
                      <li>Fees and charges</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Formats Available</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>PDF - For viewing and printing</li>
                      <li>CSV - For spreadsheet analysis</li>
                      <li>Excel - For advanced analysis</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Note</h4>
                    <p className="text-sm text-muted-foreground">
                      Statements are generated instantly and available for download. Historical statements are stored for up to 7 years.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

