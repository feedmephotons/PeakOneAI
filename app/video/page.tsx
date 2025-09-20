"use client";

import React, { useState } from 'react';

interface Meeting {
  id: string;
  title: string;
  time: string;
  duration?: string;
  participants: number;
  status: 'upcoming' | 'live' | 'completed';
  hasAI: boolean;
  meetingLink?: string;
  recording?: boolean;
}

interface Recording {
  id: string;
  title: string;
  date: string;
  duration: string;
  size: string;
  transcript: boolean;
  summary: boolean;
  thumbnail?: string;
}

export default function VideoPage() {
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [selectedView, setSelectedView] = useState<'meetings' | 'recordings'>('meetings');
  const [aiEnabled, setAiEnabled] = useState(true);

  const todayMeetings: Meeting[] = [
    { id: '1', title: 'Daily Standup', time: '10:00 AM', participants: 8, status: 'completed', hasAI: true, duration: '15 min' },
    { id: '2', title: 'Client Presentation', time: '2:00 PM', participants: 4, status: 'live', hasAI: true, meetingLink: 'https://meet.saasx.com/abc123' },
    { id: '3', title: 'Design Review', time: '4:30 PM', participants: 6, status: 'upcoming', hasAI: true },
    { id: '4', title: 'Team Retrospective', time: '5:30 PM', participants: 12, status: 'upcoming', hasAI: false },
  ];

  const recordings: Recording[] = [
    { id: '1', title: 'Q4 Planning Session', date: 'Dec 18, 2024', duration: '1:24:35', size: '842 MB', transcript: true, summary: true },
    { id: '2', title: 'Product Demo', date: 'Dec 17, 2024', duration: '45:20', size: '324 MB', transcript: true, summary: false },
    { id: '3', title: 'Team Retrospective', date: 'Dec 15, 2024', duration: '58:45', size: '412 MB', transcript: false, summary: false },
    { id: '4', title: 'Customer Onboarding', date: 'Dec 14, 2024', duration: '32:10', size: '234 MB', transcript: true, summary: true },
  ];

  const MeetingCard = ({ meeting }: { meeting: Meeting }) => (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{meeting.time} {meeting.duration && `• ${meeting.duration}`}</p>
          </div>
          {meeting.status === 'live' && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full animate-pulse">
              LIVE
            </span>
          )}
          {meeting.status === 'upcoming' && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              UPCOMING
            </span>
          )}
          {meeting.status === 'completed' && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              COMPLETED
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <div className="flex -space-x-2">
            {[...Array(Math.min(4, meeting.participants))].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
              >
                {i + 1}
              </div>
            ))}
            {meeting.participants > 4 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-medium">
                +{meeting.participants - 4}
              </div>
            )}
          </div>
          <span className="text-sm text-gray-500">{meeting.participants} participants</span>
        </div>

        {meeting.hasAI && (
          <div className="flex items-center text-sm text-violet-600 mb-4">
            <span className="mr-2">🤖</span>
            <span>Lisa will join for notes & summary</span>
          </div>
        )}

        <div className="flex space-x-2">
          {meeting.status === 'live' && (
            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm font-medium">
              Join Now
            </button>
          )}
          {meeting.status === 'upcoming' && (
            <>
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all text-sm font-medium">
                Start Meeting
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                Edit
              </button>
            </>
          )}
          {meeting.status === 'completed' && (
            <>
              <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                View Recording
              </button>
              <button className="px-4 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors text-sm font-medium">
                AI Summary
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const RecordingCard = ({ recording }: { recording: Recording }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start space-x-4">
        <div className="w-32 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{recording.title}</h3>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
            <span>{recording.date}</span>
            <span>•</span>
            <span>{recording.duration}</span>
            <span>•</span>
            <span>{recording.size}</span>
          </div>

          <div className="flex items-center space-x-3 mt-3">
            {recording.transcript && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                ✓ Transcript
              </span>
            )}
            {recording.summary && (
              <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full">
                ✓ AI Summary
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <button className="px-3 py-1.5 bg-violet-500 text-white text-sm rounded-lg hover:bg-violet-600 transition-colors">
              Play
            </button>
            <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
              Download
            </button>
            {recording.transcript && (
              <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                View Transcript
              </button>
            )}
            {recording.summary && (
              <button className="px-3 py-1.5 bg-violet-100 text-violet-700 text-sm rounded-lg hover:bg-violet-200 transition-colors">
                AI Insights
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Video Calls</h1>
              <p className="text-sm text-gray-500 mt-1">HD video meetings with AI-powered transcription and summaries</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowNewMeetingModal(true)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                Schedule Meeting
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm font-medium flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Start Instant Meeting</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-8 text-white mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Meeting Room</h2>
              <p className="text-violet-100 mt-1">Start or join meetings instantly with AI assistance</p>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">System Ready</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors text-left">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Start Now</h3>
              <p className="text-sm text-violet-100">Begin instant meeting with link sharing</p>
            </button>

            <button className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors text-left">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Join Meeting</h3>
              <p className="text-sm text-violet-100">Enter meeting ID or link to join</p>
            </button>

            <button className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors text-left">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Schedule</h3>
              <p className="text-sm text-violet-100">Plan meetings with calendar integration</p>
            </button>
          </div>

          {/* AI Assistant Toggle */}
          <div className="mt-6 flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🤖</span>
              <div>
                <p className="font-medium">Lisa AI Assistant</p>
                <p className="text-sm text-violet-100">Automatic transcription, notes, and action items</p>
              </div>
            </div>
            <button
              onClick={() => setAiEnabled(!aiEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                aiEnabled ? 'bg-white/30' : 'bg-white/10'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setSelectedView('meetings')}
              className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                selectedView === 'meetings' ? 'bg-violet-500 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Meetings
            </button>
            <button
              onClick={() => setSelectedView('recordings')}
              className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                selectedView === 'recordings' ? 'bg-violet-500 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Recordings
            </button>
          </div>

          <div className="flex items-center space-x-3 text-sm">
            <span className="text-gray-500">Filter:</span>
            <select className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500">
              <option>All</option>
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
        </div>

        {/* Meetings View */}
        {selectedView === 'meetings' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
          </div>
        )}

        {/* Recordings View */}
        {selectedView === 'recordings' && (
          <div className="space-y-4">
            {recordings.map((recording) => (
              <RecordingCard key={recording.id} recording={recording} />
            ))}
          </div>
        )}

        {/* AI Insights */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🤖</span>
              Meeting Intelligence by Lisa
            </h3>
            <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              View All Insights
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-violet-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📝</span>
                <span className="text-2xl font-bold text-gray-900">47</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Action Items</p>
              <p className="text-xs text-gray-500 mt-1">Extracted from meetings this week</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">⏱️</span>
                <span className="text-2xl font-bold text-gray-900">12.5h</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Time Saved</p>
              <p className="text-xs text-gray-500 mt-1">With automated summaries</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">👥</span>
                <span className="text-2xl font-bold text-gray-900">89%</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Attendance Rate</p>
              <p className="text-xs text-gray-500 mt-1">Average meeting participation</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Meeting Modal */}
      {showNewMeetingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Schedule New Meeting</h2>
              <button
                onClick={() => setShowNewMeetingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="Enter meeting title..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>1.5 hours</option>
                  <option>2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="Enter email addresses..."
                />
              </div>

              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                    checked={aiEnabled}
                    onChange={(e) => setAiEnabled(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    <span className="font-medium">Enable Lisa AI Assistant</span>
                    <span className="block text-xs text-gray-500 mt-1">
                      Automatic transcription, meeting notes, and action item extraction
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewMeetingModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all text-sm font-medium">
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}