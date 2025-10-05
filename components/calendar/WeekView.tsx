'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  color?: string
}

interface WeekViewProps {
  events: CalendarEvent[]
  currentDate: Date
  onDateChange: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export default function WeekView({ events, currentDate, onDateChange, onEventClick }: WeekViewProps) {
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    return day
  })

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate.toDateString() === day.toDateString()
    })
  }

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.start)
    const end = new Date(event.end)
    const top = (start.getHours() + start.getMinutes() / 60) * 60
    const height = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 60
    return { top, height }
  }

  const previousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() - 7)
    onDateChange(newDate)
  }

  const nextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + 7)
    onDateChange(newDate)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {startOfWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={previousWeek}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDateChange(new Date())}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            Today
          </button>
          <button
            onClick={nextWeek}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 gap-px bg-gray-200 dark:bg-gray-700">
          {/* Time column */}
          <div className="bg-gray-50 dark:bg-gray-800">
            <div className="h-12 border-b border-gray-200 dark:border-gray-700"></div>
            {hours.map(hour => (
              <div key={hour} className="h-16 border-b border-gray-200 dark:border-gray-700 px-2 text-xs text-gray-500 dark:text-gray-400">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDay(day)
            const isToday = day.toDateString() === new Date().toDateString()

            return (
              <div key={index} className="bg-white dark:bg-gray-900 relative">
                <div className={`h-12 border-b border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center ${
                  isToday ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                }`}>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-semibold ${
                    isToday ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>

                <div className="relative">
                  {hours.map(hour => (
                    <div key={hour} className="h-16 border-b border-gray-200 dark:border-gray-700"></div>
                  ))}

                  {/* Events */}
                  {dayEvents.map(event => {
                    const { top, height } = getEventPosition(event)
                    return (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className="absolute left-1 right-1 rounded px-2 py-1 text-xs cursor-pointer hover:opacity-80 transition"
                        style={{
                          top: `${top}px`,
                          height: `${Math.max(height, 30)}px`,
                          backgroundColor: event.color || '#8b5cf6',
                          color: 'white'
                        }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-xs opacity-90">
                          {new Date(event.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
