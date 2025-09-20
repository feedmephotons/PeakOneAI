"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MainActionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href: string;
  gradient: string;
  onClick?: () => void;
}

function MainActionCard({ icon, title, subtitle, href, gradient, onClick }: MainActionCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 text-left w-full"
    >
      <div className={`absolute inset-0 rounded-2xl ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />

      <div className={`inline-flex p-4 rounded-2xl ${gradient} bg-opacity-10 mb-6`}>
        {icon}
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-500">
        {subtitle}
      </p>

      <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

interface AIAssistantProps {
  name: string;
  avatar: string;
}

function AIAssistant({ name, avatar }: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isExpanded && (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {avatar}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{name}</h3>
                <p className="text-xs text-green-500">Active</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Hi! I'm {name}, your AI partner. I can help you with:
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Recording and summarizing meetings</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Managing tasks from conversations</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Organizing your files and documents</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Providing intelligent insights</span>
              </li>
            </ul>
          </div>

          <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all text-sm font-medium">
            Start Conversation
          </button>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white hover:scale-110"
      >
        <span className="text-2xl font-bold">{avatar}</span>
      </button>

      {!isExpanded && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      )}
    </div>
  );
}

export default function AppleDashboard() {
  const [viewMode, setViewMode] = useState<'all-in-one' | 'quick-start'>('all-in-one');

  const mainActions = [
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      title: "Files & Docs",
      subtitle: "Store, share, and collaborate on documents",
      href: "/storage/files",
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-600"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "AI Assistant",
      subtitle: "Your intelligent partner for productivity",
      href: "/ai/assistant",
      gradient: "bg-gradient-to-br from-violet-500 to-purple-600",
      onClick: () => {
        document.getElementById('ai-assistant-trigger')?.click();
      }
    },
    {
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: "Tasks & Projects",
      subtitle: "Manage your work with structured workflows",
      href: "/projects/tasks",
      gradient: "bg-gradient-to-br from-indigo-500 to-blue-600"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: "Video Calls",
      subtitle: "Start meetings with AI note-taking",
      href: "/video",
      gradient: "bg-gradient-to-br from-green-500 to-emerald-600"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: "Phone Calls",
      subtitle: "Record and transcribe calls automatically",
      href: "/phone",
      gradient: "bg-gradient-to-br from-orange-500 to-red-600"
    }
  ];

  const quickStartActions = mainActions.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            What do you want to do today?
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Choose your focus. Behind the scenes, everything stays connected.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              onClick={() => setViewMode('all-in-one')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === 'all-in-one'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All-in-one view
            </button>
            <button
              onClick={() => setViewMode('quick-start')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === 'quick-start'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Quick-start view
            </button>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className={`grid gap-6 ${
          viewMode === 'all-in-one'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto'
        }`}>
          {(viewMode === 'all-in-one' ? mainActions : quickStartActions).map((action, index) => (
            <MainActionCard key={index} {...action} />
          ))}
        </div>

        {/* Recent Activity Summary */}
        {viewMode === 'all-in-one' && (
          <div className="mt-16 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Activity</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-full bg-green-100 mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-500 mt-1">Active Calls</p>
              </div>

              <div className="text-center">
                <div className="inline-flex p-3 rounded-full bg-blue-100 mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gray-900">284</p>
                <p className="text-sm text-gray-500 mt-1">Messages Today</p>
              </div>

              <div className="text-center">
                <div className="inline-flex p-3 rounded-full bg-purple-100 mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gray-900">47</p>
                <p className="text-sm text-gray-500 mt-1">Tasks Completed</p>
              </div>

              <div className="text-center">
                <div className="inline-flex p-3 rounded-full bg-yellow-100 mb-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gray-900">156</p>
                <p className="text-sm text-gray-500 mt-1">Files Shared</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant Floating Widget */}
      <AIAssistant name="Lisa" avatar="L" />
      <button id="ai-assistant-trigger" className="hidden" />
    </div>
  );
}