"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  FileText,
  Plus,
  AlertTriangle,
  Clock,
  User
} from "lucide-react"
import type { Customer } from "@/lib/types"

interface CustomerNote {
  id: string
  content: string
  type: "note" | "flag"
  createdAt: string
  createdBy: string
}

interface CustomerNotesLogProps {
  customer: Customer | null
  onAddNote?: (note: string, type: "note" | "flag") => void
}

export function CustomerNotesLog({ 
  customer,
  onAddNote 
}: CustomerNotesLogProps) {
  const [notes, setNotes] = useState<CustomerNote[]>([])
  const [newNote, setNewNote] = useState("")
  const [noteType, setNoteType] = useState<"note" | "flag">("note")
  const [showAddForm, setShowAddForm] = useState(false)

  if (!customer) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="py-12 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Select a customer to view notes</p>
        </CardContent>
      </Card>
    )
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return

    const note: CustomerNote = {
      id: Date.now().toString(),
      content: newNote,
      type: noteType,
      createdAt: new Date().toISOString(),
      createdBy: "Current Teller" // TODO: Get from auth
    }

    setNotes([note, ...notes])
    onAddNote?.(newNote, noteType)
    setNewNote("")
    setShowAddForm(false)
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Notes & Interaction Log
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note Form */}
        {showAddForm && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Note Type</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={noteType === "note" ? "default" : "outline"}
                  onClick={() => setNoteType("note")}
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Note
                </Button>
                <Button
                  size="sm"
                  variant={noteType === "flag" ? "default" : "outline"}
                  onClick={() => setNoteType("flag")}
                  className="flex-1"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Flag
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="Enter note or flag reason..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setNewNote("")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddNote}
                className="flex-1"
              >
                Add Note
              </Button>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notes yet</p>
              <p className="text-xs mt-1">Add a note or flag to track interactions</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`p-3 rounded-lg border ${
                  note.type === "flag" 
                    ? "bg-red-50 border-red-200" 
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {note.type === "flag" ? (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-gray-400" />
                    )}
                    <Badge 
                      variant={note.type === "flag" ? "destructive" : "outline"}
                      className="text-xs"
                    >
                      {note.type === "flag" ? "Flag" : "Note"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-sm text-gray-900 mb-2">{note.content}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <User className="w-3 h-3" />
                  {note.createdBy}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
