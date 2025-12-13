"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Repeat, ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface AutoTransfer {
  id: string
  fromAccount: string
  toAccount: string
  amount: number
  frequency: string
  nextTransfer: string
  status: string
}

export default function AutoTransferPage() {
  const { user } = useAuth()
  const [transfers, setTransfers] = useState<AutoTransfer[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    fromAccount: "",
    toAccount: "",
    amount: "",
    frequency: "",
    startDate: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.fromAccount || !formData.toAccount || !formData.amount || !formData.frequency) {
      toast.error("Please fill in all required fields")
      setLoading(false)
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Auto transfer scheduled successfully!")
      setDialogOpen(false)
      setFormData({
        fromAccount: "",
        toAccount: "",
        amount: "",
        frequency: "",
        startDate: ""
      })
    } catch (error) {
      toast.error("Failed to create auto transfer. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this auto transfer?")) return

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success("Auto transfer cancelled successfully")
      setTransfers(transfers.filter(t => t.id !== id))
    } catch (error) {
      toast.error("Failed to cancel auto transfer. Please try again.")
    }
  }

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link href="/customer" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold mb-2">Auto Transfers</h1>
              <p className="text-muted-foreground">
                Set up recurring transfers to automate your finances
              </p>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Auto Transfer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Auto Transfer</DialogTitle>
                  <DialogDescription>
                    Set up a recurring transfer between your accounts
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromAccount">From Account *</Label>
                    <Select
                      value={formData.fromAccount}
                      onValueChange={(value) => setFormData({ ...formData, fromAccount: value })}
                    >
                      <SelectTrigger id="fromAccount">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking Account</SelectItem>
                        <SelectItem value="savings">Savings Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="toAccount">To Account *</Label>
                    <Input
                      id="toAccount"
                      placeholder="Enter recipient account number"
                      value={formData.toAccount}
                      onChange={(e) => setFormData({ ...formData, toAccount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency *</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                    >
                      <SelectTrigger id="frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating..." : "Create Auto Transfer"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {transfers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Repeat className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Auto Transfers</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You don't have any scheduled auto transfers yet. Create one to get started.
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Auto Transfer
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transfers.map((transfer) => (
                <Card key={transfer.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Auto Transfer</CardTitle>
                      <Badge variant={transfer.status === "active" ? "default" : "secondary"}>
                        {transfer.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">From:</span>
                      <span className="font-medium">{transfer.fromAccount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">To:</span>
                      <span className="font-medium">{transfer.toAccount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <span className="font-bold">${transfer.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Frequency:</span>
                      <span className="font-medium capitalize">{transfer.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Next Transfer:</span>
                      <span className="font-medium">{new Date(transfer.nextTransfer).toLocaleDateString()}</span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => handleDelete(transfer.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Cancel Transfer
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}

