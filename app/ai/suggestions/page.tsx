'use client'

import { Bot, Lightbulb, CheckCircle, X, Clock } from 'lucide-react'

const SUGGESTIONS = [
  { id: '1', text: 'Schedule a 1:1 with Sarah - you haven\'t met in 2 weeks', type: 'meeting', priority: 'medium' },
  { id: '2', text: 'Review the pending PR from John - it\'s been open for 3 days', type: 'task', priority: 'high' },
  { id: '3', text: 'Update your project status - last update was 5 days ago', type: 'task', priority: 'low' },
  { id: '4', text: 'Reply to Mike\'s message in #general from yesterday', type: 'message', priority: 'medium' },
  { id: '5', text: 'The Q4 report is due in 2 days - consider starting early', type: 'deadline', priority: 'high' },
]

export default function AISuggestionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Suggestions</h1>
            <p className="text-gray-600 dark:text-gray-400">Personalized recommendations for you</p>
          </div>
        </div>

        <div className="space-y-4">
          {SUGGESTIONS.map(suggestion => (
            <div key={suggestion.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white">{suggestion.text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    suggestion.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {suggestion.priority} priority
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg text-green-600">
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400">
                  <Clock className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
