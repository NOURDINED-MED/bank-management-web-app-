"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  MessageSquare, 
  Send, 
  Mail, 
  Clock,
  User,
  Reply,
  CheckCircle2
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Message {
  id: string
  fromUserId: string
  fromUserName: string
  fromUserEmail: string
  fromUserRole: string
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

interface MessagesInboxProps {
  onUnreadCountChange?: (count: number) => void
}

export function MessagesInbox({ onUnreadCountChange }: MessagesInboxProps = {}) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showReplyDialog, setShowReplyDialog] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user?.id) {
      fetchMessages()
      // Refresh every 30 seconds
      const interval = setInterval(fetchMessages, 30000)
      return () => clearInterval(interval)
    }
  }, [user?.id])

  const fetchMessages = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/messages?userId=${user.id}&type=received&limit=50`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.details || errorData.error || `Server error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        // Check if it's a table missing error
        if (data.error.includes('does not exist') || data.error.includes('42P01') || data.error.includes('schema cache')) {
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
        } else {
          throw new Error(data.details || data.error)
        }
        return
      }
      
      setMessages(data.messages || [])
      const unread = data.unreadCount || data.messages?.filter((m: any) => !m.isRead).length || 0
      setUnreadCount(unread)
      if (onUnreadCountChange) {
        onUnreadCountChange(unread)
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error)
      const errorMsg = error.message || 'Failed to load messages'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isRead: true }
          : msg
      ))
      const newCount = Math.max(0, unreadCount - 1)
      setUnreadCount(newCount)
      if (onUnreadCountChange) {
        onUnreadCountChange(newCount)
      }
    } catch (error: any) {
      console.error('Error marking message as read:', error)
    }
  }

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message)
    if (!message.isRead) {
      handleMarkAsRead(message.id)
    }
  }

  const handleReply = async () => {
    if (!selectedMessage || !user?.id || !replyMessage.trim()) {
      toast.error('Please enter a reply message')
      return
    }

    try {
      setSending(true)
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: user.id,
          toUserId: selectedMessage.fromUserId,
          subject: `Re: ${selectedMessage.subject}`,
          message: replyMessage.trim(),
          category: selectedMessage.category,
          priority: selectedMessage.priority,
          threadId: selectedMessage.threadId || selectedMessage.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.details || errorData.error || `Server error: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.error) {
        throw new Error(data.details || data.error)
      }

      toast.success('Reply sent successfully!')
      setReplyMessage("")
      setShowReplyDialog(false)
      fetchMessages()
    } catch (error: any) {
      console.error('Error sending reply:', error)
      const errorMsg = error.message || 'Failed to send reply'
      toast.error(errorMsg)
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

  const unreadMessages = messages.filter(m => !m.isRead)
  const readMessages = messages.filter(m => m.isRead)

  return (
    <>
      <Card className="border border-gray-200 dark:border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Customer Messages
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} new</Badge>
              )}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={fetchMessages}>
              <Mail className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-500 dark:text-muted-foreground">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-muted-foreground" />
              <p>No messages yet</p>
              <p className="text-xs mt-2">Customer messages will appear here</p>
            </div>
          ) : (
            <>
              {/* Unread Messages */}
              {unreadMessages.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
                    Unread ({unreadMessages.length})
                  </h3>
                  {unreadMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-4 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/30 cursor-pointer transition-colors"
                      onClick={() => handleViewMessage(msg)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-blue-500 text-white">
                              New
                            </Badge>
                            {msg.priority === 'high' && (
                              <Badge variant="destructive">High Priority</Badge>
                            )}
                            <Badge variant="outline">{msg.category}</Badge>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-foreground">{msg.subject}</p>
                          <p className="text-sm text-gray-600 dark:text-muted-foreground mt-1">
                            From: {msg.fromUserName} ({msg.fromUserEmail})
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-muted-foreground line-clamp-2">
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Read Messages */}
              {readMessages.length > 0 && (
                <div className="space-y-3">
                  {unreadMessages.length > 0 && (
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mt-4">
                      Read ({readMessages.length})
                    </h3>
                  )}
                  {readMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-4 border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleViewMessage(msg)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {msg.priority === 'high' && (
                              <Badge variant="destructive">High Priority</Badge>
                            )}
                            <Badge variant="outline">{msg.category}</Badge>
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <p className="font-medium text-gray-900 dark:text-foreground">{msg.subject}</p>
                          <p className="text-sm text-gray-600 dark:text-muted-foreground mt-1">
                            From: {msg.fromUserName} ({msg.fromUserEmail})
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-muted-foreground line-clamp-2">
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Message View Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              From: {selectedMessage?.fromUserName} ({selectedMessage?.fromUserEmail})
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-secondary rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{selectedMessage.category}</Badge>
                  {selectedMessage.priority === 'high' && (
                    <Badge variant="destructive">High Priority</Badge>
                  )}
                  <span className="text-xs text-gray-500 dark:text-muted-foreground">
                    {formatDate(selectedMessage.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-muted-foreground whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowReplyDialog(true)
                  }}
                  className="flex-1"
                >
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {selectedMessage?.fromUserName}</DialogTitle>
            <DialogDescription>
              Subject: {selectedMessage?.subject}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reply">Your Reply</Label>
              <Textarea
                id="reply"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply here..."
                rows={6}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReplyDialog(false)
                  setReplyMessage("")
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReply}
                disabled={sending || !replyMessage.trim()}
                className="flex-1"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

