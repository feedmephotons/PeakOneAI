/**
 * Peak One — meeting details (transcripts, AI summaries, action items,
 * durations, recordings) for the two canonical MOCK_MEETINGS, plus calendar
 * events derived from them, pinned to the 2026-06-18 world. Deterministic.
 */

import type { CalendarEvent, MeetingDetail, UserRef } from '../types'
import { MOCK_MEETINGS, MOCK_TEAM, MOCK_USER } from '../core'
import { getMockCall } from './calls'

const SARAH = MOCK_USER
const LISA = MOCK_TEAM[2]
const DAVID = MOCK_TEAM[3]
const TOM: UserRef = { id: 'contact-tom-becker', name: 'Tom Becker', email: 'tom.becker@acmecorp.com', role: 'Legal Counsel' }

/**
 * Meeting details keyed by meeting id. Transcripts/summaries reuse the matching
 * call records so /calls, /video, /meeting/[id] and /ai/meetings all agree.
 */
export const MOCK_MEETING_DETAILS: Record<string, MeetingDetail> = {
  'meeting-lisa-briefing': {
    ...MOCK_MEETINGS[0],
    durationSec: 1530,
    durationLabel: '25m 30s',
    transcript: getMockCall('call-q2-campaign')?.transcript,
    aiSummary: getMockCall('call-q2-campaign')?.aiSummary,
    actionItems: getMockCall('call-q2-campaign')?.actionItems,
    hasRecording: true,
    recordingUrl: null,
    missionId: 'mission-q2-growth',
  },
  'meeting-launch-sync': {
    ...MOCK_MEETINGS[1],
    durationSec: 2640,
    durationLabel: '44m 00s',
    transcript: getMockCall('call-launch-sync')?.transcript,
    aiSummary: getMockCall('call-launch-sync')?.aiSummary,
    actionItems: getMockCall('call-launch-sync')?.actionItems,
    hasRecording: true,
    recordingUrl: null,
    missionId: 'mission-launch-product-x',
  },
}

export function getMockMeetingDetails(): MeetingDetail[] {
  return Object.values(MOCK_MEETING_DETAILS)
}

export function getMockMeetingDetail(id: string): MeetingDetail | undefined {
  return MOCK_MEETING_DETAILS[id]
}

// ----------------------------------------------------------------------------
// Calendar events — derived from the meetings, pinned to 2026-06-18, plus a few
// focus/deadline blocks so /calendar is not empty.
// ----------------------------------------------------------------------------

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-lisa-briefing',
    title: 'Q2 Campaign Review with Lisa Park',
    type: 'MEETING',
    start: '2026-06-18T18:00:00.000Z',
    end: '2026-06-18T18:30:00.000Z',
    location: 'Zoom',
    attendees: [SARAH, LISA],
    joinUrl: '/video/room/meeting-lisa-briefing',
    meetingId: 'meeting-lisa-briefing',
    color: '#7c3aed',
    description: 'Campaign is 18% above target. Decide whether to commit the launch-week sequence now.',
  },
  {
    id: 'evt-launch-sync',
    title: 'Launch Sync (Eng + Legal)',
    type: 'MEETING',
    start: '2026-06-18T20:00:00.000Z',
    end: '2026-06-18T20:45:00.000Z',
    location: 'War Room',
    attendees: [SARAH, DAVID, TOM],
    joinUrl: '/video/room/meeting-launch-sync',
    meetingId: 'meeting-launch-sync',
    color: '#dc2626',
    description: 'Resolve the legal review timeline before GA candidate.',
  },
  {
    id: 'evt-focus-board',
    title: 'Focus: Q2 board deck',
    type: 'FOCUS',
    start: '2026-06-18T15:00:00.000Z',
    end: '2026-06-18T16:30:00.000Z',
    location: null,
    attendees: [SARAH],
    joinUrl: null,
    meetingId: null,
    color: '#2563eb',
    description: 'Heads-down on the Q2 board update deck.',
  },
  {
    id: 'evt-deadline-comms',
    title: 'Due: approve launch-week comms calendar',
    type: 'DEADLINE',
    start: '2026-06-18T22:00:00.000Z',
    end: null,
    location: null,
    attendees: [SARAH, LISA],
    joinUrl: null,
    meetingId: null,
    color: '#ea580c',
    description: 'Lisa Park needs sign-off to lock the launch-week sequence.',
  },
  {
    id: 'evt-standup-eng',
    title: 'Engineering standup',
    type: 'MEETING',
    start: '2026-06-19T09:00:00.000Z',
    end: '2026-06-19T09:15:00.000Z',
    location: 'Zoom',
    attendees: [SARAH, DAVID],
    joinUrl: '/video/room/standup-eng',
    meetingId: null,
    color: '#0891b2',
    description: 'Daily eng standup — GA candidate burn-down.',
  },
]

export function getMockCalendarEvents(): CalendarEvent[] {
  return MOCK_CALENDAR_EVENTS
}

export function getMockCalendarEvent(id: string): CalendarEvent | undefined {
  return MOCK_CALENDAR_EVENTS.find((e) => e.id === id)
}
