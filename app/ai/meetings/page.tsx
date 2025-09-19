import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function MeetingIntelligencePage() {
  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meeting Intelligence</h1>
            <p className="text-gray-500 mt-1">AI-powered insights from your meetings</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
            <span>🤖</span>
            <span>Generate Report</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📅</span>
              <span className="text-xs text-green-500">+12%</span>
            </div>
            <p className="text-sm text-gray-500">Total Meetings</p>
            <p className="text-2xl font-bold">156</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">⏱️</span>
              <span className="text-xs text-red-500">-5%</span>
            </div>
            <p className="text-sm text-gray-500">Hours Saved</p>
            <p className="text-2xl font-bold">48.5</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">✅</span>
              <span className="text-xs text-green-500">+23%</span>
            </div>
            <p className="text-sm text-gray-500">Action Items</p>
            <p className="text-2xl font-bold">342</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📝</span>
              <span className="text-xs text-green-500">100%</span>
            </div>
            <p className="text-sm text-gray-500">Transcribed</p>
            <p className="text-2xl font-bold">All</p>
          </div>
        </div>

        {/* Recent Meetings */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Recent Meetings</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <span className="text-2xl">📹</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Q4 Strategy Review</h4>
                      <p className="text-sm text-gray-500 mt-1">December 19, 2024 • 2:00 PM - 3:00 PM</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500">👥 8 participants</span>
                        <span className="text-xs text-gray-500">⏱️ 1 hour</span>
                        <span className="text-xs text-gray-500">✅ 5 action items</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">Transcribed</span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">Summary Ready</span>
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">Tasks Extracted</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <span>📄</span>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <span>🎧</span>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <span>⋮</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}