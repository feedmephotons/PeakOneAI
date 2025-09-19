import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function TasksPage() {
  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-500 mt-1">Manage and track all your project tasks</p>
          </div>
          <div className="flex items-center space-x-3">
            <select className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>All Projects</option>
              <option>Q4 Initiative</option>
              <option>Product Launch</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
              <span>+ New Task</span>
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* To Do Column */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">To Do</h3>
              <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">8</span>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm cursor-move">
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">High</span>
                    <button className="text-gray-400 hover:text-gray-600">⋮</button>
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Update product documentation</h4>
                  <p className="text-xs text-gray-500 mb-3">Review and update all API documentation for v2.0 release</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                      <span className="text-xs text-gray-500">John D.</span>
                    </div>
                    <span className="text-xs text-gray-500">Due Today</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">In Progress</h3>
              <span className="px-2 py-1 text-xs bg-blue-200 text-blue-700 rounded-full">4</span>
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm cursor-move">
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded-full">Medium</span>
                    <button className="text-gray-400 hover:text-gray-600">⋮</button>
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Design new dashboard</h4>
                  <p className="text-xs text-gray-500 mb-3">Create mockups for the analytics dashboard</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500"></div>
                      <span className="text-xs text-gray-500">Sarah C.</span>
                    </div>
                    <span className="text-xs text-gray-500">Due Dec 22</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review Column */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Review</h3>
              <span className="px-2 py-1 text-xs bg-purple-200 text-purple-700 rounded-full">3</span>
            </div>
            <div className="space-y-3">
              {[1].map((i) => (
                <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm cursor-move">
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">Low</span>
                    <button className="text-gray-400 hover:text-gray-600">⋮</button>
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Code review for feature branch</h4>
                  <p className="text-xs text-gray-500 mb-3">Review authentication implementation</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500"></div>
                      <span className="text-xs text-gray-500">Mike J.</span>
                    </div>
                    <span className="text-xs text-gray-500">Due Dec 25</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Done Column */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Done</h3>
              <span className="px-2 py-1 text-xs bg-green-200 text-green-700 rounded-full">12</span>
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm cursor-move opacity-75">
                  <h4 className="font-medium text-gray-900 text-sm mb-2 line-through">Deploy to staging</h4>
                  <p className="text-xs text-gray-500 mb-3">Deploy latest changes to staging environment</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <div className="w-6 h-6 rounded-full bg-gray-400"></div>
                      <span className="text-xs text-gray-500">Emily D.</span>
                    </div>
                    <span className="text-xs text-green-600">Completed</span>
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