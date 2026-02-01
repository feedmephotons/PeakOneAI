"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: string;
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    href: '/',
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: '💬',
    href: '#',
    subItems: [
      { id: 'messages', label: 'Messages', icon: '💭', href: '/messages', badge: '12' },
      { id: 'voice-calls', label: 'Voice Calls', icon: '📞', href: '/calls' },
      { id: 'video-conf', label: 'Video Conferencing', icon: '📹', href: '/video' },
      { id: 'contacts', label: 'Contacts', icon: '👥', href: '/contacts' },
      { id: 'call-history', label: 'Call History', icon: '📋', href: '/history' },
    ],
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    icon: '🤖',
    href: '#',
    subItems: [
      { id: 'lisa-chat', label: 'Chat with Lisa', icon: '💬', href: '/lisa', badge: 'NEW' },
      { id: 'computer-agent', label: 'Computer Use Agent', icon: '🖥️', href: '/agent', badge: 'NEW' },
      { id: 'brand-voice', label: 'Brand Voice', icon: '✨', href: '/settings/brand-voice', badge: 'NEW' },
      { id: 'meeting-intel', label: 'Meeting Intelligence', icon: '🧠', href: '/ai/meetings' },
      { id: 'transcriptions', label: 'Transcriptions', icon: '📝', href: '/ai/transcriptions', badge: '3' },
      { id: 'summaries', label: 'Summaries', icon: '📄', href: '/ai/summaries' },
      { id: 'task-extraction', label: 'Task Extraction', icon: '✅', href: '/ai/tasks' },
      { id: 'knowledge-base', label: 'Knowledge Base', icon: '📚', href: '/ai/knowledge' },
      { id: 'ai-settings', label: 'AI Settings', icon: '⚙️', href: '/ai/settings' },
    ],
  },
  {
    id: 'project-management',
    label: 'Project Management',
    icon: '📈',
    href: '#',
    subItems: [
      { id: 'tasks', label: 'Tasks', icon: '✓', href: '/projects/tasks', badge: '8' },
      { id: 'boards', label: 'Boards', icon: '📌', href: '/projects/boards' },
      { id: 'calendar', label: 'Calendar', icon: '📅', href: '/projects/calendar' },
      { id: 'teams', label: 'Teams', icon: '👨‍👩‍👧‍👦', href: '/projects/teams' },
      { id: 'timelines', label: 'Timelines', icon: '⏱️', href: '/projects/timelines' },
      { id: 'workloads', label: 'Workloads', icon: '📊', href: '/projects/workloads' },
    ],
  },
  {
    id: 'cloud-storage',
    label: 'Cloud Storage',
    icon: '☁️',
    href: '#',
    subItems: [
      { id: 'files', label: 'Files', icon: '📁', href: '/files/upload' },
      { id: 'documents', label: 'Documents', icon: '📄', href: '/storage/documents' },
      { id: 'media', label: 'Media', icon: '🎬', href: '/storage/media' },
      { id: 'shared', label: 'Shared', icon: '🔗', href: '/storage/shared' },
      { id: 'recent', label: 'Recent', icon: '🕐', href: '/storage/recent' },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: '🔌',
    href: '/integrations',
    subItems: [
      { id: 'slack', label: 'Slack', icon: '💬', href: '/integrations/slack' },
      { id: 'teams', label: 'Microsoft Teams', icon: '👥', href: '/integrations/teams' },
      { id: 'gmail', label: 'Gmail', icon: '📧', href: '/integrations/gmail' },
      { id: 'salesforce', label: 'Salesforce', icon: '☁️', href: '/integrations/salesforce' },
      { id: 'marketplace', label: 'Marketplace', icon: '🛍️', href: '/integrations/marketplace' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: '📊',
    href: '/analytics',
    subItems: [
      { id: 'overview', label: 'Overview', icon: '📈', href: '/analytics/overview' },
      { id: 'productivity', label: 'Productivity', icon: '⚡', href: '/analytics/productivity' },
      { id: 'usage', label: 'Usage Stats', icon: '📉', href: '/analytics/usage' },
      { id: 'reports', label: 'Reports', icon: '📑', href: '/analytics/reports' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    href: '/settings',
  },
];

export default function Sidebar() {
  const [expandedItems, setExpandedItems] = useState<string[]>(['communication', 'ai-assistant']);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full transition-all duration-300 z-20 ${
        isCollapsed ? 'w-20' : 'w-[280px]'
      }`}
      style={{ backgroundColor: 'rgb(var(--sidebar-bg))' }}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between h-14 px-3 border-b flex-shrink-0" style={{ borderColor: 'rgb(var(--sidebar-border))' }}>
        <Link href="/" className="flex items-center">
          <Image
            src="/peakone-logo.png"
            alt="PeakOne AI"
            width={28}
            height={28}
            className="w-7 h-7"
          />
          {!isCollapsed && (
            <span className="font-semibold text-white ml-2">Peak One AI</span>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={isCollapsed ? "M13 5l7 7-7 7" : "M11 19l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      {/* User Profile Section */}
      <div className="p-3 border-b flex-shrink-0" style={{ borderColor: 'rgb(var(--sidebar-border))' }}>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-800"
                  style={{ backgroundColor: 'rgb(var(--comm-online))' }}></span>
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-white text-xs font-medium">John Doe</p>
              <p className="text-xs" style={{ color: 'rgb(var(--sidebar-text))' }}>Available</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {menuItems.map((item) => (
          <div key={item.id} className="mb-0.5">
            <div
              className={`flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                item.subItems ? 'hover:bg-gray-700/50' : 'hover:bg-gray-700'
              }`}
              onClick={() => item.subItems && toggleExpanded(item.id)}
              style={{
                color: expandedItems.includes(item.id) ? 'rgb(var(--sidebar-text-active))' : 'rgb(var(--sidebar-text))'
              }}
            >
              <Link
                href={item.subItems ? '#' : item.href}
                className="flex items-center space-x-2 flex-1"
                onClick={(e) => item.subItems && e.preventDefault()}
              >
                <span className="text-base w-5">{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="text-xs font-medium flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-xs rounded-full bg-indigo-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
              {!isCollapsed && item.subItems && (
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${
                    expandedItems.includes(item.id) ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>

            {/* Sub-items */}
            {!isCollapsed && item.subItems && expandedItems.includes(item.id) && (
              <div className="mt-0.5 ml-5 space-y-0.5">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.id}
                    href={subItem.href}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-lg transition-colors duration-200 hover:bg-gray-700/30"
                    style={{ color: 'rgb(var(--sidebar-text))' }}
                  >
                    <span className="text-sm opacity-75">{subItem.icon}</span>
                    <span className="text-xs flex-1">{subItem.label}</span>
                    {subItem.badge && (
                      <span className="px-1 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">
                        {subItem.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Storage Indicator */}
      {!isCollapsed && (
        <div className="p-3 border-t flex-shrink-0" style={{ borderColor: 'rgb(var(--sidebar-border))' }}>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span style={{ color: 'rgb(var(--sidebar-text))' }}>Storage</span>
              <span className="text-white">24.5/100 GB</span>
            </div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: '24.5%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Upgrade */}
      {!isCollapsed && (
        <div className="p-3 flex-shrink-0">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
            <p className="text-white text-xs font-medium mb-0.5">Upgrade to Pro</p>
            <p className="text-xs mb-1.5" style={{ color: 'rgb(var(--sidebar-text))' }}>
              Unlock AI features
            </p>
            <button className="w-full py-1 text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded hover:from-indigo-600 hover:to-purple-600 transition-all">
              Upgrade
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}