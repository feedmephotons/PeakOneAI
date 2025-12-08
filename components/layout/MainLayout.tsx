"use client";

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <main className="ml-[280px] mt-20 p-6">
        {children}
      </main>
    </div>
  );
}