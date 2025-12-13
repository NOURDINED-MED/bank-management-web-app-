"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { FileText, ArrowLeft, Download, Eye, Calendar, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface Document {
  id: string
  name: string
  type: string
  category: string
  date: string
  size: string
  status: string
}

export default function DocumentsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const documents: Document[] = [
    {
      id: "1",
      name: "Account Statement - January 2024",
      type: "PDF",
      category: "statements",
      date: "2024-01-31",
      size: "2.4 MB",
      status: "verified"
    },
    {
      id: "2",
      name: "Tax Document - 2023",
      type: "PDF",
      category: "tax",
      date: "2024-01-15",
      size: "1.8 MB",
      status: "verified"
    },
    {
      id: "3",
      name: "Loan Agreement",
      type: "PDF",
      category: "loans",
      date: "2023-11-20",
      size: "3.2 MB",
      status: "verified"
    },
    {
      id: "4",
      name: "ID Verification Document",
      type: "PDF",
      category: "kyc",
      date: "2023-10-05",
      size: "1.2 MB",
      status: "verified"
    },
  ]

  const categories = [
    { id: "all", label: "All Documents" },
    { id: "statements", label: "Statements" },
    { id: "tax", label: "Tax Documents" },
    { id: "loans", label: "Loan Documents" },
    { id: "kyc", label: "KYC Documents" },
  ]

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleDownload = (documentId: string) => {
    toast.success("Document download started")
  }

  const handleView = (documentId: string) => {
    toast.info("Opening document viewer...")
  }

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
            <h1 className="text-4xl font-bold mb-2">My Documents</h1>
            <p className="text-muted-foreground">
              View and download all your account documents
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Library</CardTitle>
                <CardDescription>
                  All your important documents in one place
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <Folder className="w-4 h-4 mr-2" />
                        {category.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Documents Found</h3>
                  <p className="text-muted-foreground text-center">
                    {searchQuery
                      ? "No documents match your search criteria."
                      : "You don't have any documents yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((document) => (
                  <Card key={document.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <Badge variant={document.status === "verified" ? "default" : "secondary"}>
                          {document.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-4 line-clamp-2">
                        {document.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(document.date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">{document.type}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Size:</span>
                        <span className="font-medium">{document.size}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleView(document.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDownload(document.id)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

