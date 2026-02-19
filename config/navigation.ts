// Peak One Navigation Configuration
// 3-Layer Architecture: Core Nav | Create Hub | Command Bar
// Mode-Based UI: Personal / Team / Enterprise

import type { UIMode } from '@/stores/app-store'

export interface NavItem {
  id: string
  label: string
  icon: string  // lucide-react icon name
  href: string
  description?: string
  badge?: string | number
  modes?: UIMode[]  // which UI modes show this item (undefined = all modes)
}

// Layer 1: Core OS Navigation (top nav bar, max 5-6 items)
// Each item tagged with which modes it should appear in
export const CORE_NAV: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'Home', href: '/', description: 'Dashboard overview' },
  // Personal mode items
  { id: 'calls', label: 'Calls', icon: 'Phone', href: '/calls', description: 'Phone and video calls', modes: ['personal'] },
  { id: 'files-personal', label: 'Files', icon: 'FolderOpen', href: '/files', description: 'My documents', modes: ['personal'] },
  { id: 'calendar-personal', label: 'Calendar', icon: 'Calendar', href: '/calendar', description: 'My schedule', modes: ['personal'] },
  { id: 'tasks-personal', label: 'Tasks', icon: 'CheckSquare', href: '/tasks', description: 'My to-dos', modes: ['personal'] },
  { id: 'email-personal', label: 'Email', icon: 'Mail', href: '/email', description: 'Email drafts', modes: ['personal'] },
  // Team mode items
  { id: 'workspaces', label: 'Workspaces', icon: 'Users', href: '/teams', description: 'Team collaboration', modes: ['team'] },
  { id: 'threads', label: 'Threads', icon: 'MessageSquare', href: '/messages', description: 'Messages and chat', modes: ['team'] },
  { id: 'meetings', label: 'Meetings', icon: 'Video', href: '/meeting', description: 'Video and calls', modes: ['team'] },
  { id: 'files', label: 'Files', icon: 'FolderOpen', href: '/files', description: 'Shared documents', modes: ['team'] },
  { id: 'tasks', label: 'Tasks', icon: 'CheckSquare', href: '/tasks', description: 'Shared tasks and boards', modes: ['team'] },
  // Enterprise mode items
  { id: 'workspaces-ent', label: 'Workspaces', icon: 'Users', href: '/teams', description: 'Team collaboration', modes: ['enterprise'] },
  { id: 'threads-ent', label: 'Threads', icon: 'MessageSquare', href: '/messages', description: 'Messages', modes: ['enterprise'] },
  { id: 'meetings-ent', label: 'Meetings', icon: 'Video', href: '/meeting', description: 'Video and calls', modes: ['enterprise'] },
  { id: 'admin', label: 'Admin', icon: 'Shield', href: '/settings/org', description: 'Administration', modes: ['enterprise'] },
  { id: 'governance', label: 'Governance', icon: 'Scale', href: '/settings/security', description: 'Compliance and governance', modes: ['enterprise'] },
]

// Helper: filter nav items by current UI mode
export function getNavForMode(mode: UIMode): NavItem[] {
  return CORE_NAV.filter(item => !item.modes || item.modes.includes(mode))
}

// Layer 2: Power Features (accessible via Create button / Command bar)
export interface CreateAction {
  id: string
  label: string
  icon: string
  href?: string
  action?: string  // custom action identifier
  description: string
  shortcut?: string
  category: 'create' | 'navigate' | 'ai'
  modes?: UIMode[]
}

