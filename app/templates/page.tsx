'use client'

import { useState } from 'react'
import {
  FileText, Plus, Search, Copy, MoreVertical, Star, Clock,
  Mail, MessageSquare, CheckSquare, FileCode, Presentation, Table
} from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  category: 'document' | 'email' | 'message' | 'task' | 'code' | 'presentation' | 'spreadsheet'
  content?: string
  starred: boolean
  usageCount: number
  lastUsed?: Date
  createdBy: string
}

const CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: FileText },
  { id: 'document', label: 'Documents', icon: FileText },
  { id: 'email', label: 'Emails', icon: Mail },
  { id: 'message', label: 'Messages', icon: MessageSquare },
  { id: 'task', label: 'Tasks', icon: CheckSquare },
  { id: 'code', label: 'Code', icon: FileCode },
  { id: 'presentation', label: 'Presentations', icon: Presentation },
  { id: 'spreadsheet', label: 'Spreadsheets', icon: Table },
]

const MOCK_TEMPLATES: Template[] = [
  { id: '1', name: 'Weekly Status Report', description: 'Standard weekly progress update template', category: 'document', starred: true, usageCount: 45, lastUsed: new Date(Date.now() - 86400000), createdBy: 'You' },
  { id: '2', name: 'Meeting Notes', description: 'Structured meeting notes with action items', category: 'document', starred: true, usageCount: 128, lastUsed: new Date(Date.now() - 3600000), createdBy: 'You' },
  { id: '3', name: 'Project Proposal', description: 'Formal project proposal template', category: 'document', starred: false, usageCount: 23, createdBy: 'Sarah Johnson' },
  { id: '4', name: 'Client Follow-up', description: 'Professional follow-up email after meetings', category: 'email', starred: true, usageCount: 67, lastUsed: new Date(Date.now() - 172800000), createdBy: 'You' },
  { id: '5', name: 'Welcome Email', description: 'New team member welcome message', category: 'email', starred: false, usageCount: 34, createdBy: 'HR Team' },
  { id: '6', name: 'Bug Report', description: 'Standardized bug report format', category: 'task', starred: false, usageCount: 89, lastUsed: new Date(Date.now() - 43200000), createdBy: 'Engineering' },
  { id: '7', name: 'Feature Request', description: 'Feature request template with requirements', category: 'task', starred: false, usageCount: 56, createdBy: 'Product' },
  { id: '8', name: 'API Endpoint', description: 'RESTful API endpoint boilerplate', category: 'code', starred: true, usageCount: 42, createdBy: 'Engineering' },
  { id: '9', name: 'React Component', description: 'React functional component with TypeScript', category: 'code', starred: false, usageCount: 78, createdBy: 'Engineering' },
  { id: '10', name: 'Sprint Review', description: 'Sprint review presentation template', category: 'presentation', starred: false, usageCount: 15, createdBy: 'You' },
  { id: '11', name: 'Quick Update', description: 'Brief status update message', category: 'message', starred: false, usageCount: 234, lastUsed: new Date(Date.now() - 7200000), createdBy: 'You' },
  { id: '12', name: 'Budget Tracker', description: 'Monthly budget tracking spreadsheet', category: 'spreadsheet', starred: false, usageCount: 19, createdBy: 'Finance' },
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES)
  const [category, setCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = category === 'all' || t.category === category
    return matchesSearch && matchesCategory
  })

  const toggleStar = (id: string) => {
    setTemplates(templates.map(t =>
      t.id === id ? { ...t, starred: !t.starred } : t
    ))
  }

  const useTemplate = (template: Template) => {
    setTemplates(templates.map(t =>
      t.id === template.id
        ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date() }
        : t
    ))
    // In a real app, this would open an editor with the template content
    alert(`Using template: ${template.name}`)
  }

  const getCategoryIcon = (cat: Template['category']) => {
    const icons = {
      document: FileText,
      email: Mail,
      message: MessageSquare,
      task: CheckSquare,
      code: FileCode,
      presentation: Presentation,
      spreadsheet: Table
    }
    return icons[cat] || FileText
  }

  const getCategoryColor = (cat: Template['category']) => {
    const colors = {
      document: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      email: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      message: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      task: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
      code: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30',
      presentation: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
      spreadsheet: 'text-teal-500 bg-teal-100 dark:bg-teal-900/30'
    }
    return colors[cat] || 'text-gray-500 bg-gray-100'
  }

  const formatTime = (date?: Date) => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Templates
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Reusable templates for documents, messages, and more
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition">
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
              <div className="space-y-1">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon
                  const count = cat.id === 'all'
                    ? templates.length
                    : templates.filter(t => t.category === cat.id).length

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                        category === cat.id
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{cat.label}</span>
                      </div>
                      <span className="text-xs text-gray-400">{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No templates found</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Try adjusting your search or category filter
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map(template => {
                  const Icon = getCategoryIcon(template.category)
                  const colorClass = getCategoryColor(template.category)

                  return (
                    <div
                      key={template.id}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleStar(template.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <Star className={`w-4 h-4 ${template.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                          </button>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                        {template.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <span>Used {template.usageCount} times</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(template.lastUsed)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => useTemplate(template)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium"
                        >
                          <Copy className="w-4 h-4" />
                          Use Template
                        </button>
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
  )
}
