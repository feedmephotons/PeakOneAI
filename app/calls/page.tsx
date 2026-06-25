'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  GlassPanel,
  SectionLabel,
  StatTile,
  AskLisaBar,
  SmsComposeModal,
} from '@/components/peak'
import {
  Phone, Video, Clock, Users, Play, Search,
  PhoneIncoming, PhoneOutgoing, PhoneMissed, MoreVertical,
  FileText, Shield, Brain, Lock, MessageSquare, PhoneCall, PhoneOff, MicOff, Mic
} from 'lucide-react'
import { MOCK_CALLS, MOCK_PEOPLE, FIXED_TODAY } from '@/lib/peak/mock'
import type { CallRecord } from '@/lib/peak/types'
import { useSoftphone, formatCallDuration } from '@/lib/peak/use-softphone'

// Canonical Acme calls (seeded from MOCK_CALLS). Deterministic / SSR-safe — no
// Date.now()/random; "now" is anchored to FIXED_TODAY.
const NOW = new Date(FIXED_TODAY).getTime()

function isVideo(call: CallRecord) {
  // Sync/standup style calls render as video; 1:1 voice as audio.
  return call.participants.length > 2 || /sync|review|standup/i.test(call.title)
}

function uiDirection(call: CallRecord): 'incoming' | 'outgoing' | 'missed' {
  if (call.direction === 'MISSED') return 'missed'
  if (call.direction === 'INBOUND') return 'incoming'
  return 'outgoing'
}

// Resolve a phone number for a call's "other" participant via the canonical
// people directory (CallRecord participants don't carry numbers themselves).
function phoneForCall(call: CallRecord): { number: string; name: string } {
  const other =
    call.participants.find((p) => p.name !== 'Sarah Chen') || call.participants[0]
  const name = other?.name || call.title
  const person = MOCK_PEOPLE.find((m) => m.name === name)
  return { number: person?.phoneNumber || '', name }
}

