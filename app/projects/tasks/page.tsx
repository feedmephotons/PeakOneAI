"use client";

import React, { useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  assigneeAvatar: string;
  dueDate: string;
  progress?: number;
  project: string;
  tags: string[];
  aiSuggested?: boolean;
}

interface Project {
  id: string;
  name: string;
  color: string;
  taskCount: number;
}

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [selectedProject, setSelectedProject] = useState('all');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const projects: Project[] = [
    { id: 'q4', name: 'Q4 Initiative', color: 'bg-purple-500', taskCount: 24 },
    { id: 'launch', name: 'Product Launch', color: 'bg-blue-500', taskCount: 18 },
    { id: 'migration', name: 'System Migration', color: 'bg-green-500', taskCount: 12 },
    { id: 'design', name: 'Design System', color: 'bg-pink-500', taskCount: 8 },
  ];

  const tasks: Task[] = [
    {
      id: '1',
      title: 'Update product documentation',
      description: 'Review and update all API documentation for v2.0 release',
      status: 'todo',
      priority: 'high',
      assignee: 'John Doe',
      assigneeAvatar: 'JD',
      dueDate: 'Today',
      project: 'Q4 Initiative',
      tags: ['documentation', 'api'],
    },
    {
      id: '2',
      title: 'Design new dashboard',
      description: 'Create mockups for the analytics dashboard with real-time data visualization',
      status: 'in_progress',
      priority: 'medium',
      assignee: 'Sarah Chen',
      assigneeAvatar: 'SC',
      dueDate: 'Dec 22',
      progress: 60,
      project: 'Product Launch',
      tags: ['design', 'ui/ux'],
    },
    {
      id: '3',
      title: 'Code review for authentication',
      description: 'Review the new OAuth2 implementation and security measures',
      status: 'review',
      priority: 'high',
      assignee: 'Mike Johnson',
      assigneeAvatar: 'MJ',
      dueDate: 'Dec 23',
      project: 'System Migration',
      tags: ['security', 'review'],
    },
    {
      id: '4',
      title: 'Deploy to staging environment',
      description: 'Deploy latest changes and run automated tests',
      status: 'done',
      priority: 'medium',
      assignee: 'Emily Davis',
      assigneeAvatar: 'ED',
      dueDate: 'Completed',
      project: 'Product Launch',
      tags: ['deployment', 'testing'],
    },
    {
      id: '5',
      title: 'AI-suggested: Optimize database queries',
      description: 'Lisa detected slow queries that could be optimized for better performance',
      status: 'todo',
      priority: 'critical',
      assignee: 'Unassigned',
      assigneeAvatar: '?',
      dueDate: 'ASAP',
      project: 'System Migration',
      tags: ['performance', 'database'],
      aiSuggested: true,
    },
  ];

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-50' },
    { id: 'review', title: 'Review', color: 'bg-purple-50' },
    { id: 'done', title: 'Done', color: 'bg-green-50' },
  ];

  const priorityConfig = {
    low: { color: 'bg-green-100 text-green-700', icon: '↓' },
    medium: { color: 'bg-yellow-100 text-yellow-700', icon: '→' },
    high: { color: 'bg-orange-100 text-orange-700', icon: '↑' },
    critical: { color: 'bg-red-100 text-red-700', icon: '⚠' },
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div className={`bg-white rounded-xl border ${task.aiSuggested ? 'border-violet-300' : 'border-gray-200'} p-4 hover:shadow-md transition-all duration-200 cursor-move`}>
      {task.aiSuggested && (
        <div className="flex items-center text-xs text-violet-600 mb-2">
          <span className="mr-1">🤖</span>
          <span>AI Suggested</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <span className={`px-2 py-1 text-xs rounded-full ${priorityConfig[task.priority].color}`}>
          {priorityConfig[task.priority].icon} {task.priority}
        </span>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      <h4 className="font-medium text-gray-900 text-sm mb-2">{task.title}</h4>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>

      {task.progress !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-violet-500 to-purple-600 h-1.5 rounded-full transition-all"
              style={{ width: `${task.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-3">
        {task.tags.map((tag, index) => (
          <span key={index} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
            {task.assigneeAvatar}
          </div>
          <span className="text-xs text-gray-600">{task.assignee}</span>
        </div>
        <span className={`text-xs ${task.dueDate === 'Today' ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
          {task.dueDate}
        </span>
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
              <h1 className="text-2xl font-bold text-gray-900">Tasks & Projects</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your work with AI-powered insights</p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500 focus:bg-white transition-colors"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    viewMode === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Kanban
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Calendar
                </button>
              </div>

              {/* Project Filter */}
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>

              <button
                onClick={() => setShowNewTaskModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all text-sm font-medium"
              >
                + New Task
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Project Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              className={`bg-white rounded-xl border ${
                selectedProject === project.id ? 'border-violet-500' : 'border-gray-200'
              } p-4 text-left hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                <span className="text-2xl font-bold text-gray-900">{project.taskCount}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
              <p className="text-xs text-gray-500 mt-1">Active tasks</p>
            </button>
          ))}
        </div>

        {/* Task Intelligence */}
        <div className="bg-indigo-600 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">
                Task Intelligence
              </h3>
              <p className="text-indigo-100 mt-1">Suggestions and insights from your meetings</p>
            </div>
            <button className="px-4 py-2 bg-white/15 rounded-lg hover:bg-white/25 transition-colors text-sm font-medium">
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm font-medium mb-1">Tasks at risk</p>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-violet-100 mt-1">Need attention</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm font-medium mb-1">Suggested tasks</p>
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-violet-100 mt-1">From conversations</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm font-medium mb-1">Productivity score</p>
              <p className="text-2xl font-bold">87%</p>
              <p className="text-xs text-violet-100 mt-1">↑ 12% this week</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm font-medium mb-1">Time saved</p>
              <p className="text-2xl font-bold">4.5h</p>
              <p className="text-xs text-violet-100 mt-1">With automation</p>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {columns.map((column) => {
              const columnTasks = tasks.filter((task) => task.status === column.id);
              return (
                <div key={column.id} className={`${column.color} rounded-xl p-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{column.title}</h3>
                    <span className="px-2 py-1 text-xs bg-white/70 text-gray-700 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {columnTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                    <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors">
                      + Add Task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{task.project}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                            {task.assigneeAvatar}
                          </div>
                          <span className="text-sm text-gray-600">{task.assignee}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${priorityConfig[task.priority].color}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{task.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calendar View Placeholder */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
            <p className="text-sm text-gray-500">Calendar view with task deadlines and milestones coming soon</p>
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="Enter task title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                  rows={3}
                  placeholder="Describe the task..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500">
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500">
                    <option>John Doe</option>
                    <option>Sarah Chen</option>
                    <option>Mike Johnson</option>
                    <option>Emily Davis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                <div className="flex items-center text-sm text-violet-700">
                  <span className="mr-2">🤖</span>
                  <span className="font-medium">Lisa suggests:</span>
                </div>
                <p className="text-sm text-violet-600 mt-1">
                  Based on your recent meetings, this task might be related to the API optimization discussed yesterday. Consider adding the &quot;performance&quot; tag.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all text-sm font-medium">
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}