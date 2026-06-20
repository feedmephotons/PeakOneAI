/**
 * Peak One — canonical mock barrel.
 *
 * This is the ONE entrypoint every page / API route reseeds from. It re-exports:
 *   - the core fixtures (people, missions, notes, relationships, daily brief)
 *     from './core', and
 *   - the workspace fixtures (tasks, files, messages, calls, emails, calendar,
 *     notifications, activity, analytics, settings/automations/brand-voice)
 *     from './workspace/*'.
 *
 * Import everything from here ('@/lib/peak/mock'). Inside the workspace modules
 * themselves, import base data from './core' (NOT this barrel) to avoid a
 * circular-evaluation crash.
 */

// ----------------------------------------------------------------------------
// Core fixtures (people, missions, notes, relationships, daily brief)
// ----------------------------------------------------------------------------

export {
  // world constants
  FIXED_TODAY,
  FIXED_TODAY_DATE,
  ACME_TEAM_SIZE,
  ACME_COMPANY,
  ACME_WORKSPACE_ID,
  // people / users
  MOCK_USER,
  MOCK_TEAM,
  MOCK_PEOPLE,
  // missions
  MOCK_MISSION,
  MOCK_MISSIONS,
  MOCK_MISSION_RECOMMENDATIONS,
  // notes / memory
  MOCK_NOTES,
  MOCK_NOTE_CONNECTIONS,
  MOCK_VOICE_NOTES,
  // daily brief
  MOCK_STATS,
  MOCK_BRIEFING_LINES,
  MOCK_PRIORITIES,
  MOCK_MEETINGS,
  MOCK_ACTIVITY,
  MOCK_QUICK_ACTIONS,
  MOCK_INSIGHT,
  MOCK_DAILY_BRIEF,
  // relationships
  MOCK_RELATIONSHIP_PROFILES,
  MOCK_RELATIONSHIP_BRIEFS,
  // getters
  getMockNotes,
  getMockNote,
  getMockNoteConnections,
  searchMock,
  getMockMissions,
  getMockMission,
  getMockRelationshipProfile,
  getMockRelationshipBrief,
  getMockDailyBrief,
} from './core'

// ----------------------------------------------------------------------------
// Workspace fixtures (tasks, files, messages, calls, emails, calendar,
// notifications, activity, analytics, settings)
// ----------------------------------------------------------------------------

export {
  MOCK_TASKS,
  MOCK_TASK_TAGS,
  getMockTasks,
  getMockTask,
  getMockTaskTags,
} from './workspace/tasks'

export { MOCK_FILES, getMockFiles, getMockFile } from './workspace/files'

export {
  MOCK_MESSAGE_THREADS,
  getMockThreads,
  getMockThread,
} from './workspace/messages'

export { MOCK_CALLS, getMockCalls, getMockCall } from './workspace/calls'

export { MOCK_EMAILS, getMockEmails, getMockEmail } from './workspace/emails'

export {
  MOCK_MEETING_DETAILS,
  getMockMeetingDetails,
  getMockMeetingDetail,
  MOCK_CALENDAR_EVENTS,
  getMockCalendarEvents,
  getMockCalendarEvent,
} from './workspace/meetings'

export {
  MOCK_NOTIFICATIONS,
  getMockNotifications,
  getMockUnreadCount,
  MOCK_ACTIVITY_FEED,
  getMockActivity,
  getActivityHref,
} from './workspace/notifications'

export { getMockAnalytics } from './workspace/analytics'

export {
  MOCK_ORG_IDENTITY,
  getMockOrgIdentity,
  MOCK_AUTOMATIONS,
  getMockAutomations,
  MOCK_BRAND_VOICE,
  getMockBrandVoice,
} from './workspace/settings'
