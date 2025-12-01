'use client'

import { useState, useEffect } from 'react'
import {
  FileText, MessageSquare, CheckCircle, Calendar, Upload, User,
  Activity, Clock, Users, Download, RefreshCw,
  Phone, Share2, ArrowUp, ArrowDown, Bot
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'file' | 'message' | 'task' | 'meeting' | 'call' | 'ai' | 'share' | 'user'
  action: string
  target: string
  user: {
    name: string
    avatar?: string
    initials: string
  }
  timestamp: Date
  metadata?: {
    fileSize?: string
    duration?: string
    participants?: number
    status?: 'completed' | 'in_progress' | 'cancelled'
    preview?: string
    aiSummary?: string
    tags?: string[]
  }
}

interface Stats {
  totalActivities: number
  activeUsers: number
  tasksCompleted: number
  filesUploaded: number
  messagesS

: number
  trend: 'up' | 'down' | 'stable'
  percentChange: number
}

const ACTIVITY_TYPES = [
  { id: 'all', label: 'All Activity', icon: Activity },
  { id: 'file', label: 'Files', icon: FileText },
  { id: 'message', label: 'Messages', icon: MessageSquare },
  { id: 'task', label: 'Tasks', icon: CheckCircle },
  { id: 'meeting', label: 'Meetings', icon: Calendar },
  { id: 'call', label: 'Calls', icon: Phone },
  { id: 'ai', label: 'AI Interactions', icon: Bot }
]

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('today')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalActivities: 0,
    activeUsers: 0,
    tasksCompleted: 0,
    filesUploaded: 0,
    messagesS

