"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"

export function CardsOverview() {
  const cards = [
    {
      id: "1",
      type: "Debit",
      last4: "1234",
      brand: "VISA",
      status: "active",
      spendingLimit: 5000,
      used: 2500,
      expires: "12/26"
    },
    {
      id: "2",
      type: "Credit",
      last4: "5678",
      brand: "Mastercard",
      status: "active",
      spendingLimit: 10000,
      used: 7500,
      expires: "06/27"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'blocked':
        return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Blocked</Badge>
      case 'expired':
        return <Badge className="bg-gray-500 text-white"><Clock className="w-3 h-3 mr-1" />Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Cards Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cards.map((card) => {
          const usagePercent = (card.used / card.spendingLimit) * 100
          return (
            <div key={card.id} className="p-4 border border-gray-200 rounded-xl">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{card.type} Card</p>
                    <p className="text-xs text-gray-500 font-mono">**** **** **** {card.last4}</p>
                    <p className="text-xs text-gray-400">{card.brand}</p>
                  </div>
                </div>
                {getStatusBadge(card.status)}
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Spending Limit</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${card.spendingLimit.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Used</span>
                  <span className="text-sm font-medium text-gray-700">
                    ${card.used.toLocaleString()} ({usagePercent.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-500">Expires: {card.expires}</span>
                <Button variant="ghost" size="sm" className="text-xs" asChild>
                  <Link href="/customer/cards">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Replace Card
                  </Link>
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
