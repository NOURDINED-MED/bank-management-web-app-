"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Flag, Clock, User } from "lucide-react"
import type { Customer } from "@/lib/types"

interface InteractionNote {
  id: string
  note: string
  tellerName: string
  timestamp: string
  flagged: boolean
}

interface NotesInteractionLogProps {
  customer: Customer | null
  notes?: InteractionNote[]
  onAddNote?: (note: string, flagged: boolean) => void
}

export function NotesInteractionLog({ 
  customer, 
  notes = [],
  onAddNote 
}: NotesInteractionLogProps) {
  const [newNote, setNewNote] = useState("")
  const [isFlagged, setIsFlagged] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // Mock notes if none provided
  const displayNotes = notes.length > 0 ? notes : []

  const handleAddNote = () => {
    if (!newNote.trim() || !customer) return
    
    onAddNote?.(newNote, isFlagged)
    setNewNote("")
    setIsFlagged(false)
    setIsAdding(false)
  }

  if (!customer) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
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
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Notes & Interaction Log
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note Section */}
        <div className="space-y-3">
          {!isAdding ? (
            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          ) : (
            <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <Textarea
                placeholder="Enter note about this interaction..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="flag"
                  checked={isFlagged}
                  onChange={(e) => setIsFlagged(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="flag" className="text-xs text-gray-700 flex items-center gap-1">
                  <Flag className="w-3 h-3 text-red-600" />
                  Flag for suspicious activity
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="flex-1"
                >
                  Save Note
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false)
                    setNewNote("")
                    setIsFlagged(false)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Notes List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {displayNotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No notes yet</p>
              <p className="text-xs text-gray-400 mt-1">Add a note to track interactions</p>
            </div>
          ) : (
            displayNotes.map((note) => (
              <div
                key={note.id}
                className={`p-3 rounded-lg border ${
                  note.flagged
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
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
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(note.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.note}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
