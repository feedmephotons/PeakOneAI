'use client'

import { CategoryData } from '@/lib/analytics'

interface PieChartProps {
  data: CategoryData[]
  size?: number
  donut?: boolean
  showLegend?: boolean
}

export default function PieChart({
  data,
  size = 200,
  donut = true,
  showLegend = true
}: PieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No data available
      </div>
    )
  }

  const total = data.reduce((acc, item) => acc + item.value, 0)
  const center = size / 2
  const radius = size / 2 - 10
  const innerRadius = donut ? radius * 0.6 : 0

  let currentAngle = -90 // Start from top

  const slices = data.map((item) => {
    const percentage = (item.value / total) * 100
    const angle = (item.value / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle

    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    // Calculate arc path
    const x1 = center + radius * Math.cos(startRad)
    const y1 = center + radius * Math.sin(startRad)
    const x2 = center + radius * Math.cos(endRad)
    const y2 = center + radius * Math.sin(endRad)

    const largeArcFlag = angle > 180 ? 1 : 0

    let path: string
    if (donut) {
      const ix1 = center + innerRadius * Math.cos(startRad)
      const iy1 = center + innerRadius * Math.sin(startRad)
      const ix2 = center + innerRadius * Math.cos(endRad)
      const iy2 = center + innerRadius * Math.sin(endRad)

      path = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${ix2} ${iy2}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1}`,
        'Z'
      ].join(' ')
    } else {
      path = [
        `M ${center} ${center}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')
    }

    currentAngle = endAngle

    return {
      ...item,
      path,
      percentage,
      startAngle,
      endAngle
    }
  })

  return (
    <div className="flex items-center gap-6">
      {/* Chart */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform rotate-0">
          {slices.map((slice, index) => (
            <g key={index}>
              <path
                d={slice.path}
                fill={slice.color || '#8b5cf6'}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                title={`${slice.category}: ${slice.value} (${slice.percentage.toFixed(1)}%)`}
              />
            </g>
          ))}
        </svg>

        {/* Center text for donut */}
        {donut && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex-1 space-y-2">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: slice.color || '#8b5cf6' }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {slice.category}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {slice.value}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({slice.percentage.toFixed(0)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
