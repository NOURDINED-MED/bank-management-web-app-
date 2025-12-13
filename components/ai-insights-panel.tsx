"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, TrendingUp, AlertTriangle, Target, Sparkles } from "lucide-react"
import type { AIInsight } from "@/lib/types"

interface AIInsightsPanelProps {
  insights: AIInsight[]
}

const typeIcons = {
  prediction: TrendingUp,
  anomaly: AlertTriangle,
  forecast: Target,
  recommendation: Lightbulb,
}

const typeColors = {
  prediction: "bg-blue-500/10 text-blue-600 border-blue-200",
  anomaly: "bg-red-500/10 text-red-600 border-red-200",
  forecast: "bg-purple-500/10 text-purple-600 border-purple-200",
  recommendation: "bg-green-500/10 text-green-600 border-green-200",
}

const severityColors = {
  info: "bg-blue-500",
  warning: "bg-yellow-500",
  critical: "bg-red-500",
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI-Powered Insights
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Beta
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Machine learning predictions, anomaly detection, and recommendations
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Insights Grid */}
      {insights.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Sparkles className="w-8 h-8 mb-2" />
            <p>No AI insights available yet</p>
            <p className="text-sm">System is analyzing data...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {insights.map((insight) => {
            const Icon = typeIcons[insight.type]
            const typeColor = typeColors[insight.type]
            const severityColor = severityColors[insight.severity]

            return (
              <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${typeColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{insight.title}</h4>
                            <Badge variant="outline" className={typeColor}>
                              {insight.type}
                            </Badge>
                            <Badge className={severityColor}>
                              {insight.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {insight.description}
                          </p>
                        </div>
                      </div>

                      {/* Confidence Score */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">
                            Confidence Score
                          </span>
                          <span className="text-xs font-medium">
                            {insight.confidence}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              insight.confidence >= 80
                                ? "bg-green-500"
                                : insight.confidence >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${insight.confidence}%` }}
                          />
                        </div>
                      </div>

                      {/* Metadata */}
                      {insight.metadata && Object.keys(insight.metadata).length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          {Object.entries(insight.metadata).slice(0, 4).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <p className="text-muted-foreground capitalize">
                                {key.replace(/_/g, " ")}
                              </p>
                              <p className="font-medium">
                                {typeof value === "number"
                                  ? value.toLocaleString()
                                  : String(value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Generated {new Date(insight.generatedAt).toLocaleString()}
                        </p>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Insights</p>
            <p className="text-2xl font-bold">{insights.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Predictions</p>
            <p className="text-2xl font-bold text-blue-600">
              {insights.filter(i => i.type === "prediction").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Anomalies</p>
            <p className="text-2xl font-bold text-red-600">
              {insights.filter(i => i.type === "anomaly").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Avg Confidence</p>
            <p className="text-2xl font-bold text-green-600">
              {insights.length > 0
                ? Math.round(
                    insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length
                  )
                : 0}
              %
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

