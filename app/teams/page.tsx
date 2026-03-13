'use client'

import { useState } from 'react'
import {
  Users, FolderOpen, MessageSquare, CheckSquare, Clock, Plus,
  ArrowRight, Activity, Briefcase, FileText, Sparkles, UserPlus
} from 'lucide-react'

// --- Types ---

interface Workspace {
  id: string
  name: string
  description: string
  color: string
  headerGradient: string
  memberCount: number
  members: { initials: string; colorFrom: string; colorTo: string }[]
  tasks: number
  files: number
  threads: number
  lastActivity: string
}

interface TeamMember {
  id: string
  name: string
  initials: string
  role: string
  department: string
  colorFrom: string
  colorTo: string
}

interface ActivityItem {
  id: string
  icon: React.ReactNode
  text: string
  workspace: string
  time: string
}

// --- Data ---

const WORKSPACES: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Product Launch Q2',
    description: 'Cross-functional workspace for Q2 product release',
    color: 'blue',
    headerGradient: 'from-blue-500 to-blue-600',
    memberCount: 6,
    members: [
      { initials: 'SJ', colorFrom: 'from-blue-500', colorTo: 'to-blue-600' },
      { initials: 'EC', colorFrom: 'from-pink-500', colorTo: 'to-pink-600' },
      { initials: 'MW', colorFrom: 'from-cyan-500', colorTo: 'to-cyan-600' },
      { initials: 'LP', colorFrom: 'from-violet-500', colorTo: 'to-violet-600' },
    ],
    tasks: 12,
    files: 8,
    threads: 3,
    lastActivity: '5 min ago',
  },
  {
    id: 'ws-2',
    name: 'Engineering Sprint',
    description: 'Current sprint planning and execution',
    color: 'green',
    headerGradient: 'from-green-500 to-green-600',
    memberCount: 8,
    members: [
      { initials: 'JS', colorFrom: 'from-green-500', colorTo: 'to-green-600' },
      { initials: 'MW', colorFrom: 'from-emerald-500', colorTo: 'to-emerald-600' },
      { initials: 'AR', colorFrom: 'from-teal-500', colorTo: 'to-teal-600' },
      { initials: 'DK', colorFrom: 'from-lime-500', colorTo: 'to-lime-600' },
    ],
    tasks: 24,
    files: 5,
    threads: 7,
    lastActivity: '12 min ago',
  },
  {
    id: 'ws-3',
    name: 'Client Onboarding',
    description: 'New client setup and handoff processes',
    color: 'purple',
    headerGradient: 'from-purple-500 to-purple-600',
    memberCount: 4,
    members: [
      { initials: 'SJ', colorFrom: 'from-purple-500', colorTo: 'to-purple-600' },
      { initials: 'CU', colorFrom: 'from-fuchsia-500', colorTo: 'to-fuchsia-600' },
      { initials: 'LP', colorFrom: 'from-indigo-500', colorTo: 'to-indigo-600' },
    ],
    tasks: 8,
    files: 12,
    threads: 2,
    lastActivity: '1 hr ago',
  },
  {
    id: 'ws-4',
    name: 'Marketing Campaign',
    description: 'Brand awareness campaign for 2026',
    color: 'orange',
    headerGradient: 'from-orange-500 to-orange-600',
    memberCount: 5,
    members: [
      { initials: 'LP', colorFrom: 'from-orange-500', colorTo: 'to-orange-600' },
      { initials: 'EC', colorFrom: 'from-amber-500', colorTo: 'to-amber-600' },
      { initials: 'JD', colorFrom: 'from-yellow-500', colorTo: 'to-yellow-600' },
    ],
    tasks: 15,
    files: 20,
    threads: 4,
    lastActivity: '2 hr ago',
  },
  {
    id: 'ws-5',
    name: 'Sales Pipeline',
    description: 'Deal tracking and prospect management',
    color: 'red',
    headerGradient: 'from-red-500 to-red-600',
    memberCount: 3,
    members: [
      { initials: 'AR', colorFrom: 'from-red-500', colorTo: 'to-red-600' },
      { initials: 'MW', colorFrom: 'from-rose-500', colorTo: 'to-rose-600' },
    ],
    tasks: 6,
    files: 3,
    threads: 5,
    lastActivity: '3 hr ago',
  },
]

const TEAM_MEMBERS: TeamMember[] = [
  { id: 'm1', name: 'Sarah Johnson', initials: 'SJ', role: 'Admin', department: 'Product', colorFrom: 'from-blue-500', colorTo: 'to-blue-600' },
  { id: 'm2', name: 'John Smith', initials: 'JS', role: 'Admin', department: 'Engineering', colorFrom: 'from-green-500', colorTo: 'to-green-600' },
  { id: 'm3', name: 'Emily Chen', initials: 'EC', role: 'Member', department: 'Design', colorFrom: 'from-pink-500', colorTo: 'to-pink-600' },
  { id: 'm4', name: 'Mike Wilson', initials: 'MW', role: 'Member', department: 'Engineering', colorFrom: 'from-cyan-500', colorTo: 'to-cyan-600' },
  { id: 'm5', name: 'Lisa Park', initials: 'LP', role: 'Member', department: 'Marketing', colorFrom: 'from-violet-500', colorTo: 'to-violet-600' },
  { id: 'm6', name: 'Alex Rivera', initials: 'AR', role: 'Member', department: 'Sales', colorFrom: 'from-red-500', colorTo: 'to-red-600' },
  { id: 'm7', name: 'Jordan Davis', initials: 'JD', role: 'Member', department: 'Operations', colorFrom: 'from-amber-500', colorTo: 'to-amber-600' },
  { id: 'm8', name: 'Diana Kim', initials: 'DK', role: 'Member', department: 'Engineering', colorFrom: 'from-teal-500', colorTo: 'to-teal-600' },
  { id: 'm9', name: 'Chris Patel', initials: 'CP', role: 'Guest', department: 'Client', colorFrom: 'from-gray-500', colorTo: 'to-gray-600' },
  { id: 'm10', name: 'You', initials: 'YO', role: 'Owner', department: 'Leadership', colorFrom: 'from-indigo-500', colorTo: 'to-indigo-600' },
]

