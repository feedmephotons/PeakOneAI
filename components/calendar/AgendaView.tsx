'use client'

import React from 'react'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
  location?: string
  attendees?: string[]
  color?: string
}

interface AgendaViewProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

export default function AgendaView({ events, onEventClick }: AgendaViewProps) {
  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = new Date(event.start).toDateString()
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(event)
    return acc
  }, {} as Record<string, CalendarEvent[]>)

  // Sort dates
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime()
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (sortedDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No upcoming events</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Your schedule is clear
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {sortedDates.map(dateKey => (
        <div key={dateKey}>
          <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 z-10">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {formatDate(dateKey)}
            </h3>
          </div>

          <div className="space-y-2 p-4">
            {groupedEvents[dateKey]
              .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
              .map(event => (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="group cursor-pointer bg-white dark:bg-gray-900 rounded-lg p-4 hover:shadow-md transition border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex gap-4">
                    {/* Time indicator */}
                    <div className="flex flex-col items-center min-w-[80px]">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatTime(event.start)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(event.end)}
                      </div>
                    </div>

                    {/* Color bar */}
                    <div
                      className="w-1 rounded-full"
                      style={{ backgroundColor: event.color || '#8b5cf6' }}
                    ></div>

                    {/* Event details */}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {event.title}
                      </h4>

                      {event.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {Math.round((new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60))} min
                          </span>
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{event.location}</span>
                          </div>
                        )}

                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
