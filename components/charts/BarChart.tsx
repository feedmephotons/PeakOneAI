'use client'

import { CategoryData } from '@/lib/analytics'

interface BarChartProps {
  data: CategoryData[]
  height?: number
  orientation?: 'vertical' | 'horizontal'
  showValues?: boolean
}

export default function BarChart({
  data,
  height = 200,
  orientation = 'vertical',
  showValues = true
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No data available
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value), 1)

  if (orientation === 'horizontal') {
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {item.category}
              </span>
              {showValues && (
                <span className="text-gray-500 dark:text-gray-400">{item.value}</span>
              )}
            </div>
            <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || '#8b5cf6'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative" style={{ height: `${height + 40}px` }}>
      <div className="flex items-end justify-around h-full pb-10 gap-2">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * height

          return (
            <div key={index} className="flex flex-col items-center flex-1 max-w-[100px]">
              {showValues && (
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {item.value}
                </span>
              )}
              <div
                className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer"
                style={{
                  height: `${barHeight}px`,
                  backgroundColor: item.color || '#8b5cf6',
                  minHeight: item.value > 0 ? '4px' : '0'
                }}
                title={`${item.category}: ${item.value}`}
              />
            </div>
          )
        })}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-around gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 max-w-[100px]">
            <p className="text-xs text-center text-gray-600 dark:text-gray-400 truncate">
              {item.category}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
