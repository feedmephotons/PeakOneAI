'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Phone, Video, Clock, Calendar, Users, Play, Search,
  PhoneIncoming, PhoneOutgoing, PhoneMissed, MoreVertical,
  Mic, MicOff, VideoOff, Bot, FileText
} from 'lucide-react'

interface Call {
  id: string
  type: 'audio' | 'video'
  direction: 'incoming' | 'outgoing' | 'missed'
  status: 'completed' | 'missed' | 'declined'
  participants: {
    name: string
    initials: string
  }[]
  duration?: number
  timestamp: Date
  hasRecording?: boolean
  hasTranscript?: boolean
  aiSummary?: string
}

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [filter, setFilter] = useState<'all' | 'video' | 'audio' | 'missed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const mockCalls: Call[] = [
      {
        id: '1',
        type: 'video',
        direction: 'outgoing',
        status: 'completed',
        participants: [{ name: 'Sarah Johnson', initials: 'SJ' }, { name: 'John Smith', initials: 'JS' }],
        duration: 2700,
        timestamp: new Date(Date.now() - 3600000),
        hasRecording: true,
        hasTranscript: true,
        aiSummary: 'Discussed Q4 objectives and resource allocation'
      },
      {
        id: '2',
        type: 'audio',
        direction: 'incoming',
        status: 'completed',
        participants: [{ name: 'Mike Wilson', initials: 'MW' }],
        duration: 420,
        timestamp: new Date(Date.now() - 7200000),
        hasTranscript: true
      },
      {
        id: '3',
        type: 'video',
        direction: 'missed',
        status: 'missed',
        participants: [{ name: 'Emily Chen', initials: 'EC' }],
        timestamp: new Date(Date.now() - 14400000)
      },
      {
        id: '4',
        type: 'video',
        direction: 'outgoing',
        status: 'completed',
        participants: [{ name: 'Team Standup', initials: 'TS' }],
        duration: 900,
        timestamp: new Date(Date.now() - 86400000),
        hasRecording: true,
        hasTranscript: true,
        aiSummary: 'Daily standup - reviewed sprint progress, 3 tasks completed'
      },
      {
        id: '5',
        type: 'audio',
        direction: 'incoming',
        status: 'completed',
        participants: [{ name: 'Client Call', initials: 'CC' }],
        duration: 1800,
        timestamp: new Date(Date.now() - 172800000),
        hasTranscript: true,
        aiSummary: 'Client feedback on latest release, discussed next features'
      },
      {
        id: '6',
        type: 'video',
        direction: 'missed',
        status: 'missed',
        participants: [{ name: 'Lisa Park', initials: 'LP' }],
        timestamp: new Date(Date.now() - 259200000)
      },
    ]

    setCalls(mockCalls)
    setLoading(false)
  }, [])

  const getDirectionIcon = (call: Call) => {
    if (call.status === 'missed') return <PhoneMissed className="w-4 h-4 text-red-500" />
    if (call.direction === 'incoming') return <PhoneIncoming className="w-4 h-4 text-green-500" />
    return <PhoneOutgoing className="w-4 h-4 text-blue-500" />
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins >= 60) {
      const hours = Math.floor(mins / 60)
      const remainingMins = mins % 60
      return `${hours}h ${remainingMins}m`
    }
    return `${mins}m ${secs}s`
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const filteredCalls = calls.filter(call => {
    const matchesSearch = call.participants.some(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (filter === 'all') return matchesSearch
    if (filter === 'missed') return matchesSearch && call.status === 'missed'
    return matchesSearch && call.type === filter
  })

  const stats = {
    total: calls.length,
    video: calls.filter(c => c.type === 'video').length,
    audio: calls.filter(c => c.type === 'audio').length,
    missed: calls.filter(c => c.status === 'missed').length,
    totalDuration: calls.reduce((sum, c) => sum + (c.duration || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Call History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage your calls, recordings, and transcripts
            </p>
          </div>
          <Link
            href="/video"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Video className="w-4 h-4" />
            Start Call
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Calls</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.video}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Video Calls</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.audio}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Audio Calls</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-2xl font-bold text-red-500">{stats.missed}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Missed</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatDuration(stats.totalDuration)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Time</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search calls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'video', 'audio', 'missed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Calls List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading calls...</p>
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="p-12 text-center">
              <Phone className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No calls found</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                {searchQuery ? 'Try a different search' : 'Start a call to see it here'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredCalls.map(call => (
                <div key={call.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div className="flex items-center gap-4">
                    {/* Type Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      call.type === 'video'
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      {call.type === 'video' ? (
                        <Video className={`w-6 h-6 ${call.type === 'video' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`} />
                      ) : (
                        <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                      )}
                    </div>

                    {/* Call Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getDirectionIcon(call)}
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {call.participants.map(p => p.name).join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(call.timestamp)}
                        </span>
                        {call.duration && (
                          <span>{formatDuration(call.duration)}</span>
                        )}
                        {call.participants.length > 1 && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {call.participants.length}
                          </span>
                        )}
                      </div>
                      {call.aiSummary && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
                          <Bot className="w-3 h-3 text-purple-500" />
                          {call.aiSummary}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {call.hasRecording && (
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg" title="Play recording">
                          <Play className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                      {call.hasTranscript && (
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg" title="View transcript">
                          <FileText className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
