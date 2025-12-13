"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ActivityHeatmap } from "@/lib/types"

interface ActivityHeatmapProps {
  data: ActivityHeatmap[]
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const hours = Array.from({ length: 24 }, (_, i) => i)

export function ActivityHeatmapComponent({ data }: ActivityHeatmapProps) {
  // Get max value for color scaling
  const maxValue = Math.max(...data.map(d => d.value))

  // Get color based on value
  const getColor = (value: number) => {
    if (value === 0) return "bg-gray-100 dark:bg-gray-800"
    const intensity = Math.min((value / maxValue) * 100, 100)
    
    if (intensity < 20) return "bg-green-200 dark:bg-green-900"
    if (intensity < 40) return "bg-green-300 dark:bg-green-800"
    if (intensity < 60) return "bg-yellow-300 dark:bg-yellow-800"
    if (intensity < 80) return "bg-orange-400 dark:bg-orange-700"
    return "bg-red-500 dark:bg-red-700"
  }

  // Find data for specific hour and day
  const findData = (hour: number, day: string) => {
    return data.find(d => d.hour === hour && d.day === day)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Activity Heatmap</CardTitle>
        <p className="text-sm text-muted-foreground">
          Peak transaction hours by day of week
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Hour labels */}
            <div className="flex mb-2">
              <div className="w-24 flex-shrink-0" /> {/* Space for day labels */}
              {hours.map(hour => (
                <div
                  key={hour}
                  className="flex-1 text-center text-xs text-muted-foreground min-w-[30px]"
                >
                  {hour === 0 ? "12a" : hour < 12 ? `${hour}a` : hour === 12 ? "12p" : `${hour - 12}p`}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="space-y-1">
              {days.map(day => (
                <div key={day} className="flex items-center">
                  <div className="w-24 text-sm text-muted-foreground flex-shrink-0 pr-2">
                    {day}
                  </div>
                  <div className="flex gap-1 flex-1">
                    {hours.map(hour => {
                      const cellData = findData(hour, day)
                      const value = cellData?.value || 0
                      const count = cellData?.transactionCount || 0
                      
                      return (
                        <div
                          key={`${day}-${hour}`}
                          className={`flex-1 aspect-square min-w-[30px] rounded ${getColor(value)} transition-all hover:scale-110 hover:shadow-lg cursor-pointer relative group`}
                          title={`${day} ${hour}:00 - ${count} transactions`}
                        >
                          {/* Tooltip on hover */}
                          <div className="hidden group-hover:block absolute z-10 bg-black text-white text-xs rounded p-2 -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <div>{day}</div>
                            <div>{hour}:00</div>
                            <div className="font-bold">{count} transactions</div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                              <div className="border-4 border-transparent border-t-black" />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <span className="text-sm text-muted-foreground">Less</span>
              <div className="flex gap-1">
                <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="w-6 h-6 rounded bg-green-200 dark:bg-green-900" />
                <div className="w-6 h-6 rounded bg-green-300 dark:bg-green-800" />
                <div className="w-6 h-6 rounded bg-yellow-300 dark:bg-yellow-800" />
                <div className="w-6 h-6 rounded bg-orange-400 dark:bg-orange-700" />
                <div className="w-6 h-6 rounded bg-red-500 dark:bg-red-700" />
              </div>
              <span className="text-sm text-muted-foreground">More</span>
            </div>
          </div>
        </div>

        {/* Peak hours summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Peak Hour</p>
            <p className="text-2xl font-bold">12:00 PM</p>
            <p className="text-xs text-muted-foreground">130+ transactions</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Busiest Day</p>
            <p className="text-2xl font-bold">Monday</p>
            <p className="text-xs text-muted-foreground">Average 650 transactions</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Quiet Hours</p>
            <p className="text-2xl font-bold">2-5 AM</p>
            <p className="text-xs text-muted-foreground">Less than 5 transactions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

