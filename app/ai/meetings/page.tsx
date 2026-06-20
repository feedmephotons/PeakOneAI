'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Calendar, Users, Clock, FileText, CheckSquare, Sparkles, Video } from 'lucide-react'
import { getMockMeetingDetails, FIXED_TODAY } from '@/lib/peak/mock'
import type { MeetingDetail } from '@/lib/peak/types'

interface Meeting {
  id: string
  title: string
  date: string
  duration: number // seconds
  transcripts: Array<{ speaker: string; text: string }>
  summary?: string
  actionItems: Array<{ text: string; assignee?: string }>
  participants: number
  missionId?: string | null
  joinUrl?: string | null
}

/** Map a canonical MeetingDetail into the page's meeting shape. */
function fromMeetingDetail(d: MeetingDetail): Meeting {
  return {
    id: d.id,
    title: d.title,
    date: d.startTime,
    duration: d.durationSec ?? 0,
    transcripts: (d.transcript || []).map((t) => ({ speaker: t.speaker, text: t.text })),
    summary: d.aiSummary || undefined,
    actionItems: (d.actionItems || []).map((text) => ({ text })),
    participants: d.attendees?.length ?? 0,
    missionId: d.missionId,
    joinUrl: `/video/room/${d.id}`,
  }
}

/** Canonical Acme meetings, seeded deterministically (SSR-safe). */
function getSeedMeetings(): Meeting[] {
  // Newest first.
  return getMockMeetingDetails()
    .map(fromMeetingDetail)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function MeetingIntelligencePage() {
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Load from localStorage('meetings'); if empty, seed from canon and persist so
  // /video and other surfaces stay consistent. SSR-safe (runs after mount).
  useEffect(() => {
    const loadMeetings = () => {
      try {
        const saved = localStorage.getItem('meetings')
        if (saved) {
          const parsed: Meeting[] = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMeetings([...parsed].reverse())
            return
          }
        }
      } catch {
        /* fall through to seed */
      }
      const seed = getSeedMeetings()
      setMeetings(seed)
      try {
        // Persist in chronological order so a later .reverse() shows newest first.
        localStorage.setItem('meetings', JSON.stringify([...seed].reverse()))
      } catch {
        /* ignore quota */
      }
    }

    loadMeetings()
    window.addEventListener('storage', loadMeetings)
    return () => window.removeEventListener('storage', loadMeetings)
  }, [])

  const filteredMeetings = useMemo(
    () =>
      meetings.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.summary?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [meetings, searchQuery],
  )

  const totalMeetings = meetings.length
  const totalHours = meetings.reduce((acc, m) => acc + (m.duration || 0), 0) / 3600
  const totalActionItems = meetings.reduce((acc, m) => acc + (m.actionItems?.length || 0), 0)
  const transcribedCount = meetings.filter((m) => m.transcripts && m.transcripts.length > 0).length

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    if (mins < 60) return `${mins} min`
    const hours = Math.floor(mins / 60)
    return `${hours}h ${mins % 60}m`
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })

  // Wire "Add All to Task Board" to the canonical localStorage('tasks') store
  // (same store the /tasks board reads). Uses task_ ids so the board treats them
  // as user-created. SSR-safe (only runs on click).
  const addActionItemsToBoard = (meeting: Meeting) => {
    try {
      const savedTasks = localStorage.getItem('tasks')
      const tasks = savedTasks ? JSON.parse(savedTasks) : []
      meeting.actionItems.forEach((item, i) => {
        tasks.push({
          id: `task_${meeting.id}_${i}`,
          title: item.text,
          description: `From meeting: ${meeting.title}`,
          status: 'TODO',
          priority: 'MEDIUM',
          assignee: item.assignee ? { id: 'ai-assigned', name: item.assignee } : undefined,
          tags: ['ai-generated', 'meeting'],
          attachments: 0,
          comments: 0,
          createdAt: new Date(FIXED_TODAY),
          updatedAt: new Date(FIXED_TODAY),
        })
      })
      localStorage.setItem('tasks', JSON.stringify(tasks))
      window.dispatchEvent(new Event('storage'))
      setToast(`Added ${meeting.actionItems.length} tasks to your board`)
      setTimeout(() => setToast(null), 2500)
    } catch (e) {
      console.error('Failed to add tasks to board:', e)
    }
  }

  return (
    <div className="peak-os min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-peak-primary/15">
              <Video className="h-7 w-7 text-peak-primary-300" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-peak">Meeting Intelligence</h1>
              <p className="text-sm text-peak-muted">AI-powered insights from your meetings</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-peak-muted" />
            <input
              type="text"
              placeholder="Search meetings…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-peak-border bg-white/[0.03] py-2 pl-10 pr-4 text-peak placeholder:text-peak-muted focus:border-peak-primary/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            { icon: Calendar, label: 'Total Meetings', value: String(totalMeetings), color: 'text-peak-primary-300' },
            { icon: Clock, label: 'Total Hours', value: `${totalHours.toFixed(1)}h`, color: 'text-peak-blue' },
            { icon: FileText, label: 'Action Items', value: String(totalActionItems), color: 'text-peak-primary-300' },
            { icon: CheckSquare, label: 'Transcribed', value: String(transcribedCount), color: 'text-peak-green' },
          ].map((card) => (
            <div key={card.label} className="peak-glass p-4">
              <card.icon className={`mb-2 h-6 w-6 ${card.color}`} />
              <p className="text-sm text-peak-muted">{card.label}</p>
              <p className="text-2xl font-bold text-peak">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Meetings list */}
        <div className="peak-glass overflow-hidden p-0">
          <div className="border-b border-peak-border p-6">
            <h3 className="font-semibold text-peak">
              {searchQuery ? `Search Results (${filteredMeetings.length})` : 'All Meetings'}
            </h3>
          </div>

          {filteredMeetings.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="mx-auto mb-4 h-16 w-16 text-peak-dim" />
              <h3 className="mb-2 text-lg font-medium text-peak">
                {meetings.length === 0 ? 'No meetings yet' : 'No meetings found'}
              </h3>
              <p className="text-sm text-peak-muted">
                {meetings.length === 0
                  ? 'Start a video call with AI features to see meeting history here'
                  : 'Try a different search query'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--peak-border)]">
              {filteredMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="cursor-pointer p-6 transition hover:bg-white/[0.03]"
                  onClick={() => setSelectedMeeting(meeting)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-peak-primary/15">
                      <FileText className="h-6 w-6 text-peak-primary-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-peak">{meeting.title}</h4>
                      <p className="mt-1 text-sm text-peak-muted">{formatDate(meeting.date)}</p>
                      <div className="mt-2 flex items-center gap-4">
                        <span className="flex items-center gap-1 text-xs text-peak-muted">
                          <Users className="h-3 w-3" />
                          {meeting.participants} participant{meeting.participants !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-peak-muted">
                          <Clock className="h-3 w-3" />
                          {formatDuration(meeting.duration)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-peak-muted">
                          <CheckSquare className="h-3 w-3" />
                          {meeting.actionItems?.length || 0} action items
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {meeting.transcripts && meeting.transcripts.length > 0 && (
                          <span className="rounded-full bg-peak-green/15 px-2 py-1 text-xs text-peak-green">
                            Transcribed ({meeting.transcripts.length} lines)
                          </span>
                        )}
                        {meeting.summary && (
                          <span className="rounded-full bg-peak-blue/15 px-2 py-1 text-xs text-peak-blue">
                            Summary ready
                          </span>
                        )}
                        {meeting.actionItems && meeting.actionItems.length > 0 && (
                          <span className="rounded-full bg-peak-primary/15 px-2 py-1 text-xs text-peak-primary-300">
                            Tasks extracted
                          </span>
                        )}
                      </div>
                      {meeting.summary && (
                        <div className="mt-3 rounded-lg border border-peak-border bg-white/[0.02] p-3">
                          <p className="line-clamp-2 text-xs text-peak-muted">{meeting.summary.split('\n')[0]}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="peak-glass max-h-[85vh] w-full max-w-4xl overflow-y-auto p-0">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-peak-border bg-peak-2/95 p-6 backdrop-blur">
              <div>
                <h2 className="text-2xl font-semibold text-peak">{selectedMeeting.title}</h2>
                <p className="mt-1 text-sm text-peak-muted">{formatDate(selectedMeeting.date)}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedMeeting.joinUrl && (
                  <button
                    onClick={() => router.push(selectedMeeting.joinUrl as string)}
                    className="flex items-center gap-2 rounded-lg border border-peak-border px-3 py-1.5 text-sm text-peak-muted transition hover:bg-white/[0.06] hover:text-peak"
                  >
                    <Video className="h-4 w-4" /> Open room
                  </button>
                )}
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="rounded-lg p-2 text-peak-muted transition hover:bg-white/[0.06] hover:text-peak"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {selectedMeeting.summary && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-peak">
                    <Sparkles className="h-4 w-4 text-peak-primary-300" /> Summary
                  </h3>
                  <div className="whitespace-pre-wrap rounded-lg border border-peak-border bg-peak-primary/[0.06] p-4 text-sm text-peak">
                    {selectedMeeting.summary}
                  </div>
                </div>
              )}

              {selectedMeeting.actionItems && selectedMeeting.actionItems.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-peak">Action Items</h3>
                    <button
                      onClick={() => addActionItemsToBoard(selectedMeeting)}
                      className="rounded-lg bg-peak-primary px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_var(--peak-glow)] transition hover:bg-peak-primary-600"
                    >
                      Add All to Task Board
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedMeeting.actionItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 rounded-lg border border-peak-border bg-white/[0.02] p-3">
                        <CheckSquare className="mt-0.5 h-4 w-4 text-peak-primary-300" />
                        <div>
                          <p className="text-sm text-peak">{item.text}</p>
                          {item.assignee && <p className="mt-1 text-xs text-peak-muted">Assignee: {item.assignee}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMeeting.transcripts && selectedMeeting.transcripts.length > 0 && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-peak">Full Transcript</h3>
                  <div className="peak-scrollbar max-h-96 space-y-3 overflow-y-auto">
                    {selectedMeeting.transcripts.map((t, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-peak-primary/20 text-xs font-bold text-peak-primary-300">
                          {t.speaker[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-peak">{t.speaker}</p>
                          <p className="mt-1 text-sm text-peak-muted">{t.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-peak-green/30 bg-peak-2 px-4 py-3 text-sm font-medium text-peak shadow-xl">
          <span className="text-peak-green">✓</span> {toast}
        </div>
      )}
    </div>
  )
}
