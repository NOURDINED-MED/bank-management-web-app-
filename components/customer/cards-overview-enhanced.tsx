"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw
} from "lucide-react"

interface CardInfo {
  id: string
  type: "debit" | "credit"
  last4: string
  status: "active" | "blocked" | "expired"
  spendingLimit?: number
  currentSpending?: number
  expiryDate?: string
}

interface CardsOverviewEnhancedProps {
  cards: CardInfo[]
  onReplaceCard?: (cardId: string) => void
}

export function CardsOverviewEnhanced({ cards, onReplaceCard }: CardsOverviewEnhancedProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Cards Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cards.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No cards found</p>
          </div>
        ) : (
          cards.map((card) => (
            <div
              key={card.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 capitalize">{card.type} Card</h4>
                    <Badge 
                      variant={card.status === "active" ? "default" : "secondary"}
                      className={
                        card.status === "active" 
                          ? "bg-green-500" 
                          : card.status === "blocked"
                          ? "bg-red-500"
                          : "bg-gray-500"
                      }
                    >
                      {card.status === "active" ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : card.status === "blocked" ? (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Blocked
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Expired
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 font-mono">**** **** **** {card.last4}</p>
                  {card.expiryDate && (
                    <p className="text-xs text-gray-500 mt-1">Expires: {card.expiryDate}</p>
                  )}
                </div>
              </div>
              
              {card.spendingLimit && (
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Spending Limit</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${(card.currentSpending || 0).toLocaleString()} / ${card.spendingLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        ((card.currentSpending || 0) / card.spendingLimit) * 100 > 80 
                          ? "bg-red-500" 
                          : ((card.currentSpending || 0) / card.spendingLimit) * 100 > 50
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(((card.currentSpending || 0) / card.spendingLimit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onReplaceCard?.(card.id)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Replace Card
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
