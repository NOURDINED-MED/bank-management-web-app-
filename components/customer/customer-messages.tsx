"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Send, 
  MessageSquare, 
  Mail, 
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Message {
  id: string
  fromUserId: string
  fromUserName: string
  toUserId: string | null
  toUserName: string
  subject: string
  message: string
  isRead: boolean
  threadId: string | null
  priority: string
  category: string
  createdAt: string
}

export function CustomerMessages() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showCompose, setShowCompose] = useState(false)
  
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [category, setCategory] = useState("general")
  const [priority, setPriority] = useState("normal")

  useEffect(() => {
    if (user?.id) {
      fetchMessages()
    }
  }, [user?.id])

  const fetchMessages = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/messages?userId=${user.id}&type=all&limit=20`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.details || errorData.error || `Server error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        // Check if it's a table missing error
        if (data.error.includes('Messages table not found') || data.error.includes('does not exist') || data.error.includes('42P01') || data.setupUrl) {
          toast.error(
            <div>
              Messages table not found. 
              <a 
                href={data?.setupUrl || "/setup-messages"}
                className="underline ml-1 font-semibold"
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = data?.setupUrl || '/setup-messages'
                }}
              >
                Click here to set it up
              </a>
            </div>,
            { duration: 10000 }
          )
          return
        } else {
          throw new Error(data.details || data.error)
        }
      }
      
      setMessages(data.messages || [])
    } catch (error: any) {
      console.error('Error fetching messages:', error)
      toast.error(error.message || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id || !message.trim()) {
      toast.error('Please enter a message')
      return
    }

    try {
      setSending(true)
      
      // Validate inputs
      if (!user?.id) {
        toast.error('You must be logged in to send messages')
        return
      }
      
      // Log what we're sending for debugging
      console.log('📤 Sending message:', {
        fromUserId: user.id,
        userEmail: user.email,
        userName: user.name,
        subject: subject.trim() || 'Customer Inquiry',
        messageLength: message.trim().length
      })
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: user.id,
          toUserId: null, // Send to all admins/tellers (null = visible to all staff)
          subject: subject.trim() || 'Customer Inquiry',
          message: message.trim(),
          category,
          priority
        })
      })

      // Parse response
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        throw new Error(`Server returned invalid response (status ${response.status})`)
      }

      // Check for errors
      if (!response.ok) {
        const errorMsg = data?.details || data?.error || `Server error: ${response.status}`
        
        // If it's a table missing error, provide helpful message
        if (data?.setupUrl || errorMsg.includes('Messages table not found') || errorMsg.includes('does not exist')) {
          toast.error(
            <div>
              Messages table not found. 
              <a 
                href={data?.setupUrl || "/setup-messages"}
                className="underline ml-1 font-semibold"
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = data?.setupUrl || '/setup-messages'
                }}
              >
                Click here to set it up
              </a>
            </div>,
            { duration: 10000 }
          )
          return
        }
        
        throw new Error(errorMsg)
      }
      
      if (data.error) {
        // If it's a table missing error, provide helpful message
        if (data?.setupUrl || data.error.includes('Messages table not found') || data.details?.includes('does not exist')) {
          toast.error(
            <div>
              Messages table not found. 
              <a 
                href={data?.setupUrl || "/setup-messages"}
                className="underline ml-1 font-semibold"
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = data?.setupUrl || '/setup-messages'
                }}
              >
                Click here to set it up
              </a>
            </div>,
            { duration: 10000 }
          )
          return
        }
        
        throw new Error(data.details || data.error)
      }
      
      // Success
      if (data.success || data.message) {
      toast.success('Message sent successfully!')
      setSubject("")
      setMessage("")
      setShowCompose(false)
      fetchMessages()
      } else {
        throw new Error(data.error || 'Unknown error occurred')
      }
    } catch (error: any) {
      console.error('❌ Error sending message:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      })
      
      const errorMessage = error.message || 'Failed to send message'
      
      // Show more helpful error messages
      if (errorMessage.includes('Messages table not found') || errorMessage.includes('42P01') || errorMessage.includes('schema cache')) {
        toast.error(
          <div>
            Messages table not found. 
            <a 
              href="/setup-messages" 
              className="underline ml-1 font-semibold"
              onClick={(e) => {
                e.preventDefault()
                window.location.href = '/setup-messages'
              }}
            >
              Click here to set it up
            </a>
          </div>,
          { duration: 10000 }
        )
      } else if (errorMessage.includes('Sender not found')) {
        toast.error(
          <div>
            {errorMessage}
            <br />
            <span className="text-sm">Please try logging out and back in.</span>
          </div>,
          { duration: 8000 }
        )
      } else {
        // Show the actual error message with more details
        toast.error(
          <div>
            <strong>Failed to send message:</strong>
            <br />
            <span className="text-sm">{errorMessage}</span>
            <br />
            <span className="text-xs text-gray-500 mt-1">Check the browser console for more details.</span>
          </div>,
          { duration: 10000 }
        )
      }
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days === 0 && hours < 1) {
      return 'Just now'
    } else if (days === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return `${days} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <Card className="border border-gray-200 dark:border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Messages
          </CardTitle>
          <Button 
            size="sm" 
            onClick={() => setShowCompose(!showCompose)}
            variant={showCompose ? "outline" : "default"}
          >
            <Mail className="w-4 h-4 mr-2" />
            {showCompose ? 'Cancel' : 'New Message'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compose Message Form */}
        {showCompose && (
          <div className="p-4 border border-gray-200 dark:border-border rounded-lg bg-gray-50 dark:bg-secondary">
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-foreground">
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What is your message about?"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-foreground">
                  Category
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground"
                >
                  <option value="general">General Inquiry</option>
                  <option value="account">Account Issue</option>
                  <option value="transaction">Transaction Question</option>
                  <option value="card">Card Issue</option>
                  <option value="technical">Technical Support</option>
                  <option value="complaint">Complaint</option>
                </select>
              </div>

              <div>
                <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-foreground">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  required
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={sending || !message.trim()}>
                  {sending ? (
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
              </div>
            </form>
          </div>
        )}

        {/* Messages List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-500 dark:text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-muted-foreground" />
            <p>No messages yet</p>
            <p className="text-xs mt-2">Send a message to get support from our team</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isSent = msg.fromUserId === user?.id
              const isThread = msg.threadId !== null

              return (
                <div
                  key={msg.id}
                  className={`p-4 border rounded-lg ${
                    isSent
                      ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-gray-200 dark:border-border bg-white dark:bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isSent ? (
                          <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            Sent
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                            Received
                          </Badge>
                        )}
                        {isThread && (
                          <Badge variant="outline" className="text-xs">
                            Reply
                          </Badge>
                        )}
                        {msg.priority === 'high' && (
                          <Badge variant="destructive">High Priority</Badge>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 dark:text-foreground">{msg.subject}</p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">
                        {isSent ? `To: ${msg.toUserName}` : `From: ${msg.fromUserName}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isSent && !msg.isRead && (
                        <Badge variant="outline" className="bg-blue-500 text-white">
                          New
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500 dark:text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-muted-foreground mt-2">{msg.message}</p>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

