"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Key, Plus, Copy, Eye, EyeOff, Trash2, Activity } from "lucide-react"
import { mockAPIKeys } from "@/lib/mock-data"
import { useState } from "react"

export default function APIKeysPage() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Show toast notification in real app
  }

  const activeKeys = mockAPIKeys.filter(k => k.status === "active").length
  const totalUsage = mockAPIKeys.reduce((sum, k) => sum + k.usageCount, 0)

  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">API Key Management</h1>
                <p className="text-muted-foreground">Manage API keys, permissions, and monitor usage</p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create New Key
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Keys</p>
                    <p className="text-3xl font-bold text-green-600">{activeKeys}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {mockAPIKeys.length - activeKeys} inactive
                    </p>
                  </div>
                  <div className="bg-green-500/10 text-green-600 p-3 rounded-lg">
                    <Key className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total API Calls</p>
                    <p className="text-3xl font-bold text-blue-600">{totalUsage.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Across all keys</p>
                  </div>
                  <div className="bg-blue-500/10 text-blue-600 p-3 rounded-lg">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Rate Limit Total</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {mockAPIKeys.reduce((sum, k) => sum + k.rateLimit, 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Requests per minute</p>
                  </div>
                  <div className="bg-purple-500/10 text-purple-600 p-3 rounded-lg">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Keys List */}
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAPIKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="p-6 border rounded-lg hover:border-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{apiKey.name}</h3>
                          <Badge
                            variant={apiKey.status === "active" ? "default" : "secondary"}
                            className={apiKey.status === "active" ? "bg-green-500" : ""}
                          >
                            {apiKey.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{apiKey.description}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {showKeys[apiKey.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button variant="outline" size="icon">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* API Key Display */}
                    <div className="mb-4 p-3 bg-muted rounded-lg flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono">
                        {showKeys[apiKey.id] ? apiKey.key : "••••••••••••••••••••"}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Permissions */}
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-2">
                        {apiKey.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-medium">
                          {new Date(apiKey.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Used</p>
                        <p className="font-medium">
                          {apiKey.lastUsed
                            ? new Date(apiKey.lastUsed).toLocaleDateString()
                            : "Never"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Calls</p>
                        <p className="font-medium">{apiKey.usageCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rate Limit</p>
                        <p className="font-medium">{apiKey.rateLimit}/min</p>
                      </div>
                    </div>

                    {apiKey.expiresAt && (
                      <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950 rounded text-sm text-yellow-600">
                        Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}

