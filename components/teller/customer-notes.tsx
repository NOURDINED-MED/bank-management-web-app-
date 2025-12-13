"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Flag, Clock, User } from "lucide-react"
import type { Customer } from "@/lib/types"

interface CustomerNotesProps {
  customer: Customer | null
  onAddNote?: (note: string, flagged: boolean) => void
}

interface Note {
  id: string
  text: string
  timestamp: string
  tellerName: string
  flagged: boolean
}

export function CustomerNotes({ customer, onAddNote }: CustomerNotesProps) {
  const [newNote, setNewNote] = useState("")
  const [flagged, setFlagged] = useState(false)
  const [notes] = useState<Note[]>([]) // Would come from API

  const handleAddNote = () => {
    if (!newNote.trim() || !customer) return

    const note: Note = {
      id: Date.now().toString(),
      text: newNote,
      timestamp: new Date().toISOString(),
      tellerName: "Current Teller",
      flagged: flagged
    }

    onAddNote?.(newNote, flagged)
    setNewNote("")
    setFlagged(false)
  }

  if (!customer) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Notes & Interaction Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Select a customer to view notes</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Notes & Interaction Log
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note Form */}
        <div className="space-y-3">
          <Textarea
            placeholder="Add a note about this interaction..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={flagged}
                onChange={(e) => setFlagged(e.target.checked)}
                className="w-4 h-4"
              />
              <Flag className="w-4 h-4 text-red-600" />
              <span className="text-gray-700">Flag for suspicious activity</span>
            </label>
            <Button onClick={handleAddNote} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Past Notes</h3>
          {notes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No notes yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg border ${
                    note.flagged ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-900">{note.tellerName}</span>
                      {note.flagged && (
                        <Badge variant="destructive" className="text-xs">
                          <Flag className="w-3 h-3 mr-1" />
                          Flagged
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {new Date(note.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{note.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

