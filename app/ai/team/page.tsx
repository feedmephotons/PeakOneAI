'use client'

import { Users, Bot, TrendingUp, MessageSquare, Calendar } from 'lucide-react'

const TEAM_INSIGHTS = [
  { name: 'Sarah Johnson', role: 'Product Manager', collaboration: 92, responsiveness: 88 },
  { name: 'John Smith', role: 'Engineer', collaboration: 85, responsiveness: 95 },
  { name: 'Emily Chen', role: 'Designer', collaboration: 90, responsiveness: 82 },
  { name: 'Mike Wilson', role: 'Engineer', collaboration: 78, responsiveness: 91 },
]

export default function AITeamPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Intelligence</h1>
            <p className="text-gray-600 dark:text-gray-400">AI insights about your team dynamics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <MessageSquare className="w-8 h-8 text-blue-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Messages this week</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <Calendar className="w-8 h-8 text-green-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">34</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Team meetings</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <TrendingUp className="w-8 h-8 text-purple-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">87%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Collaboration score</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Team Performance</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {TEAM_INSIGHTS.map((member, idx) => (
              <div key={idx} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Collaboration</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{member.collaboration}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Response</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{member.responsiveness}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
