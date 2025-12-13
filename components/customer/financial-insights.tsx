"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, PiggyBank, Lightbulb, AlertTriangle, TrendingDown, DollarSign } from "lucide-react"
import type { FinancialInsight } from "@/lib/types"

interface FinancialInsightsProps {
  insights: FinancialInsight[]
}

const iconMap: Record<string, any> = {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Lightbulb,
  AlertTriangle,
  DollarSign
}

const typeLabels = {
  spending: "Spending",
  saving: "Savings",
  income: "Income",
  alert: "Alert",
  tip: "Tip"
}

export function FinancialInsights({ insights }: FinancialInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Financial Insights
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Personalized tips and spending analysis
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No insights available yet</p>
              <p className="text-xs mt-1">Check back after more transactions</p>
            </div>
          ) : (
            insights.map((insight) => {
              const Icon = iconMap[insight.icon] || Lightbulb

              return (
                <div
                  key={insight.id}
                  className="p-4 border rounded-lg hover:border-accent transition-colors"
                  style={{ borderLeftWidth: '4px', borderLeftColor: insight.color }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{ 
                        backgroundColor: `${insight.color}20`,
                        color: insight.color 
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <Badge 
                          variant="outline"
                          style={{ borderColor: insight.color, color: insight.color }}
                        >
                          {typeLabels[insight.type]}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {insight.message}
                      </p>

                      {(insight.amount || insight.percentage) && (
                        <div className="flex items-center gap-3 text-sm">
                          {insight.amount && (
                            <span className="font-semibold" style={{ color: insight.color }}>
                              ${insight.amount.toLocaleString()}
                            </span>
                          )}
                          {insight.percentage && (
                            <span className="font-semibold" style={{ color: insight.color }}>
                              {insight.percentage}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

