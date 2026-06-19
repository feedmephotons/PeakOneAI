'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  GlassPanel,
  SectionLabel,
  StatTile,
  AskLisaBar,
} from '@/components/peak'
import {
  Phone, Video, Clock, Users, Play, Search,
  PhoneIncoming, PhoneOutgoing, PhoneMissed, MoreVertical,
  FileText, Shield, Brain, Lock
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
    if (call.status === 'missed') return <PhoneMissed className="w-4 h-4 text-peak-red" />
    if (call.direction === 'incoming') return <PhoneIncoming className="w-4 h-4 text-peak-green" />
    return <PhoneOutgoing className="w-4 h-4 text-peak-primary-300" />
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
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-peak-muted">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-peak-primary/15 text-peak-primary-300">
              <Phone className="h-3 w-3" />
            </span>
            Secure Calls
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-peak md:text-4xl">
              Secure Calls
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-peak-green/12 px-2.5 py-1 text-xs font-medium text-peak-green ring-1 ring-peak-green/25">
              <Lock className="w-3 h-3" />
              End-to-End Encrypted
            </span>
          </div>
          <p className="mt-2 max-w-xl text-sm text-peak-muted">
            Encrypted voice and video calls with AI-powered transcription and summaries
          </p>
        </div>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div className="hidden w-64 lg:block">
            <AskLisaBar placeholder="Ask Lisa about a call…" />
          </div>
          <Link
            href="/video"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-peak-primary px-4 py-2.5 text-sm font-semibold text-white shadow-peak-glow transition-colors hover:bg-peak-primary-600"
          >
            <Video className="w-4 h-4" />
            Start Call
          </Link>
        </div>
      </div>

      {/* Security Banner */}
      <GlassPanel className="mb-8 flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/20">
          <Shield className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-peak">Secure Communication</p>
          <p className="text-xs text-peak-muted">All calls are encrypted in transit and at rest. Recordings and transcripts are stored securely in your workspace.</p>
        </div>
      </GlassPanel>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatTile variant="tile" value={stats.total} label="Total Calls" tone="primary" />
        <StatTile variant="tile" value={stats.video} label="Video Calls" tone="blue" />
        <StatTile variant="tile" value={stats.audio} label="Audio Calls" tone="green" />
        <StatTile variant="tile" value={stats.missed} label="Missed" tone="red" />
        <StatTile variant="tile" value={formatDuration(stats.totalDuration)} label="Total Time" tone="neutral" />
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-peak-dim" />
          <input
            type="text"
            placeholder="Search calls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-peak-border bg-white/[0.04] py-3 pl-12 pr-4 text-peak placeholder:text-peak-dim focus:border-peak-primary/50 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-peak-border bg-white/[0.02] p-1">
          {(['all', 'video', 'audio', 'missed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-peak-primary/20 text-peak-primary-300'
                  : 'text-peak-muted hover:text-peak'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Calls List */}
      <SectionLabel className="mb-3">Call History</SectionLabel>
      <GlassPanel className="overflow-hidden p-0">
        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-peak-primary border-t-transparent"></div>
            <p className="text-peak-muted">Loading calls...</p>
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="p-12 text-center">
            <Phone className="mx-auto mb-4 h-16 w-16 text-peak-dim" />
            <p className="text-lg font-medium text-peak">No calls found</p>
            <p className="mt-2 text-sm text-peak-muted">
              {searchQuery ? 'Try a different search' : 'Start a call to see it here'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-peak-border">
            {filteredCalls.map(call => (
              <div key={call.id} className="p-4 transition-colors hover:bg-white/[0.04]">
                <div className="flex items-center gap-4">
                  {/* Type Icon */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    call.type === 'video'
                      ? 'bg-peak-blue/15 text-peak-blue'
                      : 'bg-peak-green/15 text-peak-green'
                  }`}>
                    {call.type === 'video' ? (
                      <Video className="w-6 h-6" />
                    ) : (
                      <Phone className="w-6 h-6" />
                    )}
                  </div>

                  {/* Call Info */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      {getDirectionIcon(call)}
                      <p className="truncate font-medium text-peak">
                        {call.participants.map(p => p.name).join(', ')}
                      </p>
                      <Lock className="w-3 h-3 shrink-0 text-peak-dim" />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-peak-muted">
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
                      <p className="mt-2 flex items-center gap-2 text-sm text-peak-muted">
                        <Brain className="w-3 h-3 text-peak-primary-300" />
                        {call.aiSummary}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {call.hasRecording && (
                      <button className="rounded-lg p-2 text-peak-dim transition-colors hover:bg-white/[0.04] hover:text-peak" title="Play recording">
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    {call.hasTranscript && (
                      <button className="rounded-lg p-2 text-peak-dim transition-colors hover:bg-white/[0.04] hover:text-peak" title="View transcript">
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                    <button className="rounded-lg p-2 text-peak-dim transition-colors hover:bg-white/[0.04] hover:text-peak">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassPanel>
    </div>
  )
}
