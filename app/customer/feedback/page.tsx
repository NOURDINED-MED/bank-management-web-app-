"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Star, Send, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function CustomerFeedbackPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [rating, setRating] = useState(0)
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.category || !formData.subject || !formData.message) {
        toast.error("Please fill in all required fields")
        return
      }

      if (rating === 0) {
        toast.error("Please provide a rating")
        return
      }

      // Here you would typically send the feedback to your backend
      console.log("Feedback submitted:", {
        ...formData,
        rating,
        timestamp: new Date().toISOString(),
      })

      toast.success("Thank you for your feedback! We'll review it and get back to you if needed.")
      router.push("/customer")
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const feedbackCategories = [
    { value: "app-experience", label: "App Experience" },
    { value: "transaction-issues", label: "Transaction Issues" },
    { value: "account-services", label: "Account Services" },
    { value: "customer-support", label: "Customer Support" },
    { value: "security", label: "Security & Privacy" },
    { value: "features", label: "Feature Requests" },
    { value: "other", label: "Other" },
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
            <h1 className="text-4xl font-bold text-balance">Share Your Feedback</h1>
            <p className="text-muted-foreground mt-2">Help us improve by sharing your thoughts and suggestions</p>
          </div>

          <div className="max-w-2xl">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  How would you rate your experience?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 rounded transition-colors ${
                        star <= rating ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
                      }`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {rating > 0 && `${rating} star${rating > 1 ? "s" : ""}`}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tell us more</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {feedbackCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <input
                      id="subject"
                      type="text"
                      placeholder="Brief summary of your feedback"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide detailed feedback..."
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>Submitting...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>What happens next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>• Your feedback will be reviewed by our team within 24-48 hours</p>
                  <p>• We'll use your input to improve our services and user experience</p>
                  <p>• For urgent issues, please contact customer support directly</p>
                  <p>• You may receive a follow-up email if we need more information</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
