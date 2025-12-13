"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Clock, 
  FileText, 
  AlertTriangle,
  History,
  MessageSquare
} from "lucide-react"

interface Activity {
  type: "visit" | "login" | "note" | "interaction"
  description: string
  timestamp: string
  location?: string
  tellerName?: string
}

interface CustomerActivityProps {
  lastBranchVisit?: string
  lastOnlineLogin?: string
  tellerNotes?: string[]
  interactionHistory?: Activity[]
  flags?: string[]
}

export function CustomerActivity({ 
  lastBranchVisit, 
  lastOnlineLogin, 
  tellerNotes, 
  interactionHistory,
  flags 
}: CustomerActivityProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          Customer Activity & Interactions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Last Branch Visit */}
        {lastBranchVisit && (
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Last Branch Visit</p>
                <p className="text-xs text-gray-500">{new Date(lastBranchVisit).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Last Online Login */}
        {lastOnlineLogin && (
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Last Online Login</p>
                <p className="text-xs text-gray-500">{new Date(lastOnlineLogin).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Teller Notes */}
        {tellerNotes && tellerNotes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Teller Notes
            </h3>
            <div className="space-y-2">
              {tellerNotes.map((note, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <p className="text-sm text-gray-700">{note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interaction History */}
        {interactionHistory && interactionHistory.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Interaction History
            </h3>
            <div className="space-y-2">
              {interactionHistory.map((interaction, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{interaction.description}</p>
                      {interaction.location && (
                        <p className="text-xs text-gray-500 mt-1">{interaction.location}</p>
                      )}
                      {interaction.tellerName && (
                        <p className="text-xs text-gray-500">By: {interaction.tellerName}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(interaction.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flags or Alerts */}
        {flags && flags.length > 0 && (
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-semibold text-yellow-900">Flags & Alerts</h4>
            </div>
            <div className="space-y-1">
              {flags.map((flag, index) => (
                <p key={index} className="text-sm text-yellow-700">• {flag}</p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