export const CREATE_ACTIONS: CreateAction[] = [
  // Create actions (available in all modes)
  { id: 'new-message', label: 'New Message', icon: 'MessageSquare', href: '/messages/new', description: 'Start a conversation', shortcut: 'N', category: 'create' },
  { id: 'new-meeting', label: 'New Meeting', icon: 'Video', href: '/meeting/new', description: 'Schedule or start a call', shortcut: 'M', category: 'create' },
  { id: 'new-task', label: 'New Task', icon: 'CheckSquare', href: '/tasks?new=true', description: 'Create a task', shortcut: 'T', category: 'create' },
  { id: 'upload-file', label: 'Upload File', icon: 'Upload', href: '/files/upload', description: 'Upload documents or media', shortcut: 'U', category: 'create' },
  { id: 'new-doc', label: 'New Document', icon: 'FileText', href: '/docs/new', description: 'Create a document', category: 'create' },

  // Navigate to power features
  { id: 'deck', label: 'Deck', icon: 'Presentation', href: '/deck', description: 'Pitch decks and slides', category: 'navigate', modes: ['team', 'enterprise'] },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3', href: '/analytics', description: 'Insights and reports', category: 'navigate', modes: ['team', 'enterprise'] },
  { id: 'email', label: 'Email', icon: 'Mail', href: '/email', description: 'Email inbox and outreach', category: 'navigate' },
  { id: 'templates', label: 'Templates', icon: 'LayoutTemplate', href: '/templates', description: 'Reusable workflows', category: 'navigate', modes: ['team', 'enterprise'] },
  { id: 'automation', label: 'Automation', icon: 'Zap', href: '/automation', description: 'Rules and triggers', category: 'navigate', modes: ['team', 'enterprise'] },
  { id: 'calendar', label: 'Calendar', icon: 'Calendar', href: '/calendar', description: 'Schedule and events', category: 'navigate' },
  { id: 'contacts', label: 'Contacts', icon: 'Contact', href: '/contacts', description: 'People directory', category: 'navigate', modes: ['team', 'enterprise'] },

  // AI features
  { id: 'ask-ai', label: 'Ask Lisa', icon: 'Brain', action: 'openPeakAI', description: 'Chat with AI assistant', shortcut: 'J', category: 'ai' },
  { id: 'transcribe', label: 'Transcribe', icon: 'Mic', href: '/ai/transcriptions', description: 'Audio to text', category: 'ai' },
  { id: 'summarize', label: 'Summarize', icon: 'FileSearch', href: '/ai/summaries', description: 'AI-generated summaries', category: 'ai' },
]

// Helper: filter create actions by current UI mode
export function getCreateActionsForMode(mode: UIMode): CreateAction[] {
  return CREATE_ACTIONS.filter(item => !item.modes || item.modes.includes(mode))
}

// Layer 3: Enterprise/Admin (hidden under Settings)
export const ADMIN_NAV: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: 'Settings', href: '/settings', description: 'Account preferences' },
  { id: 'org', label: 'Organization', icon: 'Building2', href: '/settings/org', description: 'Team settings', modes: ['team', 'enterprise'] },
  { id: 'billing', label: 'Billing', icon: 'CreditCard', href: '/settings/billing', description: 'Plans and billing' },
  { id: 'security', label: 'Security', icon: 'Shield', href: '/settings/security', description: 'Privacy controls', modes: ['team', 'enterprise'] },
  { id: 'integrations', label: 'Integrations', icon: 'Plug', href: '/settings/integrations', description: 'Connected apps', modes: ['team', 'enterprise'] },
  { id: 'activity-log', label: 'Activity Log', icon: 'Activity', href: '/activity', description: 'Audit trail', modes: ['enterprise'] },
  { id: 'help', label: 'Help Center', icon: 'HelpCircle', href: '/help', description: 'Get support' },
  { id: 'api-docs', label: 'API Docs', icon: 'BookOpen', href: '/docs', description: 'Developer documentation', modes: ['enterprise'] },
]

// Command bar items (searchable via Cmd+K)
export const COMMAND_BAR_ITEMS = [
  ...CORE_NAV.map(item => ({ ...item, category: 'navigation' as const })),
  ...CREATE_ACTIONS,
  ...ADMIN_NAV.map(item => ({ ...item, category: 'settings' as const })),
]

// Legacy compatibility - keep AppMode type for app-store
export type AppMode = 'dashboard' | 'communication' | 'ai-assistant' | 'projects' | 'storage' | 'integrations' | 'analytics' | 'settings'

// UI Mode metadata for the ModeSwitcher
export const UI_MODE_META: Record<UIMode, { label: string; description: string }> = {
  personal: { label: 'Personal', description: 'Individual-focused view' },
  team: { label: 'Team', description: 'Collaborative workspace' },
  enterprise: { label: 'Enterprise', description: 'Full admin and governance' },
}
