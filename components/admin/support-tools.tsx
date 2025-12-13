"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Ticket, 
  FileText, 
  MessageSquare, 
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Download
} from "lucide-react"
import { MessagesInbox } from "@/components/admin/messages-inbox"

export function SupportTools() {
  // Mock data - would come from API
  const customerTickets = [
    {
      id: "TKT-001",
      subject: "Account access issue",
      customer: "John Doe",
      status: "open",
      priority: "high",
      created: "2 hours ago"
    },
    {
      id: "TKT-002",
      subject: "Transaction inquiry",
      customer: "Jane Smith",
      status: "in_progress",
      priority: "medium",
      created: "5 hours ago"
    }
  ]

  const tellerRequests = [
    {
      id: "REQ-001",
      subject: "Cash drawer reconciliation",
      teller: "Teller 1",
      status: "pending",
      created: "1 hour ago"
    }
  ]

  return (
    <Card className="border border-gray-200 dark:border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Support Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="messages">Customer Messages</TabsTrigger>
            <TabsTrigger value="customer">Support Tickets</TabsTrigger>
            <TabsTrigger value="teller">Teller Requests</TabsTrigger>
            <TabsTrigger value="documents">Document Review</TabsTrigger>
            <TabsTrigger value="announcements">Branch Announcements</TabsTrigger>
          </TabsList>

          {/* Customer Messages - Real Data */}
          <TabsContent value="messages" className="space-y-4">
            <MessagesInbox />
          </TabsContent>

          {/* Customer Support Tickets */}
          <TabsContent value="customer" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                {customerTickets.length} open ticket(s)
              </p>
              <Button size="sm">
                <Ticket className="w-4 h-4 mr-2" />
                Create Ticket
              </Button>
            </div>
            <div className="space-y-3">
              {customerTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-accent"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-foreground">{ticket.subject}</p>
                        <Badge 
                          variant={ticket.status === "open" ? "default" : "secondary"}
                          className={
                            ticket.status === "open" 
                              ? "bg-blue-500 dark:bg-blue-600" 
                              : ticket.status === "in_progress"
                              ? "bg-yellow-500 dark:bg-yellow-600"
                              : ""
                          }
                        >
                          {ticket.status === "in_progress" ? "In Progress" : ticket.status}
                        </Badge>
                        {ticket.priority === "high" && (
                          <Badge variant="destructive">High Priority</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">Customer: {ticket.customer}</p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">Created: {ticket.created}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Teller Support Requests */}
          <TabsContent value="teller" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                {tellerRequests.length} pending request(s)
              </p>
            </div>
            <div className="space-y-3">
              {tellerRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-accent"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-foreground">{request.subject}</p>
                        <Badge variant="secondary" className="bg-yellow-500 dark:bg-yellow-600">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">From: {request.teller}</p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">Created: {request.created}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Document Upload Review */}
          <TabsContent value="documents" className="space-y-4">
            <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-muted-foreground" />
              <p>Document upload review system</p>
              <p className="text-xs mt-2">Pending documents will appear here</p>
            </div>
          </TabsContent>

          {/* Branch Announcements */}
          <TabsContent value="announcements" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-muted-foreground">Manage branch announcements</p>
              <Button size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
            </div>
            <div className="space-y-3">
              {[
                {
                  id: "1",
                  title: "System Maintenance",
                  message: "Online banking will be unavailable tonight from 11 PM - 1 AM",
                  status: "active",
                  created: "Today"
                },
                {
                  id: "2",
                  title: "New Policy",
                  message: "Daily withdrawal limit increased to $10,000",
                  status: "active",
                  created: "2 days ago"
                }
              ].map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-4 border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-accent"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-foreground">{announcement.title}</p>
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                          {announcement.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">{announcement.message}</p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">Created: {announcement.created}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
