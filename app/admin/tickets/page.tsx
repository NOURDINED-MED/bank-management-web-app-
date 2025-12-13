"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Ticket, Search, User, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { mockTickets } from "@/lib/mock-data"
import { useState } from "react"
import Link from "next/link"

export default function TicketsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === "all" || ticket.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: mockTickets.length,
    open: mockTickets.filter(t => t.status === "open").length,
    in_progress: mockTickets.filter(t => t.status === "in_progress").length,
    waiting_customer: mockTickets.filter(t => t.status === "waiting_customer").length,
    resolved: mockTickets.filter(t => t.status === "resolved").length,
    closed: mockTickets.filter(t => t.status === "closed").length,
  }

  const statusColors = {
    open: "bg-blue-500/10 text-blue-600 border-blue-200",
    in_progress: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    waiting_customer: "bg-purple-500/10 text-purple-600 border-purple-200",
    resolved: "bg-green-500/10 text-green-600 border-green-200",
    closed: "bg-gray-500/10 text-gray-600 border-gray-200",
  }

  const priorityColors = {
    low: "bg-blue-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    urgent: "bg-red-500",
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin", "manager", "support"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Support Tickets</h1>
            <p className="text-muted-foreground">Manage customer complaints and support requests</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Open Tickets</p>
                    <p className="text-3xl font-bold text-blue-600">{statusCounts.open}</p>
                  </div>
                  <div className="bg-blue-500/10 text-blue-600 p-3 rounded-lg">
                    <Ticket className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-yellow-600">{statusCounts.in_progress}</p>
                  </div>
                  <div className="bg-yellow-500/10 text-yellow-600 p-3 rounded-lg">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Waiting Customer</p>
                    <p className="text-3xl font-bold text-purple-600">{statusCounts.waiting_customer}</p>
                  </div>
                  <div className="bg-purple-500/10 text-purple-600 p-3 rounded-lg">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Resolved</p>
                    <p className="text-3xl font-bold text-green-600">{statusCounts.resolved}</p>
                  </div>
                  <div className="bg-green-500/10 text-green-600 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets by ID, subject, or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <Card>
            <CardHeader>
              <CardTitle>All Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
                  <TabsTrigger value="open">Open ({statusCounts.open})</TabsTrigger>
                  <TabsTrigger value="in_progress">In Progress ({statusCounts.in_progress})</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved ({statusCounts.resolved})</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedStatus} className="space-y-4">
                  {filteredTickets.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No tickets found</p>
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="p-4 border rounded-lg hover:border-accent transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                              <Badge variant="outline" className={statusColors[ticket.status]}>
                                {ticket.status.replace(/_/g, " ")}
                              </Badge>
                              <Badge className={priorityColors[ticket.priority]}>
                                {ticket.priority}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {ticket.description}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Ticket ID</p>
                                <p className="font-medium">{ticket.id}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Customer</p>
                                <p className="font-medium">{ticket.customerName}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Category</p>
                                <p className="font-medium capitalize">{ticket.category}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Created</p>
                                <p className="font-medium">
                                  {new Date(ticket.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button size="sm">View Details</Button>
                            {ticket.status === "open" && (
                              <Button size="sm" variant="outline">
                                Assign to Me
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}

