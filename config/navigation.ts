// Peak One Navigation Configuration
// 3-Layer Architecture: Core Nav | Create Hub | Command Bar

export interface NavItem {
  id: string
  label: string
  icon: string  // lucide-react icon name
  href: string
  description?: string
  badge?: string | number
}

// Layer 1: Core OS Navigation (top nav bar, max 5-6 items)
export const CORE_NAV: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'Home', href: '/', description: 'Dashboard overview' },
  { id: 'workspaces', label: 'Workspaces', icon: 'Users', href: '/teams', description: 'Team collaboration' },
  { id: 'meetings', label: 'Meetings', icon: 'Video', href: '/meeting', description: 'Video and calls' },
  { id: 'threads', label: 'Threads', icon: 'MessageSquare', href: '/messages', description: 'Messages and chat' },
  { id: 'files', label: 'Files', icon: 'FolderOpen', href: '/files', description: 'Documents and storage' },
  { id: 'tasks', label: 'Tasks', icon: 'CheckSquare', href: '/tasks', description: 'Projects and boards' },
]

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
}

export const CREATE_ACTIONS: CreateAction[] = [
  // Create actions
  { id: 'new-message', label: 'New Message', icon: 'MessageSquare', href: '/messages/new', description: 'Start a conversation', shortcut: 'N', category: 'create' },
  { id: 'new-meeting', label: 'New Meeting', icon: 'Video', href: '/meeting/new', description: 'Schedule or start a call', shortcut: 'M', category: 'create' },
  { id: 'new-task', label: 'New Task', icon: 'CheckSquare', href: '/tasks?new=true', description: 'Create a task', shortcut: 'T', category: 'create' },
  { id: 'upload-file', label: 'Upload File', icon: 'Upload', href: '/files/upload', description: 'Upload documents or media', shortcut: 'U', category: 'create' },
  { id: 'new-doc', label: 'New Document', icon: 'FileText', href: '/docs/new', description: 'Create a document', category: 'create' },

  // Navigate to power features
  { id: 'deck', label: 'Deck', icon: 'Presentation', href: '/deck', description: 'Pitch decks and slides', category: 'navigate' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3', href: '/analytics', description: 'Insights and reports', category: 'navigate' },
  { id: 'email', label: 'Email', icon: 'Mail', href: '/email', description: 'Email inbox and outreach', category: 'navigate' },
  { id: 'templates', label: 'Templates', icon: 'LayoutTemplate', href: '/templates', description: 'Reusable workflows', category: 'navigate' },
  { id: 'automation', label: 'Automation', icon: 'Zap', href: '/automation', description: 'Rules and triggers', category: 'navigate' },
  { id: 'calendar', label: 'Calendar', icon: 'Calendar', href: '/calendar', description: 'Schedule and events', category: 'navigate' },
  { id: 'contacts', label: 'Contacts', icon: 'Contact', href: '/contacts', description: 'People directory', category: 'navigate' },

  // AI features
  { id: 'ask-ai', label: 'Ask Lisa', icon: 'Brain', action: 'openPeakAI', description: 'Chat with AI assistant', shortcut: 'J', category: 'ai' },
  { id: 'transcribe', label: 'Transcribe', icon: 'Mic', href: '/ai/transcriptions', description: 'Audio to text', category: 'ai' },
  { id: 'summarize', label: 'Summarize', icon: 'FileSearch', href: '/ai/summaries', description: 'AI-generated summaries', category: 'ai' },
]

// Layer 3: Enterprise/Admin (hidden under Settings)
export const ADMIN_NAV: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: 'Settings', href: '/settings', description: 'Account preferences' },
  { id: 'org', label: 'Organization', icon: 'Building2', href: '/settings/org', description: 'Team settings' },
  { id: 'billing', label: 'Billing', icon: 'CreditCard', href: '/settings/billing', description: 'Plans and billing' },
  { id: 'security', label: 'Security', icon: 'Shield', href: '/settings/security', description: 'Privacy controls' },
  { id: 'integrations', label: 'Integrations', icon: 'Plug', href: '/settings/integrations', description: 'Connected apps' },
  { id: 'activity-log', label: 'Activity Log', icon: 'Activity', href: '/activity', description: 'Audit trail' },
  { id: 'help', label: 'Help Center', icon: 'HelpCircle', href: '/help', description: 'Get support' },
  { id: 'api-docs', label: 'API Docs', icon: 'BookOpen', href: '/docs', description: 'Developer documentation' },
]

// Command bar items (searchable via Cmd+K)
export const COMMAND_BAR_ITEMS = [
  ...CORE_NAV.map(item => ({ ...item, category: 'navigation' as const })),
  ...CREATE_ACTIONS,
  ...ADMIN_NAV.map(item => ({ ...item, category: 'settings' as const })),
]

// Legacy compatibility - keep AppMode type for app-store
export type AppMode = 'dashboard' | 'communication' | 'ai-assistant' | 'projects' | 'storage' | 'integrations' | 'analytics' | 'settings'
