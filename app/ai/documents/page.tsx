'use client'

import { useState } from 'react'
import {
  FileText, Search, Bot, Clock, Star, MoreVertical,
  FileCode, FileSpreadsheet, Presentation, Upload, Sparkles
} from 'lucide-react'

interface AnalyzedDocument {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'spreadsheet' | 'presentation' | 'code'
  summary: string
  keyPoints: string[]
  sentiment?: 'positive' | 'neutral' | 'negative'
  analyzedAt: Date
  starred: boolean
}

const MOCK_DOCUMENTS: AnalyzedDocument[] = [
  {
    id: '1',
    name: 'Q4 Sales Report.pdf',
    type: 'pdf',
    summary: 'Quarterly sales analysis showing 23% YoY growth with strong performance in enterprise segment.',
    keyPoints: ['Revenue up 23% YoY', 'Enterprise deals increased by 45%', 'Customer churn reduced to 2.1%'],
    sentiment: 'positive',
    analyzedAt: new Date(Date.now() - 3600000),
    starred: true
  },
  {
    id: '2',
    name: 'Marketing Strategy 2025.docx',
    type: 'doc',
    summary: 'Comprehensive marketing plan focusing on content marketing and community building.',
    keyPoints: ['Focus on video content', 'Expand social presence', 'Launch ambassador program'],
    sentiment: 'neutral',
    analyzedAt: new Date(Date.now() - 86400000),
    starred: true
  },
  {
    id: '3',
    name: 'Budget Forecast.xlsx',
    type: 'spreadsheet',
    summary: 'Annual budget projections with department-level breakdown and variance analysis.',
    keyPoints: ['Total budget: $2.4M', 'Engineering: 45% allocation', 'Marketing: 25% allocation'],
    sentiment: 'neutral',
    analyzedAt: new Date(Date.now() - 172800000),
    starred: false
  },
  {
    id: '4',
    name: 'Product Roadmap.pptx',
    type: 'presentation',
    summary: '2025 product roadmap with Q1 focus on AI features and Q2 mobile app launch.',
    keyPoints: ['AI assistant launch Q1', 'Mobile app Q2', 'Enterprise features Q3'],
    sentiment: 'positive',
    analyzedAt: new Date(Date.now() - 259200000),
    starred: false
  },
]

export default function AIDocumentsPage() {
  const [documents, setDocuments] = useState<AnalyzedDocument[]>(MOCK_DOCUMENTS)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDocs = documents.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.summary.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getDocIcon = (type: AnalyzedDocument['type']) => {
    const icons = {
      pdf: FileText,
      doc: FileText,
      spreadsheet: FileSpreadsheet,
      presentation: Presentation,
      code: FileCode
    }
    return icons[type]
  }

  const getDocColor = (type: AnalyzedDocument['type']) => {
    const colors = {
      pdf: 'text-red-500 bg-red-100 dark:bg-red-900/30',
      doc: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      spreadsheet: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      presentation: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
      code: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30'
    }
    return colors[type]
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const toggleStar = (id: string) => {
    setDocuments(documents.map(d =>
      d.id === id ? { ...d, starred: !d.starred } : d
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI Document Analysis
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Lisa AI summaries and insights from your documents
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition cursor-pointer">
            <Upload className="w-4 h-4" />
            Analyze Document
            <input type="file" className="hidden" />
          </label>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search analyzed documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
          />
        </div>

        {/* Documents Grid */}
        {filteredDocs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No documents analyzed yet</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              Upload a document to get AI-powered insights
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocs.map(doc => {
              const Icon = getDocIcon(doc.type)
              const colorClass = getDocColor(doc.type)

              return (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {doc.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Bot className="w-3 h-3 text-purple-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Analyzed {formatTime(doc.analyzedAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleStar(doc.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          >
                            <Star className={`w-4 h-4 ${doc.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      {/* AI Summary */}
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI Summary</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {doc.summary}
                        </p>
                      </div>

                      {/* Key Points */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Points</h4>
                        <ul className="space-y-1">
                          {doc.keyPoints.map((point, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></span>
                              {point}
                            </li>
                          ))}
                        </ul>
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
  )
}
