/**
 * Peak One — analytics derived from canonical tasks + missions, so /analytics
 * is never all-zeros on a fresh session. Pure / deterministic.
 */

import type { AnalyticsSummary } from '../types'
import { MOCK_MISSIONS } from '../core'
import { MOCK_TASKS } from './tasks'
import { MOCK_FILES } from './files'
import { MOCK_MEETING_DETAILS } from './meetings'
import { FIXED_TODAY } from '../core'

const TODAY = new Date(FIXED_TODAY).getTime()

export function getMockAnalytics(): AnalyticsSummary {
  const tasks = MOCK_TASKS
  const tasksTotal = tasks.length
  const tasksCompleted = tasks.filter((t) => t.status === 'DONE').length
  const tasksInProgress = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW').length
  const tasksOverdue = tasks.filter(
    (t) => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate).getTime() < TODAY,
  ).length
  const completionRate = tasksTotal ? Math.round((tasksCompleted / tasksTotal) * 100) : 0

  const activeMissions = MOCK_MISSIONS.filter((m) => m.status !== 'COMPLETED')
  const avgMissionProgress = activeMissions.length
    ? Math.round(activeMissions.reduce((s, m) => s + m.progress, 0) / activeMissions.length)
    : 0
  const velocity = MOCK_MISSIONS.reduce((s, m) => s + (m.velocity ?? 0), 0)

  // Deterministic 7-day completed series (ending FIXED_TODAY).
  const weeklyCompleted = [
    { day: 'Mon', count: 2 },
    { day: 'Tue', count: 4 },
    { day: 'Wed', count: 3 },
    { day: 'Thu', count: 5 },
    { day: 'Fri', count: 4 },
    { day: 'Sat', count: 1 },
    { day: 'Sun', count: 2 },
  ]

  const priorities = ['URGENT', 'HIGH', 'MEDIUM', 'LOW']
  const byPriority = priorities.map((p) => ({ priority: p, count: tasks.filter((t) => t.priority === p).length }))

  const assigneeMap = new Map<string, number>()
  for (const t of tasks) {
    const name = t.assignee?.name || 'Unassigned'
    assigneeMap.set(name, (assigneeMap.get(name) || 0) + 1)
  }
  const byAssignee = Array.from(assigneeMap.entries()).map(([name, count]) => ({ name, count }))

  return {
    tasksTotal,
    tasksCompleted,
    tasksInProgress,
    tasksOverdue,
    completionRate,
    avgMissionProgress,
    velocity,
    filesCount: MOCK_FILES.filter((f) => !f.deleted).length,
    meetingsCount: Object.keys(MOCK_MEETING_DETAILS).length,
    weeklyCompleted,
    byPriority,
    byAssignee,
  }
}
