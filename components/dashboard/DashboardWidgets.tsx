"use client";

import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

function StatCard({ title, value, change, trend, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className={`flex items-center space-x-1 text-sm ${
          trend === 'up' ? 'text-green-500' : 'text-red-500'
        }`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={trend === 'up' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
          </svg>
          <span>{change}</span>
        </div>
      </div>
      <h3 className="text-gray-500 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface ActivityItemProps {
  type: 'call' | 'message' | 'task' | 'file' | 'meeting';
  title: string;
  description: string;
  time: string;
  user?: string;
}

function ActivityItem({ type, title, description, time, user }: ActivityItemProps) {
  const typeConfig = {
    call: { icon: '📞', color: 'bg-green-100 text-green-600' },
    message: { icon: '💬', color: 'bg-blue-100 text-blue-600' },
    task: { icon: '✓', color: 'bg-purple-100 text-purple-600' },
    file: { icon: '📄', color: 'bg-yellow-100 text-yellow-600' },
    meeting: { icon: '📹', color: 'bg-indigo-100 text-indigo-600' },
  };

  const config = typeConfig[type];

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`p-2 rounded-lg ${config.color}`}>
        <span className="text-lg">{config.icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
        {user && <p className="text-xs text-gray-400 mt-1">by {user}</p>}
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  );
}

interface TaskItemProps {
  title: string;
  project: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  assignee: string;
  progress: number;
}

function TaskItem({ title, project, priority, dueDate, assignee, progress }: TaskItemProps) {
  const priorityConfig = {
    high: 'bg-red-100 text-red-600',
    medium: 'bg-yellow-100 text-yellow-600',
    low: 'bg-green-100 text-green-600',
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
          <p className="text-xs text-gray-500 mt-1">{project}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${priorityConfig[priority]}`}>
          {priority}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
          <span className="text-xs text-gray-600">{assignee}</span>
        </div>
        <span className="text-xs text-gray-500">Due: {dueDate}</span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Progress</span>
          <span className="text-gray-900 font-medium">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardWidgets() {
  const stats = [
    { title: 'Active Calls', value: '12', change: '+23%', trend: 'up' as const, icon: '📞', color: 'bg-green-100' },
    { title: 'Messages Today', value: '284', change: '+12%', trend: 'up' as const, icon: '💬', color: 'bg-blue-100' },
    { title: 'Tasks Completed', value: '47', change: '-5%', trend: 'down' as const, icon: '✅', color: 'bg-purple-100' },
    { title: 'Files Shared', value: '156', change: '+8%', trend: 'up' as const, icon: '📁', color: 'bg-yellow-100' },
  ];

  const recentActivity = [
    { type: 'meeting' as const, title: 'Team Standup Meeting', description: 'AI summary generated', time: '10 min ago', user: 'System' },
    { type: 'call' as const, title: 'Client Call - Acme Corp', description: 'Call recording available', time: '1 hour ago', user: 'Sarah Chen' },
    { type: 'task' as const, title: 'Project Proposal Completed', description: 'Q4 Strategic Initiative', time: '2 hours ago', user: 'Mike Johnson' },
    { type: 'file' as const, title: 'Design Assets Uploaded', description: '15 files added to project', time: '3 hours ago', user: 'Emily Davis' },
    { type: 'message' as const, title: 'New message in #general', description: 'Discussion about upcoming launch', time: '4 hours ago', user: 'Team' },
  ];

  const upcomingTasks = [
    { title: 'Review Q4 Marketing Strategy', project: 'Marketing Initiative', priority: 'high' as const, dueDate: 'Today', assignee: 'You', progress: 75 },
    { title: 'Client Presentation Prep', project: 'Acme Corp Deal', priority: 'high' as const, dueDate: 'Tomorrow', assignee: 'You', progress: 45 },
    { title: 'Update Documentation', project: 'Product Development', priority: 'medium' as const, dueDate: 'Dec 22', assignee: 'You', progress: 20 },
    { title: 'Code Review - Feature Branch', project: 'Engineering', priority: 'low' as const, dueDate: 'Dec 25', assignee: 'You', progress: 0 },
  ];

  const aiInsights = [
    { title: '3 meetings need summaries', action: 'Generate Now', icon: '📝' },
    { title: '8 tasks extracted from calls', action: 'Review Tasks', icon: '✅' },
    { title: 'Weekly productivity report ready', action: 'View Report', icon: '📊' },
    { title: '5 follow-ups suggested', action: 'Schedule', icon: '📅' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, John!</h1>
          <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening in your workspace today</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all">
          <span>Generate Report</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* AI Insights Banner */}
      <div className="bg-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center space-x-2">
              <span>Lisa Insights</span>
            </h3>
            <p className="text-indigo-100 mt-1">Automated suggestions based on your recent activity</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {aiInsights.map((insight, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{insight.icon}</span>
              </div>
              <p className="text-sm mb-3">{insight.title}</p>
              <button className="text-xs font-medium hover:underline">{insight.action} →</button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-3 space-y-1 max-h-96 overflow-y-auto custom-scrollbar">
            {recentActivity.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📹</span>
                <span className="text-sm font-medium text-gray-900">Start Video Call</span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📝</span>
                <span className="text-sm font-medium text-gray-900">Create Task</span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📁</span>
                <span className="text-sm font-medium text-gray-900">Upload Files</span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🤖</span>
                <span className="text-sm font-medium text-gray-900">Ask AI Assistant</span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Upcoming Tasks</h3>
          <button className="text-sm text-indigo-500 hover:text-indigo-600 font-medium">View All</button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingTasks.map((task, index) => (
              <TaskItem key={index} {...task} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}