'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import {
  Brain, Clock, Users, Phone, FileText, CheckSquare,
  MessageSquare, Download, Share2, ArrowLeft, Check, Lock, Video,
} from 'lucide-react'
import { GlassPanel, SectionLabel } from '@/components/peak'
import { getMockCall } from '@/lib/peak/mock'
import type { CallRecord } from '@/lib/peak/types'

// Persist an action item into the same localStorage "tasks" store /tasks reads.
function addTaskToStore(title: string, missionName?: string) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('tasks')
    const tasks = raw ? JSON.parse(raw) : []
    const now = new Date().toISOString()
    tasks.unshift({
      id: `call-task-${Date.now()}-${Math.floor(tasks.length)}`,
      title,
      description: missionName ? `From call · ${missionName}` : 'From call summary',
      status: 'TODO',
      priority: 'HIGH',
      tags: ['from-call'],
      attachments: 0,
      comments: 0,
      createdAt: now,
      updatedAt: now,
    })
    localStorage.setItem('tasks', JSON.stringify(tasks))
  } catch (e) {
    console.error('Failed to add task to store:', e)
  }
}

export default function CallSummaryPage() {
  const params = useParams()
  const router = useRouter()
  const callId = String(params.id)
  const call: CallRecord | undefined = getMockCall(callId)

  const [addedTasks, setAddedTasks] = useState<Record<number, boolean>>({})
  const [shareToast, setShareToast] = useState<string | null>(null)

  if (!call) {
    return (
      <div className="w-full">
        <GlassPanel className="p-12 text-center">
          <Phone className="mx-auto mb-4 h-16 w-16 text-peak-dim" />
          <p className="text-lg font-medium text-peak">Call not found</p>
          <p className="mt-2 text-sm text-peak-muted">No call exists with id “{callId}”.</p>
          <Link
            href="/calls"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-peak-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-peak-primary-600"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Calls
          </Link>
        </GlassPanel>
      </div>
    )
  }

  const startDate = new Date(call.startTime)
  const isVideo = call.participants.length > 2 || /sync|review|standup/i.test(call.title)

  const handleAddToTasks = (item: string, idx: number) => {
    addTaskToStore(item)
    setAddedTasks((prev) => ({ ...prev, [idx]: true }))
  }

  const handleExport = () => {
    // Build a plain-text summary and download it as a real Blob (no fake alert).
    const lines: string[] = []
    lines.push(call.title)
    lines.push(`Date: ${startDate.toLocaleString('en-US', { timeZone: 'UTC' })}`)
    lines.push(`Duration: ${call.durationLabel}`)
    lines.push(`Participants: ${call.participants.map((p) => p.name).join(', ')}`)
    lines.push('')
    if (call.aiSummary) {
      lines.push('SUMMARY')
      lines.push(call.aiSummary)
      lines.push('')
    }
    if (call.actionItems?.length) {
      lines.push('ACTION ITEMS')
      call.actionItems.forEach((a) => lines.push(`- ${a}`))
      lines.push('')
    }
    if (call.transcript?.length) {
      lines.push('TRANSCRIPT')
      call.transcript.forEach((t) => lines.push(`[${t.at ?? ''}] ${t.speaker}: ${t.text}`))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${call.id}-summary.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/calls/summary/${call.id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: call.title, url: shareUrl })
        return
      }
      await navigator.clipboard.writeText(shareUrl)
      setShareToast('Link copied to clipboard')
      setTimeout(() => setShareToast(null), 2200)
    } catch {
      setShareToast('Link copied to clipboard')
      setTimeout(() => setShareToast(null), 2200)
    }
  }

  return (
    <div className="w-full max-w-5xl">
      {/* Back */}
      <button
        onClick={() => router.push('/calls')}
        className="mb-5 inline-flex items-center gap-2 text-sm text-peak-muted transition-colors hover:text-peak"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Calls
      </button>

      {/* Header */}
      <GlassPanel className="mb-6 p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                isVideo ? 'bg-peak-blue/15 text-peak-blue' : 'bg-peak-green/15 text-peak-green'
              } ring-1 ring-white/10`}>
                {isVideo ? <Video className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-peak md:text-3xl">
                  {call.title}
                </h1>
                <p className="text-xs text-peak-dim">Call ID: {call.id}</p>
              </div>
              <span className="ml-2 flex items-center gap-1 rounded-full bg-peak-green/12 px-2.5 py-1 text-xs font-medium text-peak-green ring-1 ring-peak-green/25">
                <Lock className="h-3 w-3" /> Encrypted
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-sm text-peak-muted">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {startDate.toLocaleDateString('en-US', { timeZone: 'UTC' })} at {startDate.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {call.durationLabel}
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {call.participants.length} participants
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleShare}
              className="rounded-lg p-2 text-peak-muted transition-colors hover:bg-white/[0.06] hover:text-peak"
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={handleExport}
              className="rounded-lg p-2 text-peak-muted transition-colors hover:bg-white/[0.06] hover:text-peak"
              title="Export"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Participants */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-peak-muted">Participants:</span>
          <div className="flex flex-wrap items-center gap-2">
            {call.participants.map((p) => (
              <div key={p.id} className="flex items-center gap-2 rounded-full border border-peak-border bg-white/[0.04] px-3 py-1">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-peak-primary/25 text-xs font-bold text-peak-primary-200">
                  {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <span className="text-sm text-peak">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </GlassPanel>

      {shareToast && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-peak-green/30 bg-peak-green/10 px-4 py-2.5 text-sm text-peak-green">
          <Check className="h-4 w-4" /> {shareToast}
        </div>
      )}

      {/* Summary */}
      {call.aiSummary && (
        <>
          <SectionLabel className="mb-3">Lisa&apos;s Summary</SectionLabel>
          <GlassPanel className="mb-6 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-peak-primary/20 text-peak-primary-300 ring-1 ring-peak-primary/20">
                <Brain className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-peak">AI Summary</h2>
            </div>
            <p className="text-sm leading-relaxed text-peak-muted">{call.aiSummary}</p>
          </GlassPanel>
        </>
      )}

      {/* Action Items */}
      {call.actionItems && call.actionItems.length > 0 && (
        <>
          <SectionLabel className="mb-3">Action Items</SectionLabel>
          <GlassPanel className="mb-6 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-peak-green/15 text-peak-green ring-1 ring-peak-green/20">
                <CheckSquare className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-peak">Action Items</h2>
            </div>
            <div className="space-y-3">
              {call.actionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4 rounded-xl border border-peak-border bg-white/[0.03] p-4"
                >
                  <p className="text-sm font-medium text-peak">{item}</p>
                  {addedTasks[idx] ? (
                    <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-peak-green/15 px-3 py-2 text-sm font-medium text-peak-green">
                      <Check className="h-4 w-4" /> Added
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddToTasks(item, idx)}
                      className="shrink-0 rounded-lg bg-peak-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-peak-primary-600"
                    >
                      Add to Tasks
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Link
              href="/tasks"
              className="mt-4 inline-flex items-center gap-2 text-sm text-peak-primary-300 hover:text-peak-primary-200"
            >
              View task board →
            </Link>
          </GlassPanel>
        </>
      )}

      {/* Transcript */}
      {call.transcript && call.transcript.length > 0 && (
        <div id="transcript" className="scroll-mt-24">
          <SectionLabel className="mb-3">Transcript</SectionLabel>
          <GlassPanel className="mb-6 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-peak-blue/15 text-peak-blue ring-1 ring-peak-blue/20">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-peak">Transcript</h2>
            </div>
            <div className="space-y-4">
              {call.transcript.map((line, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 rounded bg-peak-primary/20 px-2 py-0.5 text-xs font-semibold text-peak-primary-200">
                    {line.at}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-peak">{line.speaker}</p>
                    <p className="text-sm text-peak-muted">{line.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      )}

      {/* Recording */}
      <GlassPanel className="mb-6 flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/20">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-peak">
            {call.hasRecording ? 'Recording available' : 'No recording for this call'}
          </p>
          <p className="text-xs text-peak-muted">
            {/* EXTERNAL: needs Twilio + recording media storage to stream actual audio. */}
            {call.hasRecording
              ? 'Audio playback requires recording media (demo: transcript shown above).'
              : 'This call was not recorded.'}
          </p>
        </div>
      </GlassPanel>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/calls')}
          className="text-sm text-peak-muted transition-colors hover:text-peak"
        >
          ← Back to Calls
        </button>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('openPeakAI'))}
          className="flex items-center gap-2 rounded-xl bg-peak-primary px-5 py-2.5 text-sm font-semibold text-white shadow-peak-glow transition-colors hover:bg-peak-primary-600"
        >
          <Brain className="h-4 w-4" />
          Ask Lisa About This Call
        </button>
      </div>
    </div>
  )
}
