'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Mail, Inbox, Send, Archive, Trash2, Star, Reply, Forward,
  MoreVertical, Search, RefreshCw, Paperclip, X, Edit, Sparkles,
  Brain, Users, FileText, Zap, CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react'
import { MOCK_EMAILS, MOCK_USER, FIXED_TODAY } from '@/lib/peak/mock'

type EmailFolder = 'inbox' | 'sent' | 'archive' | 'trash'

interface Email {
  id: string
  folder: EmailFolder
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

// Build the canonical inbox from the shared Acme Corp fixtures (sarah.chen@acmecorp.com).
function seedEmails(): Email[] {
  return MOCK_EMAILS.map((e) => ({
    id: e.id,
    folder: e.folder === 'starred' ? 'inbox' : (e.folder as EmailFolder),
    from: { name: e.from.name, email: e.from.email || '' },
    to: e.to.map((t) => t.email || t.name),
    subject: e.subject,
    body: e.body,
    timestamp: new Date(e.date),
    read: e.read,
    starred: e.starred,
    threadId: e.missionId || undefined,
    // The BrightPath MOU and a couple of others reference attachments in their bodies.
    attachments:
      e.id === 'email-jenna-mou'
        ? [{ name: 'BrightPath-co-marketing-MOU-draft.pdf', size: 184320 }]
        : e.id === 'email-arch-spec'
        ? [{ name: 'Product-X-spec-v3.pdf', size: 421000 }]
        : undefined,
  }))
}

export default function EmailPage() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [folder, setFolder] = useState<EmailFolder | 'starred'>('inbox')
  const [isComposing, setIsComposing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [composerInitialTo, setComposerInitialTo] = useState<string>('')
  const [composerInitialToTimestamp, setComposerInitialToTimestamp] = useState<number>(0)
  const [composerInitialSubject, setComposerInitialSubject] = useState<string>('')
  const [composerInitialBody, setComposerInitialBody] = useState<string>('')
  const [showMore, setShowMore] = useState(false)

  const handleAddContactToComposer = (email: string) => {
    setComposerInitialTo(email)
    setComposerInitialSubject('')
    setComposerInitialBody('')
    setComposerInitialToTimestamp(Date.now())
    setIsComposing(true)
  }

  const handleCloseComposer = () => {
    setIsComposing(false)
    setComposerInitialTo('')
    setComposerInitialSubject('')
    setComposerInitialBody('')
    setComposerInitialToTimestamp(0)
  }

  useEffect(() => {
    const savedEmails = localStorage.getItem('peak-emails')
    if (savedEmails) {
      try {
        const parsed = JSON.parse(savedEmails)
        setEmails(parsed.map((e: Email) => ({ ...e, timestamp: new Date(e.timestamp) })))
        return
      } catch {
        // fall through to reseed
      }
    }
    const seeded = seedEmails()
    setEmails(seeded)
    localStorage.setItem('peak-emails', JSON.stringify(seeded))
  }, [])

  useEffect(() => {
    if (emails.length > 0) {
      localStorage.setItem('peak-emails', JSON.stringify(emails))
    }
  }, [emails])

  // Re-read from the canonical fixtures (Refresh button).
  const handleRefresh = () => {
    const seeded = seedEmails()
    setEmails(seeded)
    setSelectedEmail(null)
    localStorage.setItem('peak-emails', JSON.stringify(seeded))
  }

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.body.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFolder =
      folder === 'starred'
        ? email.starred && email.folder !== 'trash'
        : email.folder === folder
    return matchesSearch && matchesFolder
  })

  // Keep the open email in sync with the live array (star/read changes reflect immediately).
  const activeEmail = selectedEmail
    ? emails.find(e => e.id === selectedEmail.id) || selectedEmail
    : null

  const handleMarkRead = (emailId: string) => {
    setEmails(emails.map(e => e.id === emailId ? { ...e, read: true } : e))
  }

  const handleToggleStar = (emailId: string) => {
    setEmails(emails.map(e => e.id === emailId ? { ...e, starred: !e.starred } : e))
  }

  const handleMarkUnread = (emailId: string) => {
    setEmails(emails.map(e => e.id === emailId ? { ...e, read: false } : e))
  }

  const handleDelete = (emailId: string) => {
    // Move to trash (don't hard-delete so the Trash folder is demoable).
    setEmails(emails.map(e => e.id === emailId ? { ...e, folder: 'trash' as EmailFolder } : e))
    setSelectedEmail(null)
  }

  const handleArchive = (emailId: string) => {
    setEmails(emails.map(e => e.id === emailId ? { ...e, folder: 'archive' as EmailFolder } : e))
    setSelectedEmail(null)
  }

  const handleSendEmail = (emailData: Partial<Email>) => {
    const newEmail: Email = {
      id: `email-sent-${Date.now()}`,
      folder: 'sent',
      from: { name: MOCK_USER.name, email: MOCK_USER.email || 'sarah.chen@acmecorp.com' },
      to: emailData.to || [],
      cc: emailData.cc,
      subject: emailData.subject || '(No Subject)',
      body: emailData.body || '',
      timestamp: new Date(FIXED_TODAY),
      read: true,
      starred: false,
      attachments: emailData.attachments
    }
    setEmails([newEmail, ...emails])
    setFolder('sent')
    handleCloseComposer()
  }

  const handleReply = (email: Email) => {
    setComposerInitialTo(email.from.email)
    setComposerInitialSubject(email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`)
    setComposerInitialBody(
      `\n\n----- On ${email.timestamp.toLocaleString()}, ${email.from.name} wrote: -----\n${email.body}`
    )
    setComposerInitialToTimestamp(Date.now())
    setIsComposing(true)
  }

  const handleForward = (email: Email) => {
    setComposerInitialTo('')
    setComposerInitialSubject(email.subject.startsWith('Fwd:') ? email.subject : `Fwd: ${email.subject}`)
    setComposerInitialBody(
      `\n\n----- Forwarded message from ${email.from.name} <${email.from.email}> -----\nSubject: ${email.subject}\n\n${email.body}`
    )
    setComposerInitialToTimestamp(Date.now())
    setIsComposing(true)
  }

  // Download an attachment as a generated text stub (no real binary in the demo dataset).
  const handleDownloadAttachment = (name: string) => {
    const blob = new Blob(
      [`Peak One demo attachment: ${name}\n\nThis is a placeholder generated for the demo dataset.`],
      { type: 'text/plain' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition mb-3"
        >
          <Edit className="w-4 h-4" />
          Compose
        </button>

        <Link
          href="/email/outreach"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition mb-6"
        >
          <Mail className="w-4 h-4" />
          Outreach
        </Link>

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
              {emails.filter(e => e.folder === 'inbox' && !e.read).length}
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
            onClick={() => setFolder('starred')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              folder === 'starred'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
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

        {/* Smart Contacts - Lusha-style */}
        <SmartContactsSidebar onAddContact={handleAddContactToComposer} />
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
          <button
            onClick={handleRefresh}
            title="Refresh"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
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
        {activeEmail ? (
          <>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {activeEmail.subject}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStar(activeEmail.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <Star className={`w-4 h-4 ${activeEmail.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                  </button>
                  <button
                    onClick={() => handleArchive(activeEmail.id)}
                    title="Archive"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <Archive className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(activeEmail.id)}
                    title="Move to trash"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowMore(v => !v)}
                      title="More"
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    {showMore && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10 overflow-hidden">
                        <button
                          onClick={() => { handleMarkUnread(activeEmail.id); setShowMore(false) }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          Mark as unread
                        </button>
                        <button
                          onClick={() => { handleToggleStar(activeEmail.id); setShowMore(false) }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          {activeEmail.starred ? 'Remove star' : 'Add star'}
                        </button>
                        <button
                          onClick={() => { handleForward(activeEmail); setShowMore(false) }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          Forward
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {activeEmail.from.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{activeEmail.from.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{activeEmail.from.email}</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>To: {activeEmail.to.join(', ')}</div>
                {activeEmail.cc && <div>Cc: {activeEmail.cc.join(', ')}</div>}
                <div className="mt-1">{activeEmail.timestamp.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-900 dark:text-gray-100">
                  {activeEmail.body}
                </pre>
              </div>

              {activeEmail.attachments && activeEmail.attachments.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {activeEmail.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{attachment.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadAttachment(attachment.name)}
                          className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => handleReply(activeEmail)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
              <button
                onClick={() => handleForward(activeEmail)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
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
          onClose={handleCloseComposer}
          initialTo={composerInitialTo}
          initialToTimestamp={composerInitialToTimestamp}
          initialSubject={composerInitialSubject}
          initialBody={composerInitialBody}
        />
      )}
    </div>
  )
}

// ─── Smart Contacts Sidebar Component (Lusha-style) ───

interface SmartContactsSidebarProps {
  onAddContact: (email: string) => void
}

function SmartContactsSidebar({ onAddContact }: SmartContactsSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [contactSearch, setContactSearch] = useState('')
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isExpanded || !contactSearch) {
      setContacts([])
      return
    }

    const handler = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/contacts?search=${encodeURIComponent(contactSearch)}`)
        const data = await res.json()
        if (data.success) {
          setContacts(data.contacts || [])
        }
      } catch (err) {
        console.error('[SmartContactsSidebar] Error:', err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [contactSearch, isExpanded])

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 transition"
      >
        <span className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5" />
          Smart Contacts
        </span>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2 px-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              placeholder="Find company contacts..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {contactSearch.length > 0 && (
            <div className="space-y-1.5">
              {contacts.length > 0 ? contacts.map((contact, idx) => (
                <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {contact.avatar || contact.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-900 dark:text-white truncate">{contact.name}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        {contact.title || 'Contact'}{contact.company ? `, ${contact.company}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 pl-8">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{contact.email || ''}</span>
                    <button
                      onClick={() => onAddContact(contact.email)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium whitespace-nowrap ml-1"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-xs text-gray-400 text-center py-2">
                  {loading ? 'Searching...' : 'No contacts found'}
                </div>
              )}
            </div>
          )}

          {contactSearch.length === 0 && (
            <div className="text-[10px] text-gray-400 dark:text-gray-500 text-center py-2">
              Search to discover contacts
            </div>
          )}

          <div className="flex items-center justify-center gap-1 pt-1">
            <Zap className="w-2.5 h-2.5 text-indigo-400" />
            <span className="text-[10px] text-indigo-400 dark:text-indigo-500 font-medium">Powered by Peak Intelligence</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Email Composer with AI Writing Assistant ───

interface EmailComposerProps {
  onSend: (email: Partial<Email>) => void
  onClose: () => void
  initialTo?: string
  initialToTimestamp?: number
  initialSubject?: string
  initialBody?: string
}

function EmailComposer({ onSend, onClose, initialTo = '', initialToTimestamp = 0, initialSubject = '', initialBody = '' }: EmailComposerProps) {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState<{ name: string; size: number }[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Prefill on open / when reply/forward injects content (keyed by initialToTimestamp).
  useEffect(() => {
    if (initialSubject) setSubject(initialSubject)
    if (initialBody) setBody(initialBody)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToTimestamp])

  useEffect(() => {
    if (!initialTo) return

    setTo(prev => {
      const currentEmails = prev
        ? prev.split(',').map(e => e.trim()).filter(Boolean)
        : []

      if (currentEmails.includes(initialTo)) {
        return prev
      }

      const newEmails = [...currentEmails, initialTo]
      return newEmails.join(', ')
    })
  }, [initialTo, initialToTimestamp])
  const [selectedTone, setSelectedTone] = useState<string>('Professional')
  const [showTemplates, setShowTemplates] = useState(false)
  const [contactSearch, setContactSearch] = useState('')
  const [showContactFinder, setShowContactFinder] = useState(false)

  const [contacts, setContacts] = useState<any[]>([])
  const [contactsLoading, setContactsLoading] = useState(false)

  const [suggestions, setSuggestions] = useState<any[]>([])
  const [score, setScore] = useState<number>(92)
  const [analyzing, setAnalyzing] = useState(false)
  const [rewriting, setRewriting] = useState(false)

  const tones = ['Professional', 'Friendly', 'Concise', 'Persuasive']

  const templates = [
    { name: 'Follow-Up After Meeting', icon: '📋' },
    { name: 'Introduction Email', icon: '👋' },
    { name: 'Project Update', icon: '📊' },
    { name: 'Thank You Note', icon: '🙏' },
  ]

  // Debounced Contact Search
  useEffect(() => {
    if (!showContactFinder) return

    const handler = setTimeout(async () => {
      setContactsLoading(true)
      try {
        const res = await fetch(`/api/contacts?search=${encodeURIComponent(contactSearch)}`)
        const data = await res.json()
        if (data.success) {
          setContacts(data.contacts || [])
        }
      } catch (err) {
        console.error('[EmailComposer Contacts] Error:', err)
      } finally {
        setContactsLoading(false)
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [contactSearch, showContactFinder])

  // Debounced Lisa Brand Voice Analysis (1 second after typing stops)
  useEffect(() => {
    if (!body.trim() && !subject.trim()) {
      setSuggestions([])
      setScore(100)
      return
    }

    const handler = setTimeout(async () => {
      setAnalyzing(true)
      try {
        const textToAnalyze = `${subject}\n${body}`.trim()
        const res = await fetch('/api/brand-voice/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textToAnalyze,
            workspaceId: 'default-workspace',
            selectedTone: selectedTone,
            fieldType: 'email',
            enforcementLevel: 2
          })
        })
        const data = await res.json()
        if (data.overallScore !== undefined) {
          setScore(data.overallScore)
          setSuggestions(data.suggestions || [])
        }
      } catch (err) {
        console.error('[EmailComposer Analyze] Error:', err)
      } finally {
        setAnalyzing(false)
      }
    }, 1000)

    return () => clearTimeout(handler)
  }, [body, subject, selectedTone])

  const handleApplySuggestion = (suggestion: any) => {
    const orig = suggestion.originalText
    const repl = suggestion.suggestedText
    if (!orig || !repl) return

    const replaceText = (source: string, target: string, replacement: string) => {
      const idx = source.toLowerCase().indexOf(target.toLowerCase())
      if (idx === -1) return source
      return source.substring(0, idx) + replacement + source.substring(idx + target.length)
    }

    if (body.toLowerCase().includes(orig.toLowerCase())) {
      setBody(prev => replaceText(prev, orig, repl))
    } else if (subject.toLowerCase().includes(orig.toLowerCase())) {
      setSubject(prev => replaceText(prev, orig, repl))
    }
  }

  const handleRewrite = async () => {
    if (!body.trim()) return
    setRewriting(true)
    try {
      const res = await fetch('/api/brand-voice/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: body,
          workspaceId: 'default-workspace',
          selectedTone: selectedTone,
          preserveIntent: true
        })
      })
      const data = await res.json()
      if (data.rewrittenText) {
        setBody(data.rewrittenText)
      }
    } catch (err) {
      console.error('[EmailComposer Rewrite] Error:', err)
    } finally {
      setRewriting(false)
    }
  }

  const handleSend = () => {
    onSend({
      to: to.split(',').map(e => e.trim()).filter(Boolean),
      subject,
      body,
      attachments: attachments.length > 0 ? attachments : undefined
    })
  }

  const handleSelectTemplate = (templateName: string) => {
    setShowTemplates(false)
    // Mock template content
    const templateContent: Record<string, { subject: string; body: string }> = {
      'Follow-Up After Meeting': {
        subject: 'Follow-Up: Our Meeting on [Date]',
        body: 'Hi [Name],\n\nThank you for taking the time to meet with me today. I wanted to follow up on the key points we discussed:\n\n1. [Point 1]\n2. [Point 2]\n3. [Point 3]\n\nPlease let me know if you have any questions or need anything further.\n\nBest regards'
      },
      'Introduction Email': {
        subject: 'Introduction: [Your Name] from [Company]',
        body: 'Hi [Name],\n\nI hope this message finds you well. My name is [Your Name] and I am reaching out from [Company].\n\nI would love to connect and explore how we might work together.\n\nLooking forward to hearing from you.\n\nBest regards'
      },
      'Project Update': {
        subject: 'Project Update: [Project Name] - Week of [Date]',
        body: 'Hi Team,\n\nHere is this week\'s project update:\n\n**Completed:**\n- [Task 1]\n- [Task 2]\n\n**In Progress:**\n- [Task 3]\n\n**Blockers:**\n- None at this time\n\nPlease reach out if you have any questions.\n\nBest regards'
      },
      'Thank You Note': {
        subject: 'Thank You!',
        body: 'Hi [Name],\n\nI just wanted to take a moment to thank you for [reason]. Your support means a great deal.\n\nLooking forward to continuing our work together.\n\nWarm regards'
      },
    }
    const content = templateContent[templateName]
    if (content) {
      setSubject(content.subject)
      setBody(content.body)
    }
  }

  const handleAddContact = (email: string) => {
    setTo(prev => {
      const currentEmails = prev
        ? prev.split(',').map(e => e.trim()).filter(Boolean)
        : []
      
      const exists = currentEmails.some(e => e.toLowerCase() === email.toLowerCase())
      if (exists) {
        return prev
      }
      
      const newEmails = [...currentEmails, email]
      return newEmails.join(', ')
    })
    setShowContactFinder(false)
    setContactSearch('')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Message</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <Brain className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                {analyzing ? 'Lisa analyzing...' : 'Lisa AI Active'}
              </span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Body: two-column layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Compose Form */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {/* Templates Quick Access */}
              <div className="relative">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Templates
                  <ChevronDown className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
                </button>

                {showTemplates && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10 overflow-hidden">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2">Quick Templates</span>
                    </div>
                    {templates.map((tmpl, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectTemplate(tmpl.name)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition text-left"
                      >
                        <span className="text-base">{tmpl.icon}</span>
                        <span>{tmpl.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* To field with contact finder toggle */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="To"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={() => setShowContactFinder(!showContactFinder)}
                    className={`p-2 rounded-lg transition ${showContactFinder ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'}`}
                    title="Find contacts"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                </div>

                {/* Inline Contact Finder Dropdown */}
                {showContactFinder && (
                  <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Smart Contacts</span>
                      </div>
                      <input
                        type="text"
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        placeholder="Find company contacts..."
                        className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-auto">
                      {contactsLoading ? (
                        <div className="text-xs text-gray-400 text-center py-4">Searching...</div>
                      ) : contacts.map((contact, idx) => (
                        <div key={idx} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                          <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {contact.avatar || contact.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900 dark:text-white">{contact.name}</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">
                              {contact.title || 'Contact'}{contact.company ? `, ${contact.company}` : ''}
                            </div>
                            <div className="text-[10px] text-gray-400 dark:text-gray-500">{contact.email || ''}</div>
                          </div>
                          <button
                            onClick={() => handleAddContact(contact.email)}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition whitespace-nowrap"
                          >
                            Add to email
                          </button>
                        </div>
                      ))}
                      {!contactsLoading && contacts.length === 0 && (
                        <div className="text-xs text-gray-400 text-center py-4">No contacts found</div>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-1 p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <Zap className="w-2.5 h-2.5 text-indigo-400" />
                      <span className="text-[10px] text-indigo-400 font-medium">Powered by Peak Intelligence</span>
                    </div>
                  </div>
                )}
              </div>

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

            {/* Attachments chips */}
            {attachments.length > 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {attachments.map((att, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                  >
                    <Paperclip className="w-3 h-3" />
                    {att.name}
                    <button
                      onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  setAttachments(prev => [...prev, ...files.map(f => ({ name: f.name, size: f.size }))])
                  e.target.value = ''
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
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

          {/* Right: AI Writing Assistant Panel (Grammarly-style) */}
          <div className="w-72 border-l border-gray-200 dark:border-gray-700 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/30 dark:to-gray-800 flex flex-col overflow-y-auto">
            {/* Panel Header */}
            <div className="p-4 border-b border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Lisa Writing Assistant</span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">AI-powered writing suggestions in real time</p>
            </div>

            {/* Tone Selector */}
            <div className="p-4 border-b border-indigo-100/60 dark:border-indigo-900/30">
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Tone</div>
              <div className="flex flex-wrap gap-1.5">
                {tones.map(tone => (
                  <button
                    key={tone}
                    onClick={() => setSelectedTone(tone)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition ${
                      selectedTone === tone
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* On-Brand Score */}
            <div className="p-4 border-b border-indigo-100/60 dark:border-indigo-900/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">On-Brand Score</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{score}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all" style={{ width: `${score}%` }} />
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">
                {score >= 90 ? 'Your message aligns well with your brand voice' :
                 score >= 70 ? 'Some tone adjustments could improve alignment' :
                 'Message deviates significantly from brand voice'}
              </p>
            </div>

            {/* AI Suggestions */}
            <div className="p-4 flex-1">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Suggestions</span>
              </div>

              <div className="space-y-3">
                {analyzing ? (
                  <div className="text-xs text-gray-400 text-center py-4">Analyzing message...</div>
                ) : suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-2.5 bg-white dark:bg-gray-700/60 rounded-lg border border-gray-100 dark:border-gray-600/50">
                    <div className="flex items-start gap-2">
                      <CheckCircle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                        suggestion.severity === 'error' ? 'text-red-500' :
                        suggestion.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
                      }`} />
                      <div>
                        <p className="text-[11px] font-medium text-gray-800 dark:text-gray-200">{suggestion.reason}</p>
                        {suggestion.suggestedText && (
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                            {suggestion.originalText ? `Instead of "${suggestion.originalText}", try:` : 'Try:'}{' '}
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">&quot;{suggestion.suggestedText}&quot;</span>
                          </p>
                        )}
                        <button
                          onClick={() => handleApplySuggestion(suggestion)}
                          className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-1.5 hover:text-indigo-800 dark:hover:text-indigo-300 transition"
                        >
                          Apply suggestion
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {!analyzing && suggestions.length === 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">No suggestions. Your content looks great!</p>
                )}
              </div>
            </div>

            {/* Rewrite Button */}
            <div className="p-4 border-t border-indigo-100/60 dark:border-indigo-900/30">
              <button
                onClick={handleRewrite}
                disabled={rewriting || !body.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                {rewriting ? 'Rewriting...' : 'Rewrite with AI'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