const ROLE_BADGE_COLORS: Record<string, string> = {
  Owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Member: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  Guest: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
}

// --- Component ---

export default function WorkspacesPage() {
  const [hoveredWorkspace, setHoveredWorkspace] = useState<string | null>(null)

  const ACTIVITY_FEED: ActivityItem[] = [
    {
      id: 'a1',
      icon: <FolderOpen className="w-4 h-4 text-blue-500" />,
      text: "Sarah shared 'Q2 Roadmap.pdf'",
      workspace: 'Product Launch Q2',
      time: '2m ago',
    },
    {
      id: 'a2',
      icon: <CheckSquare className="w-4 h-4 text-green-500" />,
      text: "Mike completed 'API integration tests'",
      workspace: 'Engineering Sprint',
      time: '15m ago',
    },
    {
      id: 'a3',
      icon: <UserPlus className="w-4 h-4 text-purple-500" />,
      text: 'Jordan added 3 new contacts',
      workspace: 'Client Onboarding',
      time: '1h ago',
    },
    {
      id: 'a4',
      icon: <Sparkles className="w-4 h-4 text-orange-500" />,
      text: 'Lisa AI generated meeting summary',
      workspace: 'Marketing Campaign',
      time: '2h ago',
    },
    {
      id: 'a5',
      icon: <CheckSquare className="w-4 h-4 text-red-500" />,
      text: "Alex created task 'Update pricing page'",
      workspace: 'Sales Pipeline',
      time: '3h ago',
    },
  ]

  const stats = [
    { label: 'Total Workspaces', value: '5', icon: <Briefcase className="w-5 h-5 text-indigo-500" /> },
    { label: 'Active Members', value: '12', icon: <Users className="w-5 h-5 text-green-500" /> },
    { label: 'Open Tasks', value: '65', icon: <CheckSquare className="w-5 h-5 text-amber-500" /> },
    { label: 'Files Shared', value: '48', icon: <FileText className="w-5 h-5 text-blue-500" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Hero / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Workspaces
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Collaborate with your team in dedicated project spaces
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            Create Workspace
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3"
            >
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main content: Workspaces grid + Activity sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-10">

          {/* Active Workspaces Grid */}
          <div className="xl:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Workspaces</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {WORKSPACES.map((ws) => (
                <div
                  key={ws.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden cursor-pointer group transition-all hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600"
                  onMouseEnter={() => setHoveredWorkspace(ws.id)}
                  onMouseLeave={() => setHoveredWorkspace(null)}
                >
                  {/* Color-coded header strip */}
                  <div className={`h-2 bg-gradient-to-r ${ws.headerGradient}`} />

                  <div className="p-5">
                    {/* Name + description */}
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {ws.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                      {ws.description}
                    </p>

                    {/* Member avatars */}
                    <div className="flex items-center mb-4">
                      <div className="flex -space-x-2">
                        {ws.members.map((m, i) => (
                          <div
                            key={i}
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${m.colorFrom} ${m.colorTo} flex items-center justify-center text-white text-xs font-medium ring-2 ring-white dark:ring-gray-800`}
                          >
                            {m.initials}
                          </div>
                        ))}
                        {ws.memberCount > ws.members.length && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium ring-2 ring-white dark:ring-gray-800">
                            +{ws.memberCount - ws.members.length}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick stats row */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <CheckSquare className="w-3.5 h-3.5" />
                        {ws.tasks} tasks
                      </span>
                      <span className="flex items-center gap-1">
                        <FolderOpen className="w-3.5 h-3.5" />
                        {ws.files} files
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {ws.threads} threads
                      </span>
                    </div>

                    {/* Last activity + Open button */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                      <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        {ws.lastActivity}
                      </span>
                      <button
                        className={`flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all ${
                          hoveredWorkspace === ws.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'
                        }`}
                      >
                        Open
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workspace Activity Feed (sidebar) */}
          <div className="xl:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activity</h2>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
              <div className="space-y-4">
                {ACTIVITY_FEED.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="mt-0.5 shrink-0">{item.icon}</div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                        {item.text}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        in <span className="font-medium text-gray-500 dark:text-gray-400">{item.workspace}</span>{' '}
                        &middot; {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition flex items-center justify-center gap-1">
                View all activity
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h2>
              <span className="text-sm text-gray-400 dark:text-gray-500">({TEAM_MEMBERS.length})</span>
            </div>
            <button className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition">
              <UserPlus className="w-4 h-4" />
              Invite
            </button>
          </div>

          {/* Horizontal scroll on small screens, grid on large */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 lg:grid lg:grid-cols-5 lg:overflow-visible">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.id}
                className="flex-shrink-0 w-48 lg:w-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition"
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${member.colorFrom} ${member.colorTo} flex items-center justify-center text-white font-semibold text-sm mb-2`}
                  >
                    {member.initials}
                  </div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate w-full">
                    {member.name}
                  </p>
                  <span
                    className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                      ROLE_BADGE_COLORS[member.role] || ROLE_BADGE_COLORS.Member
                    }`}
                  >
                    {member.role}
                  </span>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{member.department}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
