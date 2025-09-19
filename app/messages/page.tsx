import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function MessagesPage() {
  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-500 mt-1">Secure encrypted messaging with your team</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
            <span>New Message</span>
          </button>
        </div>

        {/* Messages Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="overflow-y-auto custom-scrollbar">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">Team Member {i}</p>
                        <span className="text-xs text-gray-500">10:30 AM</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">Latest message preview...</p>
                    </div>
                    {i === 1 && <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                <div>
                  <p className="font-medium text-gray-900">Team Member 1</p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">📞</button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">📹</button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">⋮</button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <p className="text-sm">Hey! How&apos;s the project coming along?</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 justify-end">
                  <div className="bg-indigo-500 text-white rounded-lg p-3 max-w-xs">
                    <p className="text-sm">Going great! Just finished the UI mockup.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">📎</button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}