export default function CallsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'video' | 'audio' | 'missed'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Real in-browser softphone + navy SMS composer.
  const phone = useSoftphone()
  const phoneActive =
    phone.status === 'connecting' ||
    phone.status === 'ringing' ||
    phone.status === 'in-call'
  const [smsTarget, setSmsTarget] = useState<{ to: string; name?: string } | null>(null)

  const calls = MOCK_CALLS

  const getDirectionIcon = (call: CallRecord) => {
    const dir = uiDirection(call)
    if (dir === 'missed') return <PhoneMissed className="w-4 h-4 text-peak-red" />
    if (dir === 'incoming') return <PhoneIncoming className="w-4 h-4 text-peak-green" />
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

  const formatTime = (iso: string) => {
    const date = new Date(iso)
    const diff = NOW - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (diff < 0) return date.toLocaleDateString()
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const filteredCalls = calls.filter(call => {
    const haystack = (call.title + ' ' + call.participants.map(p => p.name).join(' ')).toLowerCase()
    const matchesSearch = haystack.includes(searchQuery.toLowerCase())

    if (filter === 'all') return matchesSearch
    if (filter === 'missed') return matchesSearch && uiDirection(call) === 'missed'
    if (filter === 'video') return matchesSearch && isVideo(call)
    return matchesSearch && !isVideo(call) // audio
  })

  const stats = {
    total: calls.length,
    video: calls.filter(isVideo).length,
    audio: calls.filter(c => !isVideo(c)).length,
    missed: calls.filter(c => uiDirection(c) === 'missed').length,
    totalDuration: calls.reduce((sum, c) => sum + (c.durationSec || 0), 0)
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
        {filteredCalls.length === 0 ? (
          <div className="p-12 text-center">
            <Phone className="mx-auto mb-4 h-16 w-16 text-peak-dim" />
            <p className="text-lg font-medium text-peak">No calls found</p>
            <p className="mt-2 text-sm text-peak-muted">
              {searchQuery ? 'Try a different search' : 'Start a call to see it here'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-peak-border">
            {filteredCalls.map(call => {
              const video = isVideo(call)
              return (
              <Link
                key={call.id}
                href={`/calls/summary/${call.id}`}
                className="block p-4 transition-colors hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-4">
                  {/* Type Icon */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    video
                      ? 'bg-peak-blue/15 text-peak-blue'
                      : 'bg-peak-green/15 text-peak-green'
                  }`}>
                    {video ? (
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
                        {call.title}
                      </p>
                      <Lock className="w-3 h-3 shrink-0 text-peak-dim" />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-peak-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(call.startTime)}
                      </span>
                      {call.durationSec > 0 && (
                        <span>{call.durationLabel}</span>
                      )}
                      {call.participants.length > 1 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {call.participants.length}
                        </span>
                      )}
                    </div>
                    {call.aiSummary && (
                      <p className="mt-2 flex items-start gap-2 text-sm text-peak-muted">
                        <Brain className="mt-0.5 w-3 h-3 shrink-0 text-peak-primary-300" />
                        <span className="line-clamp-1">{call.aiSummary}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {(() => {
                      const { number, name } = phoneForCall(call)
                      return (
                        <>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              if (!number) return
                              phone.call(number)
                            }}
                            disabled={!number || phoneActive}
                            className="rounded-lg p-2 text-peak-green transition-colors hover:bg-peak-green/10 disabled:cursor-not-allowed disabled:opacity-40"
                            title={number ? `Call ${name}` : 'No number on file'}
                          >
                            <PhoneCall className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              if (!number) return
                              setSmsTarget({ to: number, name })
                            }}
                            disabled={!number}
                            className="rounded-lg p-2 text-peak-primary-300 transition-colors hover:bg-peak-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
                            title={number ? `Message ${name}` : 'No number on file'}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </>
                      )
                    })()}
                    {call.hasRecording && (
                      <button
                        onClick={(e) => { e.preventDefault(); router.push(`/calls/summary/${call.id}`) }}
                        className="rounded-lg p-2 text-peak-dim transition-colors hover:bg-white/[0.04] hover:text-peak"
                        title="Play recording"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    {call.transcript && call.transcript.length > 0 && (
                      <button
                        onClick={(e) => { e.preventDefault(); router.push(`/calls/summary/${call.id}#transcript`) }}
                        className="rounded-lg p-2 text-peak-dim transition-colors hover:bg-white/[0.04] hover:text-peak"
                        title="View transcript"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); router.push(`/calls/summary/${call.id}`) }}
                      className="rounded-lg p-2 text-peak-dim transition-colors hover:bg-white/[0.04] hover:text-peak"
                      title="Open call summary"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Link>
              )
            })}
          </div>
        )}
      </GlassPanel>

      {/* SMS composer (navy Peak) — posts /api/twilio/sms, surfaces real result */}
      <SmsComposeModal
        open={!!smsTarget}
        onClose={() => setSmsTarget(null)}
        to={smsTarget?.to || ''}
        contactName={smsTarget?.name}
      />

      {/* Floating live-call control (real Twilio Voice SDK state) */}
      {(phoneActive || phone.status === 'initializing' || phone.status === 'error') && (
        <div className="fixed bottom-6 right-6 z-50 w-72">
          <div className="peak-glass p-4 text-peak shadow-peak-glow">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-peak-green/15 text-peak-green ring-1 ring-peak-green/25">
                <Phone className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-peak">
                  {phone.activeNumber || 'Voice line'}
                </p>
                <p className="text-xs text-peak-muted">
                  {phone.status === 'initializing' && 'Setting up your line…'}
                  {phone.status === 'connecting' && 'Connecting…'}
                  {phone.status === 'ringing' && 'Ringing…'}
                  {phone.status === 'in-call' &&
                    `In call · ${formatCallDuration(phone.durationSec)}`}
                  {phone.status === 'error' && (phone.error || 'Call error')}
                </p>
              </div>
            </div>
            {phoneActive && (
              <div className="flex items-center gap-2">
                <button
                  onClick={phone.toggleMute}
                  disabled={phone.status !== 'in-call'}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-40 ${
                    phone.muted
                      ? 'bg-peak-primary/20 text-peak-primary-300'
                      : 'border border-peak-border text-peak-muted hover:text-peak'
                  }`}
                >
                  {phone.muted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  {phone.muted ? 'Unmute' : 'Mute'}
                </button>
                <button
                  onClick={phone.hangup}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-peak-red px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-peak-red/80"
                >
                  <PhoneOff className="h-3.5 w-3.5" />
                  Hang Up
                </button>
              </div>
            )}
            {phone.status === 'error' && (
              <button
                onClick={phone.reset}
                className="mt-1 w-full rounded-lg border border-peak-border px-3 py-2 text-xs font-medium text-peak-muted transition-colors hover:text-peak"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
