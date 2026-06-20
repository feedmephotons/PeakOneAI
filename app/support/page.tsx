'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MessageCircle, Mail, Phone, Clock, Send,
  HelpCircle, FileText, Bug, Lightbulb, AlertTriangle
} from 'lucide-react'
import { MOCK_USER } from '@/lib/peak/mock'

const TICKET_TYPES = [
  { id: 'question', label: 'General Question', icon: HelpCircle },
  { id: 'bug', label: 'Bug Report', icon: Bug },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb },
  { id: 'billing', label: 'Billing Issue', icon: FileText },
  { id: 'urgent', label: 'Urgent Issue', icon: AlertTriangle },
]

const PRIORITIES = [
  { id: 'low', label: 'Low', color: 'text-gray-500' },
  { id: 'medium', label: 'Medium', color: 'text-yellow-500' },
  { id: 'high', label: 'High', color: 'text-orange-500' },
  { id: 'urgent', label: 'Urgent', color: 'text-red-500' },
]

interface SupportTicket {
  id: string
  type: string
  priority: string
  subject: string
  message: string
  requesterName: string
  requesterEmail: string
  createdAt: string
  status: 'OPEN'
}

export default function SupportPage() {
  const router = useRouter()
  const [ticketType, setTicketType] = useState('')
  const [priority, setPriority] = useState('medium')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const id = `TKT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    const ticket: SupportTicket = {
      id,
      type: ticketType || 'question',
      priority,
      subject,
      message,
      requesterName: MOCK_USER.name,
      requesterEmail: MOCK_USER.email ?? '',
      createdAt: new Date().toISOString(),
      status: 'OPEN',
    }

    // Persist the ticket so it survives a refresh and can be picked up by an
    // internal queue. EXTERNAL: needs /api/email/send (Resend) or a real
    // ticketing backend to actually notify the support team.
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('peak.supportTickets')
        const list: SupportTicket[] = raw ? JSON.parse(raw) : []
        list.unshift(ticket)
        localStorage.setItem('peak.supportTickets', JSON.stringify(list))
      } catch {
        /* ignore storage errors */
      }
    }

    setTicketId(id)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setTicketId(null)
      setTicketType('')
      setSubject('')
      setMessage('')
    }, 4000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Contact Support
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our support team is here to help. Choose how you&apos;d like to reach us.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <button
            onClick={() => router.push('/lisa')}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center transition-all hover:border-purple-400 hover:shadow-md"
          >
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Chat with Lisa</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Get instant answers from your AI assistant
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Available now
            </div>
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email Support</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Get help via email
            </p>
            <a
              href="mailto:support@peakone.app"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              support@peakone.app
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-7 h-7 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Phone Support</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Enterprise customers only
            </p>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              1-800-732-5663
            </span>
          </div>
        </div>

        {/* Support Hours */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Support Hours</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Live Chat</p>
              <p className="text-gray-600 dark:text-gray-400">24/7 for all plans</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Email</p>
              <p className="text-gray-600 dark:text-gray-400">Response within 24 hours</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Phone</p>
              <p className="text-gray-600 dark:text-gray-400">Mon-Fri, 9AM-6PM EST</p>
            </div>
          </div>
        </div>

        {/* Submit Ticket Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Submit a Support Ticket
          </h2>

          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ticket Submitted!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {ticketId ? (
                  <>Your ticket <span className="font-mono font-medium text-gray-900 dark:text-white">{ticketId}</span> is open. </>
                ) : null}
                We&apos;ll get back to you at {MOCK_USER.email} as soon as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ticket Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What can we help you with?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {TICKET_TYPES.map(type => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setTicketType(type.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition ${
                          ticketType === type.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${ticketType === type.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                        <span className={`text-xs font-medium ${ticketType === type.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {type.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <div className="flex items-center gap-3">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        priority === p.id
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your issue in detail..."
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white resize-none"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
              >
                <Send className="w-5 h-5" />
                Submit Ticket
              </button>
            </form>
          )}
        </div>

        {/* Help Links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Looking for quick answers?{' '}
            <Link href="/help" className="text-purple-600 dark:text-purple-400 hover:underline">
              Check our Help Center
            </Link>
            {' '}or{' '}
            <Link href="/docs" className="text-purple-600 dark:text-purple-400 hover:underline">
              browse the documentation
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
