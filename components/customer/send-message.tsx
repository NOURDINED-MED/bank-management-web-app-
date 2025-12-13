"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Send, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface SendMessageProps {
  customerId: string
  onMessageSent?: () => void
}

export function SendMessage({ customerId, onMessageSent }: SendMessageProps) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [category, setCategory] = useState("general")
  const [priority, setPriority] = useState("normal")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/customer/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          subject: subject.trim(),
          message: message.trim(),
          category,
          priority
        })
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success("Message sent successfully! Admin and teller will respond soon.")
      setSuccess(true)
      setSubject("")
      setMessage("")
      setCategory("general")
      setPriority("normal")
      
      if (onMessageSent) {
        onMessageSent()
      }

      // Reset success state after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      console.error('Error sending message:', error)
      toast.error("Failed to send message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border border-gray-200 dark:border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Send Message to Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 dark:text-foreground mb-2">Message Sent!</p>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">
              Your message has been sent to admin and teller. They will respond soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-gray-900 dark:text-foreground">Subject *</Label>
              <Input
                id="subject"
                placeholder="Enter message subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border-gray-300 dark:border-border"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-900 dark:text-foreground">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-gray-300 dark:border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="account_inquiry">Account Inquiry</SelectItem>
                    <SelectItem value="transaction_issue">Transaction Issue</SelectItem>
                    <SelectItem value="technical_support">Technical Support</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-gray-900 dark:text-foreground">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="border-gray-300 dark:border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-gray-900 dark:text-foreground">Message *</Label>
              <Textarea
                id="message"
                placeholder="Enter your message here. Admin and teller will be able to respond to you."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="border-gray-300 dark:border-border"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading || !subject.trim() || !message.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 dark:text-muted-foreground text-center">
              Your message will be received by both admin and teller staff members
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

