"use client";

import React from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const menuItems = [
    { icon: '📊', label: 'Dashboard', href: '/' },
    { icon: '💬', label: 'Messages', href: '/messages', badge: '12' },
    { icon: '📞', label: 'Calls', href: '/calls' },
    { icon: '📹', label: 'Video', href: '/video' },
    { icon: '🤖', label: 'AI Assistant', href: '/ai' },
    { icon: '✅', label: 'Tasks', href: '/tasks', badge: '8' },
    { icon: '📁', label: 'Files', href: '/files' },
    { icon: '📊', label: 'Analytics', href: '/analytics' },
    { icon: '⚙️', label: 'Settings', href: '/settings' },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900 z-50 transform transition-transform duration-300 lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
              S
            </div>
            <div>
              <h1 className="text-white font-bold">SaaSX</h1>
              <p className="text-xs text-gray-400">Peak One AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-400">Available</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-3">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-500 text-white">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-700">
          <button className="w-full p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium text-sm hover:from-indigo-600 hover:to-purple-600 transition-all">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </>
  );
}