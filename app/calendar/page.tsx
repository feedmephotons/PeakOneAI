'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus, ChevronLeft, ChevronRight, Clock, MapPin, Users,
  Video, Calendar, Bell, X, Trash2
} from 'lucide-react'

interface Event {
  id: string
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  type: 'meeting' | 'task' | 'reminder' | 'call'
  participants?: string[]
  location?: string
  color: string
  isAllDay?: boolean
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly'
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [events, setEvents] = useState<Event[]>([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventDetails, setShowEventDetails] = useState(false)

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'meeting',
    location: '',
    color: 'bg-blue-500',
    isAllDay: false,
    recurring: 'none'
  })

  // Load events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events')
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents))
    } else {
      // Sample events
      const sampleEvents: Event[] = [
        {
          id: '1',
          title: 'Team Standup',
          date: new Date().toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '10:30',
          type: 'meeting',
          participants: ['John', 'Sarah', 'Mike'],
          color: 'bg-blue-500',
          recurring: 'daily'
        },
        {
          id: '2',
          title: 'Client Presentation',
          date: new Date().toISOString().split('T')[0],
          startTime: '14:00',
          endTime: '15:00',
          type: 'meeting',
          participants: ['Client Team'],
          location: 'Conference Room A',
          color: 'bg-green-500'
        },
        {
          id: '3',
          title: 'Project Deadline',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          startTime: '17:00',
          endTime: '17:00',
          type: 'task',
          color: 'bg-red-500',
          isAllDay: true
        }
      ]
      setEvents(sampleEvents)
    }
  }, [])

  // Save events to localStorage
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('calendar-events', JSON.stringify(events))
    }
  }, [events])

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const generateCalendarDays = () => {
    const days = []
    const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      days.push(currentDate)
      if (currentDate > lastDay && currentDate.getDay() === 0) break
    }
    return days
  }

  const generateWeekDays = () => {
    const days = []
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek)
      currentDate.setDate(startOfWeek.getDate() + i)
      days.push(currentDate)
    }
    return days
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0')
      slots.push(`${hour}:00`)
    }
    return slots
  }

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.startTime) return

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title || '',
      description: newEvent.description,
      date: newEvent.date || '',
      startTime: newEvent.startTime || '',
      endTime: newEvent.endTime || newEvent.startTime || '',
      type: newEvent.type || 'meeting',
      participants: newEvent.participants,
      location: newEvent.location,
      color: newEvent.color || 'bg-blue-500',
      isAllDay: newEvent.isAllDay,
      recurring: newEvent.recurring
    }

    setEvents([...events, event])
    setShowEventModal(false)
    setNewEvent({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      type: 'meeting',
      location: '',
      color: 'bg-blue-500',
      isAllDay: false,
      recurring: 'none'
    })
  }

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId))
    setShowEventDetails(false)
    setSelectedEvent(null)
  }

  const calendarDays = generateCalendarDays()
  const weekDays = generateWeekDays()
  const timeSlots = generateTimeSlots()

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return events.filter(e => e.date === dateString)
  }

  const typeIcons = {
    meeting: <Video className="w-3 h-3" />,
    task: <Clock className="w-3 h-3" />,
    reminder: <Bell className="w-3 h-3" />,
    call: <Users className="w-3 h-3" />
  }

  const typeColors = {
    meeting: 'bg-blue-500',
    task: 'bg-green-500',
    reminder: 'bg-yellow-500',
    call: 'bg-purple-500'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your schedule and appointments</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Today
              </button>
              <button
                onClick={() => setShowEventModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Event
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Calendar Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  viewMode === 'month' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  viewMode === 'week' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  viewMode === 'day' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Day
              </button>
            </div>
          </div>
        </div>

        {/* Month View */}
        {viewMode === 'month' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              {dayNamesShort.map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((date, index) => {
                const isCurrentMonth = date.getMonth() === selectedDate.getMonth()
                const isToday = date.toDateString() === new Date().toDateString()
                const dayEvents = getEventsForDate(date)

                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 border-r border-b border-gray-200 dark:border-gray-700 ${
                      !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    } ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''} transition-colors cursor-pointer`}
                    onClick={() => {
                      setSelectedDate(date)
                      if (viewMode === 'month') setViewMode('day')
                    }}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      !isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'
                    } ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                      {date.getDate()}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEvent(event)
                            setShowEventDetails(true)
                          }}
                          className={`text-xs px-1.5 py-0.5 rounded ${event.color} text-white truncate cursor-pointer hover:opacity-80 flex items-center gap-1`}
                        >
                          {typeIcons[event.type]}
                          {event.isAllDay ? event.title : `${event.startTime} ${event.title}`}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="grid grid-cols-8 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                Time
              </div>
              {weekDays.map((date, index) => {
                const isToday = date.toDateString() === new Date().toDateString()
                return (
                  <div
                    key={index}
                    className={`p-3 text-center text-sm font-medium ${
                      isToday ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div>{dayNamesShort[date.getDay()]}</div>
                    <div className="text-lg font-semibold">{date.getDate()}</div>
                  </div>
                )
              })}
            </div>

            <div className="overflow-y-auto max-h-[600px]">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">
                    {time}
                  </div>
                  {weekDays.map((date, index) => {
                    const dayEvents = getEventsForDate(date).filter(e => e.startTime?.startsWith(time.slice(0, 2)))
                    return (
                      <div
                        key={index}
                        className="p-1 min-h-[50px] border-r border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            onClick={() => {
                              setSelectedEvent(event)
                              setShowEventDetails(true)
                            }}
                            className={`text-xs px-1 py-0.5 rounded ${event.color} text-white truncate cursor-pointer hover:opacity-80`}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day View */}
        {viewMode === 'day' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {dayNames[selectedDate.getDay()]}, {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
              </h3>
            </div>

            <div className="overflow-y-auto max-h-[600px]">
              {timeSlots.map((time) => {
                const dayEvents = getEventsForDate(selectedDate).filter(e => e.startTime?.startsWith(time.slice(0, 2)))
                return (
                  <div key={time} className="flex border-b border-gray-200 dark:border-gray-700">
                    <div className="w-20 p-3 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">
                      {time}
                    </div>
                    <div className="flex-1 p-3 min-h-[60px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event)
                            setShowEventDetails(true)
                          }}
                          className={`mb-2 p-2 rounded ${event.color} text-white cursor-pointer hover:opacity-80`}
                        >
                          <div className="font-medium text-sm flex items-center gap-2">
                            {typeIcons[event.type]}
                            {event.title}
                          </div>
                          {event.description && (
                            <p className="text-xs mt-1 opacity-90">{event.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span>{event.startTime} - {event.endTime}</span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </span>
                            )}
                            {event.participants && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {event.participants.length}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {events
              .filter(e => new Date(e.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map((event) => (
                <div
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event)
                    setShowEventDetails(true)
                  }}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-12 ${event.color} rounded-full`}></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {typeIcons[event.type]}
                        {event.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {event.date} • {event.isAllDay ? 'All day' : `${event.startTime} - ${event.endTime}`}
                      </p>
                      {event.participants && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          With: {event.participants.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Create/Edit Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Create New Event
              </h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as Event['type'], color: typeColors[e.target.value as Event['type']] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="meeting">Meeting</option>
                  <option value="task">Task</option>
                  <option value="reminder">Reminder</option>
                  <option value="call">Call</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newEvent.isAllDay}
                    onChange={(e) => setNewEvent({ ...newEvent, isAllDay: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">All day</span>
                </label>
              </div>

              {!newEvent.isAllDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Add location or meeting link"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Add notes or description"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {typeIcons[selectedEvent.type]}
                {selectedEvent.title}
              </h2>
              <button
                onClick={() => setShowEventDetails(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{selectedEvent.date}</span>
              </div>

              {!selectedEvent.isAllDay && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                </div>
              )}

              {selectedEvent.location && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.participants && selectedEvent.participants.length > 0 && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{selectedEvent.participants.join(', ')}</span>
                </div>
              )}

              {selectedEvent.description && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="px-4 py-2 text-red-600 hover:text-red-700 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowEventDetails(false)}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}