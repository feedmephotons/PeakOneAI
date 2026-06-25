// Peak One — shared primitive library.
// Navy / electric-purple "operating system" design system.
// Import from '@/components/peak'. All components are presentational; pass data via props.

export { default as PeakShell } from './PeakShell'
export type { PeakShellProps } from './PeakShell'

export { default as GlassPanel } from './GlassPanel'
export type { GlassPanelProps } from './GlassPanel'

export { default as SectionLabel } from './SectionLabel'
export type { SectionLabelProps } from './SectionLabel'

export { default as StatTile } from './StatTile'
export type { StatTileProps, PeakTone } from './StatTile'

export { default as ProgressRing } from './ProgressRing'
export type { ProgressRingProps } from './ProgressRing'

export { default as MissionTimeline } from './MissionTimeline'
export type { MissionTimelineProps, MissionTimelineStep, MilestoneState } from './MissionTimeline'

export { default as LisaBriefingCard } from './LisaBriefingCard'
export type { LisaBriefingCardProps, BriefingLine, BriefingSegment } from './LisaBriefingCard'

export { default as PriorityList } from './PriorityList'
export type { PriorityListProps, PriorityItem } from './PriorityList'

export { default as ActivityFeed } from './ActivityFeed'
export type { ActivityFeedProps, ActivityItem, ActivityTone } from './ActivityFeed'

export { default as UpcomingMeetings } from './UpcomingMeetings'
export type { UpcomingMeetingsProps, MeetingItem } from './UpcomingMeetings'

export { default as QuickActions } from './QuickActions'
export type { QuickActionsProps, QuickAction } from './QuickActions'

export { default as ContextPanel } from './ContextPanel'
export type { ContextPanelProps, ContextSection, ContextConnection } from './ContextPanel'

export { default as AskLisaBar } from './AskLisaBar'
export type { AskLisaBarProps } from './AskLisaBar'

export { default as LisaInsight } from './LisaInsight'
export type { LisaInsightProps } from './LisaInsight'

export { default as SmsComposeModal } from './SmsComposeModal'
export type { SmsComposeModalProps } from './SmsComposeModal'
