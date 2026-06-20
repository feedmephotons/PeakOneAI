'use client'

import { Video, CheckSquare, Calendar, Users, ExternalLink, Clock, Brain, TrendingUp } from 'lucide-react'
import { getMockCalls, getMockTasks, getMockMission, MOCK_FILES } from '@/lib/peak/mock'

const PEAK_NOW = Date.parse('2026-06-18T09:00:00.000Z')

interface MeetingReference {
  id: string
  title: string
  date: Date
  type: 'call' | 'meeting'
  context: string // What was said about the file
  timestamp: string // When in the meeting it was mentioned
}

interface RelatedTask {
  id: string
  title: string
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface FileContext {
  fileName: string
  meetingReferences: MeetingReference[]
  relatedTasks: RelatedTask[]
  aiInsights: string[]
  collaborators: string[]
  recentActivity: { user: string; action: string; time: Date }[]
}

interface FilePanelProps {
  name: string
  id: string
  missionId?: string | null
  aiSummary?: string
  aiTags?: string[]
  lastModifiedBy?: string
}

export default function FileContextPanel({ file }: { file?: FilePanelProps }) {
  // Derive context from the canonical Acme Corp dataset, scoped to the file's mission.
  // Fall back to the default canonical board file when nothing is selected.
  const seedFile = MOCK_FILES.find((f) => f.id === 'file-board-deck')
  const missionId = (file?.missionId ?? seedFile?.missionId) || 'mission-launch-product-x'
  const mission = getMockMission(missionId)
  const seedSummary = seedFile?.aiSummary || 'Lisa has indexed this document for fast retrieval.'
  const seedOwnerName = seedFile?.owner?.name || 'Sarah Chen'

  const calls = getMockCalls()
    .filter((c) => c.missionId === missionId)
    .slice(0, 3)
    .map<MeetingReference>((c) => ({
      id: c.id,
      title: c.title,
      date: new Date(c.startTime ?? PEAK_NOW),
      type: 'call',
      context: (c.aiSummary || c.actionItems?.[0] || 'Discussed in this call.').slice(0, 140),
      timestamp: c.durationLabel || '',
    }))

  const statusMap: Record<string, RelatedTask['status']> = {
    TODO: 'TODO', IN_PROGRESS: 'IN_PROGRESS', IN_REVIEW: 'IN_PROGRESS', DONE: 'COMPLETED', COMPLETED: 'COMPLETED',
  }
  const priorityMap: Record<string, RelatedTask['priority']> = {
    LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', URGENT: 'HIGH',
  }
  const tasks = getMockTasks({ missionId })
    .slice(0, 3)
    .map<RelatedTask>((t) => ({
      id: t.id,
      title: t.title,
      status: statusMap[t.status] ?? 'TODO',
      priority: priorityMap[t.priority] ?? 'MEDIUM',
    }))

  const aiInsights = (file?.aiTags && file.aiTags.length
    ? [file?.aiSummary || '', ...(mission ? [`Linked to mission "${mission.name}" (${mission.progress ?? ''}% ${mission.status ?? ''})`] : [])]
    : [
        mission ? `Linked to mission "${mission.name}"` : 'Owned by the Acme Corp team',
        seedSummary,
        'Recommended action: review with the mission owner before the next sync',
      ]
  ).filter(Boolean) as string[]

  const owner = file?.lastModifiedBy || seedOwnerName
  const memberNames = (mission?.members || []).map((m) => m.user?.name).filter(Boolean) as string[]
  const collaborators = Array.from(new Set([owner, ...memberNames])).slice(0, 4)

  const context: FileContext = {
    fileName: file?.name || seedFile?.name || 'Q2 Board Update.pptx',
    meetingReferences: calls,
    relatedTasks: tasks,
    aiInsights,
    collaborators,
    recentActivity: [
      { user: owner, action: 'Updated this file', time: new Date(PEAK_NOW - 3600000) },
      { user: collaborators[1] || 'Mike Wilson', action: 'Downloaded', time: new Date(PEAK_NOW - 7200000) },
      { user: 'Sarah Chen', action: 'Shared with the team', time: new Date(PEAK_NOW - 86400000) },
    ],
  }

  const getTypeIcon = (type: 'call' | 'meeting') => {
    return type === 'call' ? <Video className="w-4 h-4" /> : <Calendar className="w-4 h-4" />
  }

  const getTypeColor = (type: 'call' | 'meeting') => {
    return type === 'call' ? 'bg-peak-primary' : 'bg-peak-blue'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-peak-red/15 text-peak-red ring-1 ring-peak-red/30'
      case 'MEDIUM':
        return 'bg-peak-amber/15 text-peak-amber ring-1 ring-peak-amber/30'
      case 'LOW':
        return 'bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/30'
      default:
        return 'bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-peak-green'
      case 'IN_PROGRESS':
        return 'text-peak-primary-300'
      default:
        return 'text-peak-muted'
    }
  }

