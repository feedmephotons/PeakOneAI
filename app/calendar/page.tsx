'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus, ChevronLeft, ChevronRight, Clock, MapPin, Users,
  Video, Calendar, Bell, X, Trash2, RefreshCw
} from 'lucide-react'
import { GlassPanel, SectionLabel, AskLisaBar } from '@/components/peak'

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
  const [isLoaded, setIsLoaded] = useState(false)
  const [showDoubleBookingWarning, setShowDoubleBookingWarning] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'conflict' | 'error'>('idle')
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  const handleSyncCalendar = async () => {
    setSyncStatus('syncing')
    setSyncMessage(null)
    try {
      const res = await fetch('/api/calendar/sync', { method: 'POST' })
      const data = await res.json()
      if (res.status === 409) {
        setSyncStatus('conflict')
        setSyncMessage(data.error || 'Conflict detected')
      } else if (res.ok) {
        setSyncStatus('success')
        setSyncMessage('Google Calendar synced successfully.')
      } else {
        setSyncStatus('error')
        setSyncMessage(data.error || 'Failed to sync')
      }
    } catch {
      setSyncStatus('error')
      setSyncMessage('Sync failed due to network error.')
    }
  }

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
    setIsLoaded(true)
  }, [])

  // Save events to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('calendar-events', JSON.stringify(events))
    }
  }, [events, isLoaded])

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

    // Check overlap for double booking
    const isDoubleBooked = events.some(e => {
      if (e.date !== newEvent.date) return false;
      if (e.isAllDay || newEvent.isAllDay) return false;
      const start1 = e.startTime;
      const end1 = e.endTime || e.startTime;
      const start2 = newEvent.startTime!;
      const end2 = newEvent.endTime || newEvent.startTime!;
      return (start2 >= start1 && start2 < end1) || (end2 > start1 && end2 <= end1) || (start2 <= start1 && end2 >= end1);
    });

    if (isDoubleBooked && !showDoubleBookingWarning) {
      setShowDoubleBookingWarning(true);
      return;
    }

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
    setShowDoubleBookingWarning(false)
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
    <div className="px-6 py-6 sm:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-peak-muted">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-peak-primary/15 text-peak-primary-300">
              <Calendar className="h-3 w-3" />
            </span>
            Schedule
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-peak">Calendar</h1>
          <p className="mt-2 text-sm text-peak-muted">Manage your schedule and appointments</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {syncMessage && (
            <div className={`text-xs px-3 py-1.5 rounded-lg border ${
              syncStatus === 'success' ? 'bg-peak-green/12 border-peak-green/25 text-peak-green' :
              syncStatus === 'conflict' ? 'bg-peak-amber/12 border-peak-amber/25 text-peak-amber' :
              'bg-peak-red/12 border-peak-red/25 text-peak-red'
            }`} id="calendar-sync-message">
              {syncMessage}
            </div>
          )}
          <div className="hidden w-56 xl:block">
            <AskLisaBar placeholder="Ask Lisa about your schedule…" />
          </div>
          <button
            onClick={handleSyncCalendar}
            disabled={syncStatus === 'syncing'}
            className="px-4 py-2 bg-white/[0.04] border border-peak-border rounded-xl hover:bg-white/[0.08] transition-colors text-sm font-medium text-peak flex items-center gap-2 disabled:opacity-60"
            id="calendar-sync-btn"
          >
            <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            Sync Calendar
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-white/[0.04] border border-peak-border rounded-xl hover:bg-white/[0.08] transition-colors text-sm font-medium text-peak"
          >
            Today
          </button>
          <button
            onClick={() => setShowEventModal(true)}
            className="px-4 py-2 bg-peak-primary text-white rounded-xl hover:bg-peak-primary-600 shadow-peak-glow transition text-sm font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      <div>
        {/* Calendar Controls */}
        <GlassPanel className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-peak-muted" />
              </button>
              <h2 className="text-xl font-semibold text-peak">
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-peak-muted" />
              </button>
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-peak-border bg-white/[0.02] p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'month' ? 'bg-peak-primary/20 text-peak-primary-300' : 'text-peak-muted hover:text-peak'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'week' ? 'bg-peak-primary/20 text-peak-primary-300' : 'text-peak-muted hover:text-peak'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'day' ? 'bg-peak-primary/20 text-peak-primary-300' : 'text-peak-muted hover:text-peak'
                }`}
              >
                Day
              </button>
            </div>
          </div>
        </GlassPanel>

        {/* Month View */}
        {viewMode === 'month' && (
          <div className="bg-peak-glass border border-peak-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-7 bg-white/[0.02] border-b border-peak-border">
              {dayNamesShort.map((day) => (
                <div key={day} className="p-3 text-center text-xs font-medium uppercase tracking-wider text-peak-muted">
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
                    className={`min-h-[100px] p-2 border-r border-b border-peak-border ${
                      !isCurrentMonth ? 'bg-white/[0.01]' : 'hover:bg-white/[0.04]'
                    } ${isToday ? 'bg-peak-primary/10' : ''} transition-colors cursor-pointer`}
                    onClick={() => {
                      setSelectedDate(date)
                      if (viewMode === 'month') setViewMode('day')
                    }}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      !isCurrentMonth ? 'text-peak-dim' : 'text-peak'
                    } ${isToday ? 'flex h-6 w-6 items-center justify-center rounded-full bg-peak-primary text-white' : ''}`}>
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
                          className="text-xs px-1.5 py-0.5 rounded-md bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/20 truncate cursor-pointer hover:bg-peak-primary/25 flex items-center gap-1"
                        >
                          {typeIcons[event.type]}
                          {event.isAllDay ? event.title : `${event.startTime} ${event.title}`}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-peak-muted">
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
          <div className="bg-peak-glass border border-peak-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-8 bg-white/[0.02] border-b border-peak-border">
              <div className="p-3 text-center text-xs font-medium uppercase tracking-wider text-peak-muted border-r border-peak-border">
                Time
              </div>
              {weekDays.map((date, index) => {
                const isToday = date.toDateString() === new Date().toDateString()
                return (
                  <div
                    key={index}
                    className={`p-3 text-center text-sm font-medium ${
                      isToday ? 'text-peak-primary-300 bg-peak-primary/10' : 'text-peak-muted'
                    }`}
                  >
                    <div>{dayNamesShort[date.getDay()]}</div>
                    <div className={`text-lg font-semibold ${isToday ? 'text-peak-primary-300' : 'text-peak'}`}>{date.getDate()}</div>
                  </div>
                )
              })}
            </div>

            <div className="peak-scrollbar overflow-y-auto max-h-[600px]">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 border-b border-peak-border">
                  <div className="p-2 text-xs text-peak-dim border-r border-peak-border">
                    {time}
                  </div>
                  {weekDays.map((date, index) => {
                    const dayEvents = getEventsForDate(date).filter(e => e.startTime?.startsWith(time.slice(0, 2)))
                    return (
                      <div
                        key={index}
                        className="p-1 min-h-[50px] border-r border-peak-border hover:bg-white/[0.04] transition-colors"
                      >
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            onClick={() => {
                              setSelectedEvent(event)
                              setShowEventDetails(true)
                            }}
                            className="text-xs px-1 py-0.5 rounded-md bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/20 truncate cursor-pointer hover:bg-peak-primary/25"
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
          <div className="bg-peak-glass border border-peak-border rounded-2xl overflow-hidden">
            <div className="p-4 bg-white/[0.02] border-b border-peak-border">
              <h3 className="text-lg font-semibold text-peak">
                {dayNames[selectedDate.getDay()]}, {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
              </h3>
            </div>

            <div className="peak-scrollbar overflow-y-auto max-h-[600px]">
              {timeSlots.map((time) => {
                const dayEvents = getEventsForDate(selectedDate).filter(e => e.startTime?.startsWith(time.slice(0, 2)))
                return (
                  <div key={time} className="flex border-b border-peak-border">
                    <div className="w-20 p-3 text-sm text-peak-dim border-r border-peak-border">
                      {time}
                    </div>
                    <div className="flex-1 p-3 min-h-[60px] hover:bg-white/[0.04] transition-colors">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event)
                            setShowEventDetails(true)
                          }}
                          className="mb-2 p-2 rounded-xl bg-peak-primary/15 text-peak ring-1 ring-peak-primary/25 cursor-pointer hover:bg-peak-primary/25 transition-colors"
                        >
                          <div className="font-medium text-sm flex items-center gap-2 text-peak-primary-300">
                            {typeIcons[event.type]}
                            {event.title}
                          </div>
                          {event.description && (
                            <p className="text-xs mt-1 text-peak-muted">{event.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-peak-muted">
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
        <GlassPanel className="mt-6 p-6">
          <SectionLabel className="mb-4">Upcoming Events</SectionLabel>
          <div className="space-y-2">
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
                  className="flex items-center justify-between p-3 hover:bg-white/[0.04] rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-12 bg-peak-primary rounded-full"></div>
                    <div>
                      <p className="font-medium text-peak flex items-center gap-2">
                        <span className="text-peak-primary-300">{typeIcons[event.type]}</span>
                        {event.title}
                      </p>
                      <p className="text-sm text-peak-muted">
                        {event.date} • {event.isAllDay ? 'All day' : `${event.startTime} - ${event.endTime}`}
                      </p>
                      {event.participants && (
                        <p className="text-xs text-peak-dim mt-1">
                          With: {event.participants.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </GlassPanel>
      </div>

      {/* Create/Edit Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-peak-panel border border-peak-border rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight text-peak">
                Create New Event
              </h2>
              <button
                onClick={() => {
                  setShowEventModal(false)
                  setShowDoubleBookingWarning(false)
                }}
                className="text-peak-dim hover:text-peak transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {showDoubleBookingWarning && (
                <div className="p-3 bg-peak-amber/12 border border-peak-amber/25 text-peak-amber rounded-lg text-xs" id="calendar-double-booking-warning">
                  ⚠️ This slot is already booked. Click &quot;Create Event&quot; again to double book, or choose another time.
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-peak-muted mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-peak-border rounded-lg text-peak placeholder:text-peak-dim focus:outline-none focus:border-peak-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-peak-muted mb-1">
                  Type
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as Event['type'], color: typeColors[e.target.value as Event['type']] })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-peak-border rounded-lg text-peak focus:outline-none focus:border-peak-primary/50"
                >
                  <option value="meeting">Meeting</option>
                  <option value="task">Task</option>
                  <option value="reminder">Reminder</option>
                  <option value="call">Call</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-peak-muted mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-peak-border rounded-lg text-peak focus:outline-none focus:border-peak-primary/50"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newEvent.isAllDay}
                    onChange={(e) => setNewEvent({ ...newEvent, isAllDay: e.target.checked })}
                    className="mr-2 accent-peak-primary"
                  />
                  <span className="text-sm text-peak-muted">All day</span>
                </label>
              </div>

              {!newEvent.isAllDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-peak-muted mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className="w-full px-3 py-2 bg-white/[0.04] border border-peak-border rounded-lg text-peak focus:outline-none focus:border-peak-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-peak-muted mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      className="w-full px-3 py-2 bg-white/[0.04] border border-peak-border rounded-lg text-peak focus:outline-none focus:border-peak-primary/50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-peak-muted mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-peak-border rounded-lg text-peak placeholder:text-peak-dim focus:outline-none focus:border-peak-primary/50"
                  placeholder="Add location or meeting link"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-peak-muted mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-peak-border rounded-lg text-peak placeholder:text-peak-dim focus:outline-none focus:border-peak-primary/50"
                  rows={3}
                  placeholder="Add notes or description"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEventModal(false)
                  setShowDoubleBookingWarning(false)
                }}
                className="px-4 py-2 text-peak-muted hover:text-peak transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                className="px-6 py-2 bg-peak-primary text-white rounded-xl hover:bg-peak-primary-600 shadow-peak-glow transition font-semibold"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-peak-panel border border-peak-border rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight text-peak flex items-center gap-2">
                <span className="text-peak-primary-300">{typeIcons[selectedEvent.type]}</span>
                {selectedEvent.title}
              </h2>
              <button
                onClick={() => setShowEventDetails(false)}
                className="text-peak-dim hover:text-peak transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-peak-muted">
                <Calendar className="w-4 h-4 text-peak-dim" />
                <span>{selectedEvent.date}</span>
              </div>

              {!selectedEvent.isAllDay && (
                <div className="flex items-center gap-3 text-sm text-peak-muted">
                  <Clock className="w-4 h-4 text-peak-dim" />
                  <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                </div>
              )}

              {selectedEvent.location && (
                <div className="flex items-center gap-3 text-sm text-peak-muted">
                  <MapPin className="w-4 h-4 text-peak-dim" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.participants && selectedEvent.participants.length > 0 && (
                <div className="flex items-center gap-3 text-sm text-peak-muted">
                  <Users className="w-4 h-4 text-peak-dim" />
                  <span>{selectedEvent.participants.join(', ')}</span>
                </div>
              )}

              {selectedEvent.description && (
                <div className="pt-3 border-t border-peak-border">
                  <p className="text-sm text-peak">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="px-4 py-2 text-peak-red hover:bg-peak-red/10 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowEventDetails(false)}
                className="px-6 py-2 bg-white/[0.04] border border-peak-border text-peak rounded-xl hover:bg-white/[0.08] transition"
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