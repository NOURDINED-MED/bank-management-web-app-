"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Building2, LogIn, MessageSquare, History, AlertTriangle, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

interface Interaction {
  id: string
  type: string
  description: string
  date: string
  tellerName?: string
}

interface Note {
  id: string
  content: string
  date: string
  author: string
}

interface Alert {
  id: string
  type: string
  message: string
  date: string
  priority: string
}

export function CustomerActivityInteractions() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState("")
  const [lastBranchVisit, setLastBranchVisit] = useState<string | null>(null)
  const [lastOnlineLogin, setLastOnlineLogin] = useState<string | null>(null)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchActivity()
    }
  }, [user])

  const fetchActivity = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const response = await fetch(`/api/customer/activity?userId=${user.id}`)
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      
      setLastOnlineLogin(data.lastOnlineLogin)
      setLastBranchVisit(data.lastBranchVisit)
      setInteractions(data.interactions || [])
      setAlerts(data.alerts || [])
    } catch (error) {
      console.error('Error fetching activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error("Please enter a note")
      return
    }
    
    const note: Note = {
      id: Date.now().toString(),
      content: newNote,
      date: new Date().toISOString(),
      author: "You"
    }
    
    setNotes([note, ...notes])
    setNewNote("")
    toast.success("Note added (UI only)")
  }

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "branch_visit":
        return <Building2 className="w-4 h-4" />
      case "online_login":
        return <LogIn className="w-4 h-4" />
      case "phone_call":
        return <MessageSquare className="w-4 h-4" />
      default:
        return <History className="w-4 h-4" />
    }
  }

  const getAlertBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500 text-white">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-500 text-white">Medium</Badge>
      default:
        return <Badge className="bg-blue-500 text-white">Low</Badge>
    }
  }

  return (
    <Card className="border border-gray-200 dark:border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Activity & Interactions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Last Visit & Login */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border border-gray-200 dark:border-border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-gray-500 dark:text-muted-foreground">Last Branch Visit</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-foreground">
              {lastBranchVisit ? new Date(lastBranchVisit).toLocaleDateString() : "N/A"}
            </p>
            <p className="text-xs text-gray-500 dark:text-muted-foreground">
              {lastBranchVisit ? new Date(lastBranchVisit).toLocaleTimeString() : "No visits yet"}
            </p>
          </div>
          <div className="p-3 border border-gray-200 dark:border-border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <LogIn className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-gray-500 dark:text-muted-foreground">Last Online Login</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-foreground">
              {lastOnlineLogin ? new Date(lastOnlineLogin).toLocaleDateString() : "N/A"}
            </p>
            <p className="text-xs text-gray-500 dark:text-muted-foreground">
              {lastOnlineLogin ? new Date(lastOnlineLogin).toLocaleTimeString() : "No login yet"}
            </p>
          </div>
        </div>

        {/* Teller Notes */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Teller Notes</h3>
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="p-3 border border-gray-200 dark:border-border rounded-lg">
                <p className="text-sm text-gray-900 dark:text-foreground">{note.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">{note.author}</p>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">{new Date(note.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 space-y-2">
            <Textarea
              placeholder="Add a note about this interaction..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px]"
            />
            <Button onClick={handleAddNote} size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </div>
        </div>

        {/* Interaction History */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Interaction History</h3>
          <div className="space-y-2">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-accent transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  {getInteractionIcon(interaction.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-foreground">{interaction.description}</p>
                  {interaction.tellerName && (
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">{interaction.tellerName}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">
                    {new Date(interaction.date).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flags & Alerts */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Flags & Alerts
          </h3>
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-muted-foreground text-center py-4">No alerts</p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-accent transition-colors">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-foreground">{alert.message}</p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">
                      {new Date(alert.date).toLocaleDateString()}
                    </p>
                  </div>
                  {getAlertBadge(alert.priority)}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
