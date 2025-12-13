"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, MessageSquare, Bell, Plus, Edit, Eye, Trash2 } from "lucide-react"
import { mockTemplates } from "@/lib/mock-data"
import { useState } from "react"

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTemplates = mockTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const typeIcons = {
    email: Mail,
    sms: MessageSquare,
    push: Bell,
  }

  const typeColors = {
    email: "bg-blue-500/10 text-blue-600 border-blue-200",
    sms: "bg-green-500/10 text-green-600 border-green-200",
    push: "bg-purple-500/10 text-purple-600 border-purple-200",
  }

  const categoryColors = {
    transactional: "bg-blue-500",
    marketing: "bg-purple-500",
    alert: "bg-red-500",
    system: "bg-gray-500",
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin", "manager"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Notification Templates</h1>
                <p className="text-muted-foreground">Manage email, SMS, and push notification templates</p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Templates</p>
                    <p className="text-3xl font-bold">{mockTemplates.length}</p>
                  </div>
                  <div className="bg-blue-500/10 text-blue-600 p-3 rounded-lg">
                    <Mail className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email Templates</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {mockTemplates.filter(t => t.type === "email").length}
                    </p>
                  </div>
                  <div className="bg-blue-500/10 text-blue-600 p-3 rounded-lg">
                    <Mail className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">SMS Templates</p>
                    <p className="text-3xl font-bold text-green-600">
                      {mockTemplates.filter(t => t.type === "sms").length}
                    </p>
                  </div>
                  <div className="bg-green-500/10 text-green-600 p-3 rounded-lg">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Templates</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {mockTemplates.filter(t => t.active).length}
                    </p>
                  </div>
                  <div className="bg-purple-500/10 text-purple-600 p-3 rounded-lg">
                    <Bell className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Templates List */}
          <div className="grid grid-cols-1 gap-6">
            {filteredTemplates.map((template) => {
              const Icon = typeIcons[template.type]
              const typeColor = typeColors[template.type]
              const categoryColor = categoryColors[template.category]

              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${typeColor}`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{template.name}</h3>
                              <Badge variant="outline" className={typeColor}>
                                {template.type}
                              </Badge>
                              <Badge className={categoryColor}>
                                {template.category}
                              </Badge>
                              <Badge variant={template.active ? "default" : "secondary"}>
                                {template.active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            {template.subject && (
                              <p className="text-sm text-muted-foreground mb-2">
                                <strong>Subject:</strong> {template.subject}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        {/* Template Body Preview */}
                        <div className="mb-4 p-4 bg-muted rounded-lg">
                          <p className="text-sm font-mono whitespace-pre-wrap line-clamp-3">
                            {template.body}
                          </p>
                        </div>

                        {/* Variables */}
                        {template.variables.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium mb-2">Available Variables:</p>
                            <div className="flex flex-wrap gap-2">
                              {template.variables.map((variable) => (
                                <Badge key={variable} variant="secondary">
                                  {`{{${variable}}}`}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex gap-4">
                            <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                            <span>Updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
                          </div>
                          <Button variant="link" size="sm">
                            View Usage Stats
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

