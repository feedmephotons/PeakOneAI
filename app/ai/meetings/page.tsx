'use client'

import { useState, useEffect } from 'react'
import ResponsiveLayout from '@/components/layout/ResponsiveLayout'
import { Search, Calendar, Users, Clock, FileText, Sparkles } from 'lucide-react'

interface Meeting {
  id: string
  title: string
  date: string
  duration: number
  transcripts: Array<{speaker: string, text: string}>
  summary?: string
  actionItems: Array<{text: string, assignee?: string}>
  participants: number
}

export default function MeetingIntelligencePage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)

  useEffect(() => {
    // Load meetings from localStorage
    const loadMeetings = () => {
      const savedMeetings = localStorage.getItem('meetings')
      if (savedMeetings) {
        const parsedMeetings = JSON.parse(savedMeetings)
        setMeetings(parsedMeetings.reverse()) // Show newest first
      }
    }

    loadMeetings()

    // Listen for new meetings
    const handleStorageChange = () => {
      loadMeetings()
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalMeetings = meetings.length
  const totalHours = meetings.reduce((acc, m) => acc + (m.duration || 0), 0) / 3600
  const totalActionItems = meetings.reduce((acc, m) => acc + (m.actionItems?.length || 0), 0)
  const transcribedCount = meetings.filter(m => m.transcripts && m.transcripts.length > 0).length

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    if (mins < 60) return `${mins} min`
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hours}h ${remainingMins}m`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meeting Intelligence</h1>
            <p className="text-gray-500 mt-1">AI-powered insights from your meetings</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-6 h-6 text-indigo-500" />
            </div>
            <p className="text-sm text-gray-500">Total Meetings</p>
            <p className="text-2xl font-bold">{totalMeetings}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500">Total Hours</p>
            <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-sm text-gray-500">Action Items</p>
            <p className="text-2xl font-bold">{totalActionItems}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-sm text-gray-500">Transcribed</p>
            <p className="text-2xl font-bold">{transcribedCount}</p>
          </div>
        </div>

        {/* Recent Meetings */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              {searchQuery ? `Search Results (${filteredMeetings.length})` : 'All Meetings'}
            </h3>
          </div>

          {filteredMeetings.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {meetings.length === 0 ? 'No meetings yet' : 'No meetings found'}
              </h3>
              <p className="text-gray-500">
                {meetings.length === 0
                  ? 'Start a video call with AI features to see meeting history here'
                  : 'Try a different search query'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => setSelectedMeeting(meeting)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <FileText className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(meeting.date)}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {meeting.participants} participant{meeting.participants !== 1 ? 's' : ''}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(meeting.duration)}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {meeting.actionItems?.length || 0} action items
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-3">
                          {meeting.transcripts && meeting.transcripts.length > 0 && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                              ✓ Transcribed ({meeting.transcripts.length} messages)
                            </span>
                          )}
                          {meeting.summary && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                              ✓ Summary Ready
                            </span>
                          )}
                          {meeting.actionItems && meeting.actionItems.length > 0 && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                              ✓ Tasks Extracted
                            </span>
                          )}
                        </div>

                        {meeting.summary && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {meeting.summary.split('\n')[0]}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meeting Detail Modal */}
        {selectedMeeting && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedMeeting.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(selectedMeeting.date)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMeeting(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Summary */}
                {selectedMeeting.summary && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Summary</h3>
                    <div className="prose prose-sm max-w-none bg-indigo-50 p-4 rounded-lg">
                      <div className="whitespace-pre-wrap text-gray-700">
                        {selectedMeeting.summary}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {selectedMeeting.actionItems && selectedMeeting.actionItems.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Action Items</h3>
                    <div className="space-y-2">
                      {selectedMeeting.actionItems.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                          <Sparkles className="w-4 h-4 text-purple-600 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-900">{item.text}</p>
                            {item.assignee && (
                              <p className="text-xs text-gray-500 mt-1">Assignee: {item.assignee}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transcript */}
                {selectedMeeting.transcripts && selectedMeeting.transcripts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Full Transcript</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedMeeting.transcripts.map((t, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                              {t.speaker[0]}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{t.speaker}</p>
                            <p className="text-sm text-gray-600 mt-1">{t.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  )
}
