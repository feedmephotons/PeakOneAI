import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function VideoPage() {
  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Video Conferencing</h1>
            <p className="text-gray-500 mt-1">HD video meetings with AI transcription</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <span>📅</span>
              <span>Schedule</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              <span>📹</span>
              <span>Start Meeting</span>
            </button>
          </div>
        </div>

        {/* Active Meeting */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">Quick Meeting Room</h3>
              <p className="text-gray-300">Ready to start a video call</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">Ready</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <span className="text-3xl">📹</span>
              <p className="mt-2">Start Instant Meeting</p>
            </button>
            <button className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <span className="text-3xl">🔗</span>
              <p className="mt-2">Join with Link</p>
            </button>
            <button className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <span className="text-3xl">📅</span>
              <p className="mt-2">Schedule Meeting</p>
            </button>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Today&apos;s Meetings</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {[
                { time: '10:00 AM', title: 'Daily Standup', participants: 8, status: 'completed' },
                { time: '2:00 PM', title: 'Client Demo', participants: 4, status: 'upcoming' },
                { time: '4:30 PM', title: 'Design Review', participants: 6, status: 'upcoming' },
              ].map((meeting, i) => (
                <div key={i} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${meeting.status === 'completed' ? 'bg-gray-100' : 'bg-blue-100'}`}>
                        <span className="text-xl">📹</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{meeting.title}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-sm text-gray-500">{meeting.time}</span>
                          <span className="text-sm text-gray-500">👥 {meeting.participants}</span>
                        </div>
                      </div>
                    </div>
                    {meeting.status === 'upcoming' ? (
                      <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">
                        Join
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500">Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Recordings */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Recent Recordings</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {[
                { title: 'Q4 Planning Session', date: 'Dec 18', duration: '1:24:35', size: '842 MB' },
                { title: 'Product Demo', date: 'Dec 17', duration: '45:20', size: '324 MB' },
                { title: 'Team Retrospective', date: 'Dec 15', duration: '58:45', size: '412 MB' },
              ].map((recording, i) => (
                <div key={i} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <span className="text-xl">🎬</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{recording.title}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-sm text-gray-500">{recording.date}</span>
                          <span className="text-sm text-gray-500">⏱️ {recording.duration}</span>
                          <span className="text-sm text-gray-500">💾 {recording.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <span>▶️</span>
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <span>⬇️</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}