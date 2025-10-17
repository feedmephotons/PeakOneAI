'use client'

/* eslint-disable react/no-unescaped-entities */

import { useState } from 'react'
import { Sparkles, Palette, Home, Phone, Video, Layout, Cloud, Brain, Calendar, Rocket, MessageSquare } from 'lucide-react'

export default function PeakAIDesignDoc() {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', title: 'Visual Identity', icon: Palette },
    { id: 'home', title: 'Home Dashboard', icon: Home },
    { id: 'calls', title: 'Calls Interface', icon: Phone },
    { id: 'meetings', title: 'Meetings', icon: Video },
    { id: 'projects', title: 'Projects & Tasks', icon: Layout },
    { id: 'files', title: 'Files & Cloud', icon: Cloud },
    { id: 'ai', title: 'AI Command Center', icon: Brain },
    { id: 'calendar', title: 'Calendar', icon: Calendar },
    { id: 'design', title: 'Design Elements', icon: Sparkles },
    { id: 'taglines', title: 'Taglines & Marketing', icon: MessageSquare },
    { id: 'campaign', title: 'Launch Campaign', icon: Rocket },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 min-h-screen bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 sticky top-0">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Peak AI
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Design Document</p>
              </div>
            </div>

            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 max-w-5xl mx-auto">
          {activeSection === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  🌐 Overall Visual Identity
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Style</h3>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span><strong>Minimalist Apple aesthetic</strong> — white, charcoal, and soft gradient backgrounds.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span><strong>Neural, futuristic highlights</strong> — subtle metallic or electric blue AI accents.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span><strong>Rounded edges, soft shadows</strong>, and ultra-smooth animations.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span><strong>Layout logic:</strong> Simple on the surface, powerful underneath.</span>
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 mt-6">Tone & Feel</h3>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Feels <strong>alive</strong> — it anticipates your actions.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Every element <strong>breathes</strong> — no clutter, no friction.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Think <strong>"Apple meets Notion meets ChatGPT"</strong> with one-click power.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'home' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  🏠 Home Dashboard / Welcome Page
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    When users open the app (mobile or desktop), they're greeted with a <strong>"Command Hub"</strong> — a clean screen with large interactive "smart boxes" representing core functions.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Top Navigation</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Clean, translucent bar:</p>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                    <p className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                      Home | Calls | Meetings | Projects | Files | AI Notes | Calendar | Settings
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                      • Profile avatar → dropdown (Status, Preferences, Account)<br/>
                      • AI Assistant icon (bottom right corner) → Always available
                    </p>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Smart Action Grid</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    A visually stunning layout of modular tiles or cards (like Apple's Launchpad or Tesla dashboard). Each card is live, pulsing slightly — with a single action line below.
                  </p>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { title: 'Start a Call', icon: Phone },
                      { title: 'Join a Meeting', icon: Video },
                      { title: 'Create a Task', icon: Layout },
                      { title: 'Open Workspace', icon: Layout },
                      { title: 'Review Notes', icon: MessageSquare },
                      { title: 'Upload File', icon: Cloud },
                      { title: 'View Calendar', icon: Calendar },
                      { title: 'Ask Peak AI', icon: Brain },
                    ].map((item, i) => {
                      const Icon = item.icon
                      return (
                        <div key={i} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 text-center hover:shadow-lg transition-all cursor-pointer border border-blue-100 dark:border-blue-800">
                          <Icon className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Interaction Example:</strong> Click "Start a Call" → pops up contact selector with AI toggle ("Enable AI listening for insights?")
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'calls' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  📞 Communication & Calls Interface
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Voice & Video Calls</h3>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300 mb-6">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>WhatsApp/FaceTime-style layout</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Floating AI widget (bottom-right corner) listens when permission is granted</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Displays live waveform and real-time captioning</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>"Peak AI is listening..." turns green when summarizing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Post-call → automatic summary page opens</span>
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Call Summary Page</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="font-medium text-gray-900 dark:text-white mb-2">Header</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Call name, participants, date/time, duration</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="font-medium text-gray-900 dark:text-white mb-2">🧠 AI Summary</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Bullet points of discussion</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="font-medium text-gray-900 dark:text-white mb-2">✅ Action Items</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tasks auto-added to project workspace</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="font-medium text-gray-900 dark:text-white mb-2">💬 Highlights</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Clickable quotes or keywords from the conversation</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="font-medium text-gray-900 dark:text-white mb-2">📂 Attachments</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Auto-linked files, images, or links mentioned during the call</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'meetings' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  📅 Meetings Interface
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300 mb-6">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Zoom-style video grid with integrated AI panel on right side</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Right sidebar shows live transcription and "AI Moments" (key insights marked in real time)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Button: "Generate Meeting Report" → instant formatted summary with attendees, talking points, and follow-ups</span>
                    </li>
                  </ul>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-2">Bonus Feature</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      AI Assistant can speak into meeting (if enabled) — e.g., "You mentioned needing to contact Sarah. Should I add that to the team task board?"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'projects' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  📋 Project & Task Management Dashboard
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Look & Feel</h3>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300 mb-6">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Inspired by Asana / ClickUp, but smoother, cleaner, and contextual</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Left sidebar: Project folders</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Main area: Tasks board with columns (To-Do, In Progress, Done)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Right sidebar: AI Suggestions & linked meeting notes</span>
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Integrations</h3>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>"Add from Meeting" → automatically converts AI-noted action items into tasks</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>"Ask AI" → can summarize a project's progress, or suggest deadlines</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Tasks auto-tagged by priority, owner, or linked conversation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'files' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  ☁️ Files & Cloud Workspace
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Layout</h3>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300 mb-6">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Dropbox-style grid with preview thumbnails, AI tagging, and contextual linking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Every file knows where it came from: "This image was discussed in Call with Brian (Oct 10)."</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Top search bar: "Find all documents related to Project Atlas discussed this week" → AI filters instantly</span>
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Smart Folders</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['Shared from Calls', 'Meeting Summaries', 'Pending Review', 'AI Notes'].map((folder, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 flex items-center gap-3">
                        <Cloud className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{folder}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'ai' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  🧠 AI Command Center (The "Peak Mind")
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Always Available AI Sidebar</h3>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300 mb-6">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Pop-out chat window accessible anywhere in the app</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Knows all your context (calls, notes, tasks, calendar, etc.)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Can take voice or text input</span>
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Example Prompts</h3>
                  <div className="space-y-2">
                    {[
                      'Summarize my last call with Sarah.',
                      'Create a task for John to send the invoice.',
                      'What are my top three priorities this week?',
                      'Find all notes about the new marketing launch.'
                    ].map((prompt, i) => (
                      <div key={i} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">{prompt}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 mt-6">UI Style</h3>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Minimal, translucent overlay (like Apple's Spotlight)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>"Voice orb" animates when listening</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'calendar' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  🗓️ Calendar Integration
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Seamlessly merges meeting data, call logs, and project deadlines</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>AI can suggest scheduling follow-ups based on what was discussed</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Clean, two-tone design: white + soft blue or charcoal + teal</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'design' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  ⚙️ Design Elements Summary
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Element</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Style</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Purpose</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">Primary Color</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">White / Silver / Charcoal</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Apple-like neutrality</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">Accent Color</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Electric Blue / Gradient Teal</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Intelligent, futuristic</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">Buttons</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Rounded, glassy, soft hover animations</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Modern minimalism</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">Typography</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">San Francisco / Inter / Neue Haas</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Clean, readable, elegant</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">Motion</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Subtle parallax, sliding panels, fluid transitions</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Feels "alive"</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">Sound Design</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Soft AI tones, muted clicks</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Futuristic but natural</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🔮 Future Add-On Ideas</h3>
                    <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-3">
                        <span className="text-blue-500 mt-1">•</span>
                        <span><strong>Voice-first AI Mode:</strong> Use Peak entirely by talking to it ("Call John and take notes")</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-blue-500 mt-1">•</span>
                        <span><strong>AI Persona Customization:</strong> Choose "Assistant styles" (Corporate, Creative, Analytical)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-blue-500 mt-1">•</span>
                        <span><strong>Cross-Device Continuity:</strong> Start on your phone, continue instantly on desktop</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-blue-500 mt-1">•</span>
                        <span><strong>Dynamic Backgrounds:</strong> Subtle AI motion graphics that respond to voice input</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'taglines' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  💬 Taglines & Marketing Copy
                </h2>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Short Tagline Options</h3>
                  <div className="space-y-3">
                    {[
                      '"Peak AI — The brain of ChatGPT, the power of Zoom, and the intuition of everything you use."',
                      '"Peak AI — Where smart meets seamless."',
                      '"Think smarter. Work faster. Live at your Peak."',
                      '"Your calls, meetings, notes, and ideas — all powered by Peak AI."',
                      '"One platform. Infinite intelligence."'
                    ].map((tagline, i) => (
                      <div key={i} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                        <p className="text-gray-700 dark:text-gray-200">{tagline}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Mid-Length Ad Lines</h3>
                  <div className="space-y-4">
                    {[
                      'Peak AI combines the brain of ChatGPT, the power of Zoom, and the intuition of your favorite tools — all in one intelligent workspace.',
                      'With the mind of ChatGPT, the collaboration of Zoom, and the clarity of Grammarly — Peak AI becomes the assistant your team\'s been missing.',
                      'Conversations, meetings, projects, and files — unified by an AI that listens, learns, and organizes everything for you.',
                      'Peak AI transforms every conversation into clarity. It remembers, organizes, and builds your next move before you even ask.',
                      'It\'s not just an app — it\'s your company\'s memory, brain, and intuition combined.'
                    ].map((line, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-l-4 border-blue-500">
                        <p className="text-gray-700 dark:text-gray-300">{line}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Longer Hero Copy</h3>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                        "Meet Peak AI — the all-in-one platform built for how you actually work. It's got the brain of ChatGPT, the power of Zoom, the focus of Asana, and the intuition of Grammarly — all fused into one seamless, intelligent system. Peak listens, learns, and adapts to you and your company, turning every call, meeting, and note into organized, actionable insight."
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                      <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                        "Peak AI isn't just another productivity app — it's your connected work brain. Powered by ChatGPT-level intelligence, designed with Apple-like simplicity, and integrated with the collaboration tools you already love. It remembers, summarizes, plans, and even predicts what's next — so you and your team can focus on what really matters."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'campaign' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  🚀 Launch Campaign Concept
                </h2>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    "Work at Your Peak."
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The brain of ChatGPT. The power of Zoom. The precision of Asana. The clarity of Dropbox. All in one.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Campaign Overview:</strong> Peak AI is positioned as the first truly unified intelligence platform — combining communication, organization, and cloud functionality into one connected ecosystem.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Creative Direction</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Apple-grade</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">visuals</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Tesla-grade</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">confidence</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">OpenAI-grade</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">intelligence</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🎥 Video Scripts</h3>

                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">15-Second Spot (Social / Teaser)</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">
                        "What if every call remembered itself? What if every meeting organized your next move? Meet Peak AI — the brain of ChatGPT with the power of Zoom and the intuition of everything you use. One platform. Infinite intelligence."
                      </p>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">30-Second Spot (Product Launch)</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">
                        "Your day moves fast. Calls, meetings, notes, deadlines. What if all of it worked together? Peak AI merges the brain of ChatGPT, the clarity of Asana, the collaboration of Zoom, and the structure of Dropbox — all in one intelligent platform. It listens, it learns, and it builds your next step before you even ask. Work at your Peak."
                      </p>
                    </div>

                    <div className="border-l-4 border-teal-500 pl-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">60-Second Hero Spot (Main Launch)</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        "Every day, you communicate, create, and collaborate. But your tools don't talk to each other. Until now. Peak AI unifies it all — with the brain of ChatGPT, the collaboration of Zoom, the structure of Asana, and the clarity of Dropbox. It listens to your meetings, learns how you work, and organizes everything automatically. Your calls become notes. Your notes become tasks. Your tasks become results. Peak AI doesn't just assist — it evolves with you. Because this isn't just productivity. It's intelligence — working at your Peak."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Social Ad Variations</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'AI that turns talk into tasks.',
                      'The assistant that already knows what\'s next.',
                      'From meetings to meaning — instantly.',
                      'The all-in-one platform that remembers everything.'
                    ].map((ad, i) => (
                      <div key={i} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{ad}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
