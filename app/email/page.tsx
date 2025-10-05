'use client'

import React, { useState, useEffect } from 'react'
import {
  Mail, Inbox, Send, Archive, Trash2, Star, Reply, Forward,
  MoreVertical, Search, RefreshCw, Paperclip, X, Edit
} from 'lucide-react'

interface Email {
  id: string
  from: {
    name: string
    email: string
  }
  to: string[]
  cc?: string[]
  subject: string
  body: string
  timestamp: Date
  read: boolean
  starred: boolean
  threadId?: string
  attachments?: { name: string; size: number }[]
  labels?: string[]
}

export default function EmailPage() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [folder, setFolder] = useState<'inbox' | 'sent' | 'archive' | 'trash'>('inbox')
  const [isComposing, setIsComposing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const savedEmails = localStorage.getItem('emails')
    if (savedEmails) {
      const parsed = JSON.parse(savedEmails)
      setEmails(parsed.map((e: Email) => ({ ...e, timestamp: new Date(e.timestamp) })))
    } else {
      const mockEmails: Email[] = [
        {
          id: '1',
          from: { name: 'Sarah Johnson', email: 'sarah@company.com' },
          to: ['you@saasx.com'],
          subject: 'Q4 Budget Review Meeting',
          body: 'Hi team,\n\nLet\'s schedule a meeting to review the Q4 budget proposals. I\'ve prepared a detailed analysis of our spending patterns.\n\nBest regards,\nSarah',
          timestamp: new Date(Date.now() - 3600000),
          read: false,
          starred: true,
          threadId: 'thread-1',
          labels: ['work', 'urgent']
        },
        {
          id: '2',
          from: { name: 'Product Updates', email: 'updates@saasx.com' },
          to: ['you@saasx.com'],
          subject: 'New Features Released!',
          body: 'We\'re excited to announce new features in our latest release...',
          timestamp: new Date(Date.now() - 7200000),
          read: true,
          starred: false,
          attachments: [{ name: 'release-notes.pdf', size: 245000 }]
        },
        {
          id: '3',
          from: { name: 'Michael Chen', email: 'michael@partner.com' },
          to: ['you@saasx.com'],
          cc: ['team@saasx.com'],
          subject: 'Partnership Proposal',
          body: 'I hope this email finds you well. I wanted to reach out regarding a potential partnership opportunity...',
          timestamp: new Date(Date.now() - 86400000),
          read: false,
          starred: false,
          labels: ['business']
        }
      ]
      setEmails(mockEmails)
      localStorage.setItem('emails', JSON.stringify(mockEmails))
    }
  }, [])

  useEffect(() => {
    if (emails.length > 0) {
      localStorage.setItem('emails', JSON.stringify(emails))
    }
  }, [emails])

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.body.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFolder = folder === 'inbox' // Simplified for now
    return matchesSearch && matchesFolder
  })

  const handleMarkRead = (emailId: string) => {
    setEmails(emails.map(e => e.id === emailId ? { ...e, read: true } : e))
  }

  const handleToggleStar = (emailId: string) => {
    setEmails(emails.map(e => e.id === emailId ? { ...e, starred: !e.starred } : e))
  }

  const handleDelete = (emailId: string) => {
    if (confirm('Move email to trash?')) {
      setEmails(emails.filter(e => e.id !== emailId))
      setSelectedEmail(null)
    }
  }

  const handleSendEmail = (emailData: Partial<Email>) => {
    const newEmail: Email = {
      id: Date.now().toString(),
      from: { name: 'You', email: 'you@saasx.com' },
      to: emailData.to || [],
      cc: emailData.cc,
      subject: emailData.subject || '(No Subject)',
      body: emailData.body || '',
      timestamp: new Date(),
      read: true,
      starred: false
    }
    setEmails([newEmail, ...emails])
    setIsComposing(false)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = diff / (1000 * 60 * 60)

    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={() => setIsComposing(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition mb-6"
        >
          <Edit className="w-4 h-4" />
          Compose
        </button>

        <nav className="space-y-1">
          <button
            onClick={() => setFolder('inbox')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              folder === 'inbox'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Inbox</span>
            <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
              {filteredEmails.filter(e => !e.read).length}
            </span>
          </button>
          <button
            onClick={() => setFolder('sent')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              folder === 'sent'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Sent</span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <Star className="w-4 h-4" />
            <span>Starred</span>
          </button>
          <button
            onClick={() => setFolder('archive')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              folder === 'archive'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Archive</span>
          </button>
          <button
            onClick={() => setFolder('trash')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              folder === 'trash'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Trash</span>
          </button>
        </nav>
      </div>

      {/* Email List */}
      <div className="w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emails..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredEmails.map(email => (
            <div
              key={email.id}
              onClick={() => {
                setSelectedEmail(email)
                handleMarkRead(email.id)
              }}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                selectedEmail?.id === email.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              } ${!email.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {email.starred && <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />}
                    <span className={`text-sm truncate ${!email.read ? 'font-semibold' : ''} text-gray-900 dark:text-white`}>
                      {email.from.name}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                  {formatTime(email.timestamp)}
                </span>
              </div>
              <div className={`text-sm mb-1 ${!email.read ? 'font-semibold' : ''} text-gray-900 dark:text-white truncate`}>
                {email.subject}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {email.body}
              </div>
              {email.attachments && email.attachments.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <Paperclip className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{email.attachments.length}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {selectedEmail ? (
          <>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {selectedEmail.subject}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStar(selectedEmail.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <Star className={`w-4 h-4 ${selectedEmail.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                    <Archive className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedEmail.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedEmail.from.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{selectedEmail.from.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{selectedEmail.from.email}</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>To: {selectedEmail.to.join(', ')}</div>
                {selectedEmail.cc && <div>Cc: {selectedEmail.cc.join(', ')}</div>}
                <div className="mt-1">{selectedEmail.timestamp.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-900 dark:text-gray-100">
                  {selectedEmail.body}
                </pre>
              </div>

              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {selectedEmail.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{attachment.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <button className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <Reply className="w-4 h-4" />
                Reply
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <Forward className="w-4 h-4" />
                Forward
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4" />
              <p>Select an email to read</p>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {isComposing && (
        <EmailComposer
          onSend={handleSendEmail}
          onClose={() => setIsComposing(false)}
        />
      )}
    </div>
  )
}

interface EmailComposerProps {
  onSend: (email: Partial<Email>) => void
  onClose: () => void
}

function EmailComposer({ onSend, onClose }: EmailComposerProps) {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const handleSend = () => {
    onSend({
      to: to.split(',').map(e => e.trim()),
      subject,
      body
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Message</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          <input
            type="text"
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <textarea
            placeholder="Compose your message..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
          />
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            <Paperclip className="w-4 h-4" />
            Attach
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
