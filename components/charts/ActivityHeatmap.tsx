'use client'

import { ActivityData } from '@/lib/analytics'

interface ActivityHeatmapProps {
  data: ActivityData[]
  cellSize?: number
  gap?: number
}

export default function ActivityHeatmap({
  data,
  cellSize = 12,
  gap = 3
}: ActivityHeatmapProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No data available
      </div>
    )
  }

  // Group by weeks
  const weeks: ActivityData[][] = []
  let currentWeek: ActivityData[] = []

  data.forEach((day, index) => {
    const date = new Date(day.date)
    const dayOfWeek = date.getDay()

    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }

    currentWeek.push(day)

    if (index === data.length - 1) {
      weeks.push(currentWeek)
    }
  })

  const getLevelColor = (level: number) => {
    const colors = {
      0: 'bg-gray-100 dark:bg-gray-800',
      1: 'bg-green-200 dark:bg-green-900',
      2: 'bg-green-400 dark:bg-green-700',
      3: 'bg-green-600 dark:bg-green-500',
      4: 'bg-green-800 dark:bg-green-400'
    }
    return colors[level as keyof typeof colors] || colors[0]
  }

  const monthLabels = weeks.map((week, index) => {
    if (week.length === 0) return null
    const firstDay = new Date(week[0].date)
    if (firstDay.getDate() <= 7 || index === 0) {
      return firstDay.toLocaleDateString('en-US', { month: 'short' })
    }
    return null
  })

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Month labels */}
        <div className="flex mb-2" style={{ paddingLeft: 30 }}>
          {monthLabels.map((label, index) => (
            <div
              key={index}
              style={{ width: cellSize + gap }}
              className="text-xs text-gray-500 dark:text-gray-400"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex gap-0">
          {/* Day labels */}
          <div className="flex flex-col justify-between mr-2 pr-2" style={{ width: 30 }}>
            {[1, 3, 5].map(dayIndex => (
              <div
                key={dayIndex}
                className="text-xs text-gray-500 dark:text-gray-400"
                style={{ height: cellSize }}
              >
                {dayLabels[dayIndex]}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex" style={{ gap: `${gap}px` }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col" style={{ gap: `${gap}px` }}>
                {/* Fill empty days at start of first week */}
                {weekIndex === 0 && week.length > 0 && (
                  <>
                    {Array.from({ length: new Date(week[0].date).getDay() }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        style={{ width: cellSize, height: cellSize }}
                        className="bg-transparent"
                      />
                    ))}
                  </>
                )}

                {week.map((day, dayIndex) => {
                  const date = new Date(day.date)
                  return (
                    <div
                      key={dayIndex}
                      style={{ width: cellSize, height: cellSize }}
                      className={`${getLevelColor(day.level)} rounded-sm cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all`}
                      title={`${date.toLocaleDateString()}: ${day.count} activities`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              style={{ width: cellSize, height: cellSize }}
              className={`${getLevelColor(level)} rounded-sm`}
            />
          ))}
          <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
        </div>
      </div>
    </div>
  )
}