: 0,
    trend: 'up',
    percentChange: 0
  })
  const [refreshing, setRefreshing] = useState(false)

  // Load activities from localStorage or create mock data
  useEffect(() => {
    const loadActivities = () => {
      const savedActivities = localStorage.getItem('activities')
      if (savedActivities) {
        const parsed = JSON.parse(savedActivities)
        const activities = parsed.map((a: ActivityItem) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        }))
        setActivities(activities)
        updateStats(activities)
      } else {
        // Create mock activities
        const mockActivities: ActivityItem[] = [
          {
            id: '1',
            type: 'file',
            action: 'uploaded',
            target: 'Q4 Sales Report.pdf',
            user: { name: 'You', initials: 'YO' },
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            metadata: {
              fileSize: '2.3 MB',
              aiSummary: 'Quarterly report showing 23% growth',
              tags: ['sales', 'q4', 'report']
            }
          },
          {
            id: '2',
            type: 'message',
            action: 'sent message in',
            target: '#general',
            user: { name: 'Sarah Johnson', initials: 'SJ' },
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            metadata: {
              preview: 'Great work on the presentation!'
            }
          },
          {
            id: '3',
            type: 'task',
            action: 'completed',
            target: 'Review marketing campaign',
            user: { name: 'John Smith', initials: 'JS' },
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            metadata: {
              status: 'completed'
            }
          },
          {
            id: '4',
            type: 'meeting',
            action: 'scheduled',
            target: 'Sprint Planning',
            user: { name: 'Emily Chen', initials: 'EC' },
            timestamp: new Date(Date.now() - 1000 * 60 * 45),
            metadata: {
              participants: 8,
              duration: '1 hour'
            }
          },
          {
            id: '5',
            type: 'ai',
            action: 'asked Lisa AI about',
            target: 'Budget analysis',
            user: { name: 'You', initials: 'YO' },
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
            metadata: {
              preview: 'Analyze Q4 budget allocations',
              aiSummary: 'Provided detailed breakdown of departmental spending'
            }
          },
          {
            id: '6',
            type: 'call',
            action: 'joined video call',
            target: 'Team Standup',
            user: { name: 'Mike Wilson', initials: 'MW' },
            timestamp: new Date(Date.now() - 1000 * 60 * 90),
            metadata: {
              duration: '15 minutes',
              participants: 5
            }
          },
          {
            id: '7',
            type: 'share',
            action: 'shared',
            target: 'Project Roadmap.xlsx',
            user: { name: 'Lisa Park', initials: 'LP' },
            timestamp: new Date(Date.now() - 1000 * 60 * 120),
            metadata: {
              participants: 3
            }
          },
          {
            id: '8',
            type: 'file',
            action: 'edited',
            target: 'Marketing Strategy.pptx',
            user: { name: 'You', initials: 'YO' },
            timestamp: new Date(Date.now() - 1000 * 60 * 180),
            metadata: {
              fileSize: '5.1 MB'
            }
          },
          {
            id: '9',
            type: 'task',
            action: 'created',
            target: 'Design new landing page',
            user: { name: 'Sarah Johnson', initials: 'SJ' },
            timestamp: new Date(Date.now() - 1000 * 60 * 240),
            metadata: {
              status: 'in_progress'
            }
          },
          {
            id: '10',
            type: 'message',
            action: 'mentioned you in',
            target: '#development',
            user: { name: 'John Smith', initials: 'JS' },
            timestamp: new Date(Date.now() - 1000 * 60 * 300),
            metadata: {
              preview: '@you Can you review the PR?'
            }
          }
        ]

        // Add more activities for different time ranges
        for (let i = 11; i <= 30; i++) {
          const types: ActivityItem['type'][] = ['file', 'message', 'task', 'meeting', 'call', 'ai', 'share', 'user']
          const type = types[Math.floor(Math.random() * types.length)]
          const hours = Math.floor(Math.random() * 72) + 1

          mockActivities.push({
            id: i.toString(),
            type,
            action: getActionForType(type),
            target: getTargetForType(type),
            user: getRandomUser(),
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * hours),
            metadata: getMetadataForType(type)
          })
        }

        setActivities(mockActivities)
        updateStats(mockActivities)
        localStorage.setItem('activities', JSON.stringify(mockActivities))
      }
      setLoading(false)
    }

    loadActivities()

    // Simulate real-time updates
    const interval = setInterval(() => {
      const types: ActivityItem['type'][] = ['file', 'message', 'task', 'meeting', 'call', 'ai']
      const type = types[Math.floor(Math.random() * types.length)]

      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type,
        action: getActionForType(type),
        target: getTargetForType(type),
        user: getRandomUser(),
        timestamp: new Date(),
        metadata: getMetadataForType(type)
      }

      setActivities(prev => {
        const updated = [newActivity, ...prev].slice(0, 100) // Keep only last 100 activities
        localStorage.setItem('activities', JSON.stringify(updated))
        updateStats(updated)
        return updated
      })
    }, 30000) // Add new activity every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Filter activities based on type and time range
  useEffect(() => {
    let filtered = [...activities]

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(a => a.type === filter)
    }

    // Filter by time range
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    switch (timeRange) {
      case 'today':
        filtered = filtered.filter(a => a.timestamp >= startOfDay)
        break
      case 'week':
        filtered = filtered.filter(a => a.timestamp >= startOfWeek)
        break
      case 'month':
        filtered = filtered.filter(a => a.timestamp >= startOfMonth)
        break
    }

    setFilteredActivities(filtered)
  }, [activities, filter, timeRange])

  const updateStats = (activities: ActivityItem[]) => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todaysActivities = activities.filter(a => a.timestamp >= startOfDay)

    const uniqueUsers = new Set(todaysActivities.map(a => a.user.name)).size
    const tasksCompleted = todaysActivities.filter(a => a.type === 'task' && a.metadata?.status === 'completed').length
    const filesUploaded = todaysActivities.filter(a => a.type === 'file' && a.action === 'uploaded').length
    const messagesSent = todaysActivities.filter(a => a.type === 'message').length

    // Calculate trend (compare with yesterday)
    const yesterday = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000)
    const yesterdaysActivities = activities.filter(a =>
      a.timestamp >= yesterday && a.timestamp < startOfDay
    )

    const change = todaysActivities.length - yesterdaysActivities.length
    const percentChange = yesterdaysActivities.length > 0
      ? Math.round((change / yesterdaysActivities.length) * 100)
      : 100

    setStats({
      totalActivities: todaysActivities.length,
      activeUsers: uniqueUsers,
      tasksCompleted,
      filesUploaded,
      messagesS

: messagesSent,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      percentChange: Math.abs(percentChange)
    })
  }

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  const getActionForType = (type: ActivityItem['type']) => {
    const actions: Record<ActivityItem['type'], string[]> = {
      file: ['uploaded', 'edited', 'deleted', 'moved', 'shared'],
      message: ['sent message in', 'replied to', 'mentioned you in'],
      task: ['created', 'completed', 'assigned', 'updated'],
      meeting: ['scheduled', 'joined', 'cancelled', 'rescheduled'],
      call: ['started call', 'joined video call', 'ended call'],
      ai: ['asked Lisa AI about', 'received AI summary for'],
      share: ['shared', 'received access to'],
      user: ['joined the team', 'updated profile', 'changed settings']
    }
    const typeActions = actions[type]
    return typeActions[Math.floor(Math.random() * typeActions.length)]
  }

  const getTargetForType = (type: ActivityItem['type']) => {
    const targets: Record<ActivityItem['type'], string[]> = {
      file: ['Report.pdf', 'Presentation.pptx', 'Budget.xlsx', 'Design.fig', 'Notes.doc'],
      message: ['#general', '#development', '#marketing', 'Team Chat', 'Project Discussion'],
      task: ['Review code', 'Update documentation', 'Fix bug', 'Create mockup', 'Deploy changes'],
      meeting: ['Sprint Planning', 'Team Standup', 'Client Call', 'Design Review', '1:1 Meeting'],
      call: ['Team Sync', 'Client Meeting', 'Support Call', 'Interview', 'Quick Chat'],
      ai: ['data analysis', 'code review', 'document summary', 'task planning', 'email draft'],
      share: ['Project Files', 'Meeting Notes', 'Design Assets', 'Code Repository', 'Documentation'],
      user: ['workspace', 'notification settings', 'display preferences', 'security settings', 'team']
    }
    const typeTargets = targets[type]
    return typeTargets[Math.floor(Math.random() * typeTargets.length)]
  }

  const getMetadataForType = (type: ActivityItem['type']) => {
    switch (type) {
      case 'file':
        return {
          fileSize: `${(Math.random() * 10).toFixed(1)} MB`,
          tags: ['document', 'important']
        }
      case 'message':
        return {
          preview: 'This is a message preview...'
        }
      case 'task':
        return {
          status: ['completed', 'in_progress'][Math.floor(Math.random() * 2)] as 'completed' | 'in_progress'
        }
      case 'meeting':
        return {
          participants: Math.floor(Math.random() * 10) + 2,
          duration: '1 hour'
        }
      case 'call':
        return {
          duration: `${Math.floor(Math.random() * 60)} minutes`,
          participants: Math.floor(Math.random() * 5) + 2
        }
      case 'ai':
        return {
          aiSummary: 'AI provided helpful insights and recommendations'
        }
      default:
        return {}
    }
  }

  const getRandomUser = () => {
    const users = [
      { name: 'You', initials: 'YO' },
      { name: 'Sarah Johnson', initials: 'SJ' },
      { name: 'John Smith', initials: 'JS' },
      { name: 'Emily Chen', initials: 'EC' },
      { name: 'Mike Wilson', initials: 'MW' },
      { name: 'Lisa Park', initials: 'LP' }
    ]
    return users[Math.floor(Math.random() * users.length)]
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    const icons = {
      file: FileText,
      message: MessageSquare,
      task: CheckCircle,
      meeting: Calendar,
      call: Phone,
      ai: Bot,
      share: Share2,
      user: User
    }
    return icons[type] || Activity
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    const colors = {
      file: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      message: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      task: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      meeting: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
      call: 'text-red-500 bg-red-100 dark:bg-red-900/30',
      ai: 'text-violet-500 bg-violet-100 dark:bg-violet-900/30',
      share: 'text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30',
      user: 'text-gray-500 bg-gray-100 dark:bg-gray-700'
    }
    return colors[type] || 'text-gray-500 bg-gray-100'
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const exportActivities = () => {
    const dataStr = JSON.stringify(filteredActivities, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `activities_${new Date().toISOString()}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Activity Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time activity feed and analytics across your workspace
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className={`p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                  refreshing ? 'animate-spin' : ''
                }`}
              >
                <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={exportActivities}
                className="p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                stats.trend === 'up' ? 'text-green-600' : stats.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stats.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : stats.trend === 'down' ? <ArrowDown className="w-4 h-4" /> : null}
                <span>{stats.percentChange}%</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalActivities}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Activities</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tasksCompleted}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Done</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.filesUploaded}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Files Uploaded</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.messagesS

}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Messages Sent</p>
          </div>
        </div>

        {/* Filters and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>

              {/* Time Range */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Time Range</label>
                <div className="space-y-2">
                  {(['today', 'week', 'month', 'all'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        timeRange === range
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Activity Type</label>
                <div className="space-y-2">
                  {ACTIVITY_TYPES.map(type => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        onClick={() => setFilter(type.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                          filter === type.id
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Activity Feed
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredActivities.length} activities
                  </span>
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading activities...</p>
                  </div>
                ) : filteredActivities.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No activities found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Try adjusting your filters or time range
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredActivities.map(activity => {
                      const Icon = getActivityIcon(activity.type)
                      const colorClass = getActivityColor(activity.type)

                      return (
                        <div key={activity.id} className="flex gap-4 group">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 dark:text-white">
                                  <span className="font-medium">{activity.user.name}</span>
                                  {' '}
                                  <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>
                                  {' '}
                                  <span className="font-medium">{activity.target}</span>
                                </p>
                                {activity.metadata?.preview && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    &quot;{activity.metadata.preview}&quot;
                                  </p>
                                )}
                                {activity.metadata?.aiSummary && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                                    AI: {activity.metadata.aiSummary}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatTime(activity.timestamp)}
                                  </span>
                                  {activity.metadata?.participants && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      {activity.metadata.participants}
                                    </span>
                                  )}
                                  {activity.metadata?.duration && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {activity.metadata.duration}
                                    </span>
                                  )}
                                  {activity.metadata?.fileSize && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {activity.metadata.fileSize}
                                    </span>
                                  )}
                                  {activity.metadata?.status && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      activity.metadata.status === 'completed'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                    }`}>
                                      {activity.metadata.status}
                                    </span>
                                  )}
                                </div>
                                {activity.metadata?.tags && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {activity.metadata.tags.map(tag => (
                                      <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}