  const handleViewMeeting = (meetingId: string, type: 'call' | 'meeting') => {
    if (type === 'call') {
      window.location.href = `/calls/summary/${meetingId}`
    } else {
      window.location.href = `/calendar/${meetingId}`
    }
  }

  const handleViewTask = (taskId: string) => {
    window.location.href = `/tasks?highlight=${taskId}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-peak-primary rounded-xl flex items-center justify-center flex-shrink-0">
          <ExternalLink className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-peak">File Context</h2>
          <p className="text-xs text-peak-muted truncate">Smart insights for {context.fileName}</p>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-peak-glass border border-peak-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-peak-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-peak">Insights</h3>
        </div>
        <ul className="space-y-2">
          {context.aiInsights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-peak-muted">
              <TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0 text-peak-primary-300" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Meeting References */}
      <div>
        <h3 className="text-sm font-semibold text-peak-muted mb-3 flex items-center gap-2">
          <Video className="w-4 h-4" />
          Discussed in Meetings ({context.meetingReferences.length})
        </h3>
        <div className="space-y-3">
          {context.meetingReferences.map((ref) => (
            <button
              key={ref.id}
              onClick={() => handleViewMeeting(ref.id, ref.type)}
              className="w-full text-left group bg-peak-glass rounded-xl p-4 border border-peak-border hover:shadow-lg hover:border-peak-primary/40 transition-all"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className={`w-8 h-8 ${getTypeColor(ref.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {getTypeIcon(ref.type)}
                  <span className="text-white text-xs sr-only">{ref.type}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-peak text-sm truncate group-hover:text-peak-primary-300 transition">
                    {ref.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-peak-muted mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{ref.date.toLocaleDateString(undefined, { timeZone: 'UTC' })}</span>
                    <span>•</span>
                    <span>{ref.timestamp}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-peak-muted italic bg-white/[0.04] border border-peak-border rounded-lg p-2">
                &ldquo;{ref.context}&rdquo;
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Related Tasks */}
      <div>
        <h3 className="text-sm font-semibold text-peak-muted mb-3 flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          Related Tasks ({context.relatedTasks.length})
        </h3>
        <div className="space-y-2">
          {context.relatedTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => handleViewTask(task.id)}
              className="w-full text-left p-3 bg-peak-glass rounded-lg border border-peak-border hover:border-peak-primary/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-sm text-peak truncate group-hover:text-peak-primary-300 transition">
                  {task.title}
                </h4>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <span className={`text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Collaborators */}
      <div>
        <h3 className="text-sm font-semibold text-peak-muted mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Active Collaborators
        </h3>
        <div className="flex items-center gap-2">
          {context.collaborators.map((name, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 bg-peak-glass rounded-full border border-peak-border"
            >
              <div className="w-6 h-6 bg-peak-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                {name[0]}
              </div>
              <span className="text-xs text-peak-muted">{name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-sm font-semibold text-peak-muted mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Activity
        </h3>
        <div className="space-y-2">
          {context.recentActivity.map((activity, i) => (
            <div key={i} className="flex items-start gap-3 p-2 bg-peak-glass border border-peak-border rounded-lg">
              <div className="w-6 h-6 bg-peak-green rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {activity.user[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-peak">
                  <span className="font-medium">{activity.user}</span> {activity.action}
                </p>
                <p className="text-xs text-peak-muted">
                  {activity.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <button
        onClick={() => {
          const event = new CustomEvent('openPeakAI')
          window.dispatchEvent(event)
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.04] text-peak-muted rounded-xl hover:bg-white/[0.04] hover:text-peak transition border border-peak-border"
      >
        <Brain className="w-5 h-5" />
        <span className="font-medium">Ask Lisa About This File</span>
      </button>
    </div>
  )
}
