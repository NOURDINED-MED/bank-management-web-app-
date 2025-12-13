"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import type { InternalMessage } from "@/lib/types"

interface InternalMessagesProps {
  messages: InternalMessage[]
  currentUserId: string
  onSendMessage?: (subject: string, message: string) => void
  onMarkAsRead?: (messageId: string) => void
}

const priorityConfig = {
  low: { color: "bg-blue-500", label: "Low" },
  normal: { color: "bg-gray-500", label: "Normal" },
  high: { color: "bg-orange-500", label: "High" },
  urgent: { color: "bg-red-500 animate-pulse", label: "Urgent" }
}

const categoryIcons = {
  general: MessageSquare,
  transaction_query: AlertCircle,
  technical_issue: AlertCircle,
  approval_request: CheckCircle2,
  alert: AlertCircle
}

export function InternalMessages({ 
  messages, 
  currentUserId,
  onSendMessage,
  onMarkAsRead 
}: InternalMessagesProps) {
  const [showCompose, setShowCompose] = useState(false)
  const [subject, setSubject] = useState("")
  const [messageText, setMessageText] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<InternalMessage | null>(null)

  const unreadCount = messages.filter(m => !m.read && m.toId === currentUserId).length

  const handleSend = () => {
    if (subject.trim() && messageText.trim()) {
      onSendMessage?.(subject, messageText)
      setSubject("")
      setMessageText("")
      setShowCompose(false)
    }
  }

  const handleSelectMessage = (message: InternalMessage) => {
    setSelectedMessage(message)
    if (!message.read && message.toId === currentUserId) {
      onMarkAsRead?.(message.id)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Internal Messages
          </CardTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge className="bg-red-500">{unreadCount} Unread</Badge>
            )}
            <Button size="sm" onClick={() => setShowCompose(!showCompose)}>
              <Send className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showCompose && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-semibold mb-3">Compose Message</h4>
            <div className="space-y-3">
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <Textarea
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={handleSend} disabled={!subject.trim() || !messageText.trim()}>
                  Send Message
                </Button>
                <Button variant="outline" onClick={() => setShowCompose(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Messages List */}
          <div>
            <h4 className="font-semibold mb-3">Inbox</h4>
            <ScrollArea className="h-[400px]">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No messages</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((message) => {
                      const priority = priorityConfig[message.priority]
                      const CategoryIcon = categoryIcons[message.category]
                      const isSelected = selectedMessage?.id === message.id

                      return (
                        <div
                          key={message.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            !message.read && message.toId === currentUserId
                              ? "bg-blue-50 dark:bg-blue-950 border-blue-200"
                              : "hover:bg-accent"
                          } ${isSelected ? "ring-2 ring-primary" : ""}`}
                          onClick={() => handleSelectMessage(message)}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <CategoryIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <h5 className="font-semibold text-sm truncate">{message.subject}</h5>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                From: {message.fromName} ({message.fromRole})
                              </p>
                              <p className="text-sm line-clamp-2 mb-2">{message.message}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={priority.color}>
                                  {priority.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(message.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            {!message.read && message.toId === currentUserId && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Message Detail */}
          <div>
            <h4 className="font-semibold mb-3">Message Details</h4>
            {selectedMessage ? (
              <div className="border rounded-lg p-4 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={priorityConfig[selectedMessage.priority].color}>
                      {priorityConfig[selectedMessage.priority].label}
                    </Badge>
                    <Badge variant="outline">{selectedMessage.category.replace(/_/g, " ")}</Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{selectedMessage.subject}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">From:</span>
                    <p className="font-medium">{selectedMessage.fromName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{selectedMessage.fromRole}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">To:</span>
                    <p className="font-medium">{selectedMessage.toName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{selectedMessage.toRole}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Time:</span>
                    <p className="font-medium">{new Date(selectedMessage.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm">
                    <Send className="w-3 h-3 mr-2" />
                    Reply
                  </Button>
                  <Button size="sm" variant="outline">
                    Forward
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-8 text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

