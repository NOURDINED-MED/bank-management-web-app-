"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Download, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

interface Document {
  id: string
  name: string
  type: string
  uploadDate: string
  expirationDate?: string
  status: "verified" | "pending" | "expired"
}

export function DocumentsKYC() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchDocuments()
    }
  }, [user])

  const fetchDocuments = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const response = await fetch(`/api/customer/documents?userId=${user.id}`)
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>
      case "pending":
        return <Badge className="bg-yellow-500 text-white"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case "expired":
        return <Badge className="bg-red-500 text-white"><AlertCircle className="w-3 h-3 mr-1" />Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "id":
        return "ID Document"
      case "address":
        return "Proof of Address"
      case "contract":
        return "Contract / Agreement"
      case "financial":
        return "Financial Document"
      default:
        return type
    }
  }

  const handleDownload = (docId: string) => {
    toast.success("Document download started (UI only)")
  }

  const handleUpload = () => {
    toast.info("Document upload feature coming soon (UI only)")
  }

  const isExpiringSoon = (expirationDate?: string) => {
    if (!expirationDate) return false
    const expDate = new Date(expirationDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  return (
    <Card className="border border-gray-200 dark:border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Documents & KYC
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Uploaded Documents */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Uploaded Documents</h3>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-500 dark:text-muted-foreground text-center py-4">Loading documents...</p>
            ) : documents.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-muted-foreground text-center py-4">No documents uploaded</p>
            ) : (
              documents.map((doc) => (
              <div 
                key={doc.id} 
                className={`p-4 border rounded-lg ${
                  isExpiringSoon(doc.expirationDate) 
                    ? "border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/30" 
                    : "border-gray-200 dark:border-border"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-semibold text-gray-900 dark:text-foreground">{doc.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">{getDocumentTypeLabel(doc.type)}</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">
                      Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                    {doc.expirationDate && (
                      <p className={`text-xs mt-1 ${
                        isExpiringSoon(doc.expirationDate) 
                          ? "text-yellow-600 dark:text-yellow-400 font-semibold" 
                          : "text-gray-500 dark:text-muted-foreground"
                      }`}>
                        Expires: {new Date(doc.expirationDate).toLocaleDateString()}
                        {isExpiringSoon(doc.expirationDate) && " (Expiring soon!)"}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(doc.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc.id)}
                      className="text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>

        {/* Verification Status */}
        <div className="pt-4 border-t border-gray-200 dark:border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-foreground">KYC Verification Status</span>
            <Badge className="bg-green-500 dark:bg-green-600 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
          <p className="text-xs text-gray-500 dark:text-muted-foreground">
            All required documents have been verified and approved.
          </p>
        </div>

        {/* Upload New Document */}
        <div className="pt-4 border-t border-gray-200 dark:border-border">
          <Button variant="outline" onClick={handleUpload} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Upload New Document (UI only)
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
