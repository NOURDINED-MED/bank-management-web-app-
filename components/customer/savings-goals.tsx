"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Plus, Target, Shield, Plane, Car, Home } from "lucide-react"
import type { SavingsGoal } from "@/lib/types"

interface SavingsGoalsProps {
  goals: SavingsGoal[]
  onAddGoal?: () => void
  onEditGoal?: (goalId: string) => void
}

const iconMap: Record<string, any> = {
  Shield,
  Plane,
  Car,
  Home,
  Target
}

export function SavingsGoals({ goals, onAddGoal, onEditGoal }: SavingsGoalsProps) {
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const overallProgress = (totalSaved / totalTarget) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Savings & Goals</CardTitle>
          <Button size="sm" onClick={onAddGoal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Overall Savings Progress</h4>
              <Badge className="bg-green-500">
                {overallProgress.toFixed(0)}%
              </Badge>
            </div>
            <Progress value={overallProgress} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">
              ${totalSaved.toLocaleString()} of ${totalTarget.toLocaleString()} saved
            </p>
          </div>

          {/* Individual Goals */}
          <div className="space-y-4">
            {goals.map((goal) => {
              const Icon = iconMap[goal.icon] || Target
              const progress = (goal.currentAmount / goal.targetAmount) * 100
              const remaining = goal.targetAmount - goal.currentAmount
              const daysUntilDeadline = Math.ceil(
                (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )

              return (
                <div
                  key={goal.id}
                  className="p-4 border rounded-lg hover:border-accent transition-colors cursor-pointer"
                  onClick={() => onEditGoal?.(goal.id)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ 
                        backgroundColor: `${goal.color}20`,
                        color: goal.color 
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{goal.name}</h4>
                        <Badge variant="outline" style={{ borderColor: goal.color, color: goal.color }}>
                          {progress.toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <Progress 
                    value={progress} 
                    className="h-2 mb-2"
                    style={{
                      ['--progress-background' as any]: goal.color
                    } as React.CSSProperties}
                  />

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>${remaining.toLocaleString()} remaining</span>
                    <span>
                      {daysUntilDeadline > 0 
                        ? `${daysUntilDeadline} days left`
                        : `Overdue by ${Math.abs(daysUntilDeadline)} days`
                      }
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {goals.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No savings goals yet</p>
              <Button variant="link" onClick={onAddGoal}>
                Create your first goal
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

