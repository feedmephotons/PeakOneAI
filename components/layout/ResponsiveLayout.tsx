"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MegaMenuNav from './MegaMenuNav';
import MobileMenu from '@/components/ui/MobileMenu';
import NavStyleSwitcher from '@/components/ui/NavStyleSwitcher';
import { useAppStore } from '@/stores/app-store';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { navStyle } = useAppStore();
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine sidebar width based on nav style
  const sidebarWidth = navStyle === 'megamenu' ? '208px' : '280px'; // w-52 = 208px, w-[280px] = 280px

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Desktop Navigation - conditionally render based on navStyle */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen z-40">
        {mounted && navStyle === 'megamenu' ? (
          <MegaMenuNav />
        ) : (
          <Sidebar />
        )}
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Header - full width on mobile, offset on desktop */}
      <header
        className="fixed top-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 z-30 transition-all duration-200 left-0 lg:left-[var(--sidebar-width)]"
        style={{ '--sidebar-width': mounted ? sidebarWidth : '280px' } as React.CSSProperties}
      >
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-4 lg:mx-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Nav Style Switcher - Hidden on mobile */}
            <div className="hidden lg:block">
              <NavStyleSwitcher />
            </div>

            {/* AI Button - Hidden on mobile */}
            <button className="hidden sm:block p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>

            {/* Create Button */}
            <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Create</span>
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile - Hidden on mobile */}
            <button className="hidden sm:flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - CSS variable for dynamic margin */}
      <main
        className="pt-16 p-4 lg:p-6 transition-all duration-200 max-lg:!ml-0"
        style={{ '--sidebar-width': mounted ? sidebarWidth : '280px' } as React.CSSProperties}
      >
        <div className="lg:ml-[var(--sidebar-width)]">
          {children}
        </div>
      </main>
    </div>
  );
}