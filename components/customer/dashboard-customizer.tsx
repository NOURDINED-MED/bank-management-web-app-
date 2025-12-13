"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Settings, Eye, EyeOff, GripVertical, RotateCcw } from "lucide-react"

export interface DashboardCard {
  id: string
  title: string
  visible: boolean
  order: number
}

interface DashboardCustomizerProps {
  cards: DashboardCard[]
  onUpdateLayout?: (cards: DashboardCard[]) => void
}

export function DashboardCustomizer({ cards, onUpdateLayout }: DashboardCustomizerProps) {
  const [open, setOpen] = useState(false)
  const [localCards, setLocalCards] = useState(cards)

  const toggleVisibility = (id: string) => {
    setLocalCards(prev =>
      prev.map(card => 
        card.id === id ? { ...card, visible: !card.visible } : card
      )
    )
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newCards = [...localCards]
    const temp = newCards[index]
    newCards[index] = newCards[index - 1]
    newCards[index - 1] = temp
    // Update order numbers
    newCards.forEach((card, idx) => card.order = idx)
    setLocalCards(newCards)
  }

  const moveDown = (index: number) => {
    if (index === localCards.length - 1) return
    const newCards = [...localCards]
    const temp = newCards[index]
    newCards[index] = newCards[index + 1]
    newCards[index + 1] = temp
    // Update order numbers
    newCards.forEach((card, idx) => card.order = idx)
    setLocalCards(newCards)
  }

  const resetToDefault = () => {
    const defaultCards = cards.map((card, index) => ({
      ...card,
      visible: true,
      order: index
    }))
    setLocalCards(defaultCards)
  }

  const saveLayout = () => {
    onUpdateLayout?.(localCards)
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <Settings className="w-4 h-4 mr-2" />
        Customize Dashboard
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Your Dashboard</DialogTitle>
            <DialogDescription>
              Show, hide, or reorder dashboard cards to match your preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Reset Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>

            {/* Cards List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {localCards.map((card, index) => (
                <div
                  key={card.id}
                  className="p-3 border rounded-lg flex items-center gap-3"
                >
                  {/* Drag handle */}
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />

                  {/* Card info */}
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={`card-${card.id}`} className="font-medium cursor-pointer">
                      {card.title}
                    </Label>
                  </div>

                  {/* Visibility toggle */}
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`card-${card.id}`}
                      checked={card.visible}
                      onCheckedChange={() => toggleVisibility(card.id)}
                    />
                    {card.visible ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-2"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                    >
                      ▲
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-2"
                      onClick={() => moveDown(index)}
                      disabled={index === localCards.length - 1}
                    >
                      ▼
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Save button */}
            <div className="flex gap-2 pt-4">
              <Button onClick={saveLayout} className="flex-1">
                Save Layout
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

