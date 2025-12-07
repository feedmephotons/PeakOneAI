// PeakOne AI Navigation Configuration
// Adapted from BuildX megamenu pattern

export type AppMode =
  | 'dashboard'
  | 'communication'
  | 'ai-assistant'
  | 'projects'
  | 'storage'
  | 'integrations'
  | 'analytics'
  | 'settings'

export interface NavigationItem {
  id: string
  label: string
  icon: string  // lucide-react icon name
  href: string
  mode: AppMode
  description?: string
  badge?: string | number
  children?: NavigationItem[]
}

export const APP_MODES: { id: AppMode; label: string; icon: string; description: string }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    description: 'Overview and quick actions'
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: 'MessageSquare',
    description: 'Messages, calls, and video'
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    icon: 'Sparkles',
    description: 'Lisa AI and intelligent tools'
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: 'FolderKanban',
    description: 'Tasks, boards, and timelines'
  },
  {
    id: 'storage',
    label: 'Storage',
    icon: 'Cloud',
    description: 'Files, documents, and media'
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: 'Plug',
    description: 'Connected apps and services'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'BarChart3',
    description: 'Insights and reports'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    description: 'Account and preferences'
  }
]

export const NAVIGATION: Record<AppMode, NavigationItem[]> = {
  dashboard: [
    { id: 'home', label: 'Home', icon: 'Home', href: '/', mode: 'dashboard', description: 'Your personalized dashboard' },
    { id: 'activity', label: 'Activity', icon: 'Activity', href: '/activity', mode: 'dashboard', description: 'Recent activity feed' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell', href: '/notifications', mode: 'dashboard', description: 'Alerts and updates' },
  ],
  communication: [
    { id: 'messages', label: 'Messages', icon: 'MessageCircle', href: '/messages', mode: 'communication', description: 'Team chat and DMs', badge: '12' },
    { id: 'voice-calls', label: 'Voice Calls', icon: 'Phone', href: '/calls', mode: 'communication', description: 'HD voice calling' },
    { id: 'video', label: 'Video Conferencing', icon: 'Video', href: '/video', mode: 'communication', description: 'HD video meetings' },
    { id: 'contacts', label: 'Contacts', icon: 'Users', href: '/contacts', mode: 'communication', description: 'People and teams' },
    { id: 'history', label: 'Call History', icon: 'History', href: '/history', mode: 'communication', description: 'Recent calls and meetings' },
  ],
  'ai-assistant': [
    { id: 'lisa', label: 'Chat with Lisa', icon: 'Bot', href: '/lisa', mode: 'ai-assistant', description: 'Your AI assistant', badge: 'NEW' },
    { id: 'agent', label: 'Computer Use Agent', icon: 'Monitor', href: '/agent', mode: 'ai-assistant', description: 'Browser automation', badge: 'NEW' },
    { id: 'brand-voice', label: 'Brand Voice', icon: 'Wand2', href: '/settings/brand-voice', mode: 'ai-assistant', description: 'Writing style guide', badge: 'NEW' },
    { id: 'meetings', label: 'Meeting Intelligence', icon: 'Brain', href: '/ai/meetings', mode: 'ai-assistant', description: 'AI meeting insights' },
    { id: 'transcriptions', label: 'Transcriptions', icon: 'FileText', href: '/ai/transcriptions', mode: 'ai-assistant', description: 'Audio to text', badge: '3' },
    { id: 'summaries', label: 'Summaries', icon: 'FileSearch', href: '/ai/summaries', mode: 'ai-assistant', description: 'AI-generated summaries' },
    { id: 'tasks', label: 'Task Extraction', icon: 'CheckSquare', href: '/ai/tasks', mode: 'ai-assistant', description: 'Auto-detect action items' },
    { id: 'knowledge', label: 'Knowledge Base', icon: 'BookOpen', href: '/ai/knowledge', mode: 'ai-assistant', description: 'AI-powered search' },
  ],
  projects: [
    { id: 'tasks', label: 'Tasks', icon: 'ListTodo', href: '/tasks', mode: 'projects', description: 'Kanban task board', badge: '8' },
    { id: 'boards', label: 'Boards', icon: 'Kanban', href: '/projects/boards', mode: 'projects', description: 'Project boards' },
    { id: 'calendar', label: 'Calendar', icon: 'Calendar', href: '/projects/calendar', mode: 'projects', description: 'Team schedule' },
    { id: 'teams', label: 'Teams', icon: 'Users', href: '/teams', mode: 'projects', description: 'Team management' },
    { id: 'timelines', label: 'Timelines', icon: 'GanttChart', href: '/projects/timelines', mode: 'projects', description: 'Project timelines' },
  ],
  storage: [
    { id: 'files', label: 'Files', icon: 'FolderOpen', href: '/files/upload', mode: 'storage', description: 'Upload and manage files' },
    { id: 'documents', label: 'Documents', icon: 'FileText', href: '/storage/documents', mode: 'storage', description: 'Document library' },
    { id: 'media', label: 'Media', icon: 'Image', href: '/storage/media', mode: 'storage', description: 'Photos and videos' },
    { id: 'shared', label: 'Shared', icon: 'Share2', href: '/storage/shared', mode: 'storage', description: 'Shared with you' },
    { id: 'recent', label: 'Recent', icon: 'Clock', href: '/storage/recent', mode: 'storage', description: 'Recently accessed' },
  ],
  integrations: [
    { id: 'slack', label: 'Slack', icon: 'MessageSquare', href: '/integrations/slack', mode: 'integrations', description: 'Connect Slack' },
    { id: 'teams', label: 'Microsoft Teams', icon: 'Users', href: '/integrations/teams', mode: 'integrations', description: 'Connect Teams' },
    { id: 'gmail', label: 'Gmail', icon: 'Mail', href: '/integrations/gmail', mode: 'integrations', description: 'Connect Gmail' },
    { id: 'salesforce', label: 'Salesforce', icon: 'Cloud', href: '/integrations/salesforce', mode: 'integrations', description: 'Connect Salesforce' },
    { id: 'marketplace', label: 'Marketplace', icon: 'Store', href: '/integrations/marketplace', mode: 'integrations', description: 'Browse all integrations' },
  ],
  analytics: [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard', href: '/analytics/overview', mode: 'analytics', description: 'Key metrics' },
    { id: 'productivity', label: 'Productivity', icon: 'TrendingUp', href: '/analytics/productivity', mode: 'analytics', description: 'Team productivity' },
    { id: 'usage', label: 'Usage Stats', icon: 'PieChart', href: '/analytics/usage', mode: 'analytics', description: 'Platform usage' },
    { id: 'reports', label: 'Reports', icon: 'FileBarChart', href: '/analytics/reports', mode: 'analytics', description: 'Custom reports' },
  ],
  settings: [
    { id: 'account', label: 'Account', icon: 'User', href: '/settings', mode: 'settings', description: 'Profile settings' },
    { id: 'billing', label: 'Billing', icon: 'CreditCard', href: '/settings/billing', mode: 'settings', description: 'Plans and billing' },
    { id: 'security', label: 'Security', icon: 'Shield', href: '/settings/security', mode: 'settings', description: 'Security settings' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell', href: '/settings/notifications', mode: 'settings', description: 'Notification preferences' },
    { id: 'organization', label: 'Organization', icon: 'Building2', href: '/settings/org', mode: 'settings', description: 'Org settings' },
  ]
}

// Color themes for each mode
export const MODE_COLORS: Record<AppMode, {
  bg: string
  border: string
  borderActive: string
  icon: string
  activeBg: string
  glassBg: string
}> = {
  dashboard: {
    bg: 'bg-slate-50 dark:bg-slate-900/40',
    border: 'border-slate-200 dark:border-slate-700',
    borderActive: 'border-slate-500',
    icon: 'text-slate-600 dark:text-slate-400',
    activeBg: 'bg-slate-100 dark:bg-slate-800/60',
    glassBg: 'bg-slate-500/10 dark:bg-slate-400/10'
  },
  communication: {
    bg: 'bg-blue-50 dark:bg-blue-900/40',
    border: 'border-blue-200 dark:border-blue-700',
    borderActive: 'border-blue-500',
    icon: 'text-blue-600 dark:text-blue-400',
    activeBg: 'bg-blue-100 dark:bg-blue-800/60',
    glassBg: 'bg-blue-500/10 dark:bg-blue-400/10'
  },
  'ai-assistant': {
    bg: 'bg-violet-50 dark:bg-violet-900/40',
    border: 'border-violet-200 dark:border-violet-700',
    borderActive: 'border-violet-500',
    icon: 'text-violet-600 dark:text-violet-400',
    activeBg: 'bg-violet-100 dark:bg-violet-800/60',
    glassBg: 'bg-violet-500/10 dark:bg-violet-400/10'
  },
  projects: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/40',
    border: 'border-emerald-200 dark:border-emerald-700',
    borderActive: 'border-emerald-500',
    icon: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-100 dark:bg-emerald-800/60',
    glassBg: 'bg-emerald-500/10 dark:bg-emerald-400/10'
  },
  storage: {
    bg: 'bg-amber-50 dark:bg-amber-900/40',
    border: 'border-amber-200 dark:border-amber-700',
    borderActive: 'border-amber-500',
    icon: 'text-amber-600 dark:text-amber-400',
    activeBg: 'bg-amber-100 dark:bg-amber-800/60',
    glassBg: 'bg-amber-500/10 dark:bg-amber-400/10'
  },
  integrations: {
    bg: 'bg-cyan-50 dark:bg-cyan-900/40',
    border: 'border-cyan-200 dark:border-cyan-700',
    borderActive: 'border-cyan-500',
    icon: 'text-cyan-600 dark:text-cyan-400',
    activeBg: 'bg-cyan-100 dark:bg-cyan-800/60',
    glassBg: 'bg-cyan-500/10 dark:bg-cyan-400/10'
  },
  analytics: {
    bg: 'bg-rose-50 dark:bg-rose-900/40',
    border: 'border-rose-200 dark:border-rose-700',
    borderActive: 'border-rose-500',
    icon: 'text-rose-600 dark:text-rose-400',
    activeBg: 'bg-rose-100 dark:bg-rose-800/60',
    glassBg: 'bg-rose-500/10 dark:bg-rose-400/10'
  },
  settings: {
    bg: 'bg-gray-50 dark:bg-gray-800/40',
    border: 'border-gray-200 dark:border-gray-600',
    borderActive: 'border-gray-500',
    icon: 'text-gray-600 dark:text-gray-400',
    activeBg: 'bg-gray-100 dark:bg-gray-700/60',
    glassBg: 'bg-gray-500/10 dark:bg-gray-400/10'
  }
}

// AI Insights for each mode (shown in megamenu footer)
export const AI_INSIGHTS: Record<AppMode, { icon: string; text: string; count?: number }> = {
  dashboard: { icon: 'Zap', text: 'All systems running smoothly' },
  communication: { icon: 'MessageCircle', text: '12 unread messages', count: 12 },
  'ai-assistant': { icon: 'Sparkles', text: 'Lisa learned 3 new patterns', count: 3 },
  projects: { icon: 'CheckSquare', text: '5 tasks due today', count: 5 },
  storage: { icon: 'HardDrive', text: '2.4 GB of 10 GB used' },
  integrations: { icon: 'Plug', text: '4 active integrations', count: 4 },
  analytics: { icon: 'TrendingUp', text: 'Productivity up 12% this week' },
  settings: { icon: 'Settings', text: 'All settings configured' }
}
