'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles, Mail, Send, Copy, ChevronRight, RefreshCw,
  Plus, Trash2, Save, ArrowLeft, Check, Zap, Target,
  Users, BarChart3, Clock, Edit3
} from 'lucide-react'

type ToneType = 'formal' | 'neutral' | 'casual'

interface EmailSequence {
  id: string
  subject: string
  body: string
  delay: number // days after previous email
  generated: boolean
}

interface Campaign {
  id: string
  name: string
  targetAudience: string
  tone: ToneType
  goal: string
  emails: EmailSequence[]
  status: 'draft' | 'active' | 'paused' | 'completed'
  createdAt: Date
}

const TONE_OPTIONS: { value: ToneType; label: string; description: string; emoji: string }[] = [
  { value: 'formal', label: 'Formal', description: 'Professional and business-appropriate', emoji: '👔' },
  { value: 'neutral', label: 'Neutral', description: 'Balanced and versatile', emoji: '⚖️' },
  { value: 'casual', label: 'Casual', description: 'Friendly and conversational', emoji: '😊' },
]

const EXAMPLE_PROMPTS = [
  'Founders/CTOs needing development tools',
  'Marketing managers looking for automation',
  'HR directors seeking recruitment software',
  'Sales teams wanting CRM solutions',
  'Startup founders raising Series A',
]

export default function EmailOutreachPage() {
  const [targetAudience, setTargetAudience] = useState('')
  const [selectedTone, setSelectedTone] = useState<ToneType>('neutral')
  const [outreachGoal, setOutreachGoal] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedEmails, setGeneratedEmails] = useState<EmailSequence[]>([])
  const [selectedEmailIndex, setSelectedEmailIndex] = useState(0)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [campaignName, setCampaignName] = useState('')

  // Send email state
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendTo, setSendTo] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null)
  const [personalizationVars, setPersonalizationVars] = useState({
    firstName: '',
    lastName: '',
    company: '',
    senderName: '',
    calendar_link: ''
  })

  const generateEmailSequence = async () => {
    if (!targetAudience.trim()) return

    setIsGenerating(true)

    try {
      const response = await fetch('/api/ai/email-outreach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetAudience,
          tone: selectedTone,
          goal: outreachGoal,
          emailCount: 3
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate emails')
      }

      const data = await response.json()
      setGeneratedEmails(data.emails)
      setSelectedEmailIndex(0)
    } catch (error) {
      console.error('Failed to generate emails:', error)
      // Fallback to mock data if API fails
      const toneStyles = {
        formal: { greeting: 'Dear', closing: 'Best regards' },
        neutral: { greeting: 'Hi', closing: 'Best' },
        casual: { greeting: 'Hey', closing: 'Cheers' }
      }
      const tone = toneStyles[selectedTone]

      const fallbackSequence: EmailSequence[] = [
        {
          id: '1',
          subject: `Quick question about your ${targetAudience.split(' ')[0].toLowerCase()} challenges`,
          body: `${tone.greeting} {{firstName}},\n\nI noticed you're working with ${targetAudience.toLowerCase()} and wanted to reach out.\n\n${outreachGoal ? `We've been helping similar teams ${outreachGoal.toLowerCase()}.` : 'We specialize in solving the exact challenges your team faces daily.'}\n\nWould you be open to a quick 15-minute call this week?\n\n${tone.closing},\n{{senderName}}`,
          delay: 0,
          generated: true
        },
        {
          id: '2',
          subject: 'Re: Quick question about your challenges',
          body: `${tone.greeting} {{firstName}},\n\nJust following up on my previous email. I know how busy things get!\n\nWould love to share a quick case study showing how we helped a similar team.\n\n${tone.closing},\n{{senderName}}`,
          delay: 3,
          generated: true
        },
        {
          id: '3',
          subject: 'Last one from me',
          body: `${tone.greeting} {{firstName}},\n\nI'll keep this brief - I don't want to clutter your inbox.\n\nIf now isn't the right time, no worries. Book a time whenever works: {{calendar_link}}\n\n${tone.closing},\n{{senderName}}`,
          delay: 5,
          generated: true
        }
      ]
      setGeneratedEmails(fallbackSequence)
      setSelectedEmailIndex(0)
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerateEmail = async (index: number) => {
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    const newEmails = [...generatedEmails]
    // In production, call Gemini API for regeneration
    newEmails[index] = {
      ...newEmails[index],
      body: newEmails[index].body + '\n\n[Regenerated with new variation]',
      generated: true
    }
    setGeneratedEmails(newEmails)
    setIsGenerating(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleSaveCampaign = () => {
    const campaign: Campaign = {
      id: Date.now().toString(),
      name: campaignName || `Campaign ${new Date().toLocaleDateString()}`,
      targetAudience,
      tone: selectedTone,
      goal: outreachGoal,
      emails: generatedEmails,
      status: 'draft',
      createdAt: new Date()
    }

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('email-campaigns') || '[]')
    localStorage.setItem('email-campaigns', JSON.stringify([...existing, campaign]))

    setShowSaveModal(false)
    setCampaignName('')
  }

  const handleSendEmail = async () => {
    if (!sendTo.trim()) return

    setIsSending(true)
    setSendResult(null)

    try {
      const currentEmail = generatedEmails[selectedEmailIndex]

      // Convert body to HTML (replace newlines with <br>)
      const htmlBody = currentEmail.body
        .replace(/\n/g, '<br>')

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: sendTo,
          subject: currentEmail.subject,
          html: htmlBody,
          variables: personalizationVars
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSendResult({ success: true, message: 'Email sent successfully!' })
      } else {
        setSendResult({ success: false, message: data.error || 'Failed to send email' })
      }
    } catch (error) {
      console.error('Send email error:', error)
      setSendResult({ success: false, message: 'Failed to send email' })
    } finally {
      setIsSending(false)
    }
  }

  const openSendModal = () => {
    setSendResult(null)
    setShowSendModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/email"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  AI Email Outreach
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Create tailored email sequences to connect with leads and drive higher response rates
                </p>
              </div>
            </div>

            {generatedEmails.length > 0 && (
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
              >
                <Save className="w-4 h-4" />
                Save Campaign
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Configuration */}
          <div className="space-y-6">
            {/* Tone Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Select tone of voice
              </h2>

              <div className="grid grid-cols-3 gap-3">
                {TONE_OPTIONS.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => setSelectedTone(tone.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedTone === tone.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-2">{tone.emoji}</div>
                    <div className={`font-medium ${
                      selectedTone === tone.value
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {tone.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {tone.description}
                    </div>
                    {selectedTone === tone.value && (
                      <div className="mt-2 flex justify-center">
                        <Check className="w-5 h-5 text-purple-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                Enter your target audience and outreach goal
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Audience
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g., Founders/CTOs needing development tools"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* Quick suggestions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {EXAMPLE_PROMPTS.slice(0, 3).map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => setTargetAudience(prompt)}
                        className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Outreach Goal (optional)
                  </label>
                  <input
                    type="text"
                    value={outreachGoal}
                    onChange={(e) => setOutreachGoal(e.target.value)}
                    placeholder="e.g., Book demo calls, Get feedback on product"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <button
                onClick={generateEmailSequence}
                disabled={!targetAudience.trim() || isGenerating}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating Sequence...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Email Sequence
                  </>
                )}
              </button>
            </div>

            {/* Stats Preview */}
            {generatedEmails.length > 0 && (
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                <h3 className="font-semibold mb-4">Sequence Overview</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{generatedEmails.length}</div>
                    <div className="text-sm text-white/80">Emails</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {generatedEmails.reduce((sum, e) => sum + e.delay, 0)}
                    </div>
                    <div className="text-sm text-white/80">Days Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold capitalize">{selectedTone}</div>
                    <div className="text-sm text-white/80">Tone</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Email Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {generatedEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20 px-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mb-6">
                  <Mail className="w-10 h-10 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Your AI-generated emails will appear here
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Select a tone, enter your target audience, and click generate to create a personalized email sequence.
                </p>
              </div>
            ) : (
              <>
                {/* Email Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  {generatedEmails.map((email, index) => (
                    <button
                      key={email.id}
                      onClick={() => setSelectedEmailIndex(index)}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                        selectedEmailIndex === index
                          ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>Email {index + 1}</span>
                        {index > 0 && (
                          <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                            +{email.delay}d
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  <button
                    className="px-4 py-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    title="Add email to sequence"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Email Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={generatedEmails[selectedEmailIndex]?.subject || ''}
                      onChange={(e) => {
                        const newEmails = [...generatedEmails]
                        newEmails[selectedEmailIndex].subject = e.target.value
                        setGeneratedEmails(newEmails)
                      }}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white font-medium"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Email Body
                    </label>
                    <textarea
                      value={generatedEmails[selectedEmailIndex]?.body || ''}
                      onChange={(e) => {
                        const newEmails = [...generatedEmails]
                        newEmails[selectedEmailIndex].body = e.target.value
                        setGeneratedEmails(newEmails)
                      }}
                      rows={12}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                    />
                  </div>

                  {/* Personalization hints */}
                  <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
                      Personalization Variables:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['{{firstName}}', '{{lastName}}', '{{company}}', '{{senderName}}', '{{calendar_link}}'].map((variable) => (
                        <span
                          key={variable}
                          className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded font-mono"
                        >
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => regenerateEmail(selectedEmailIndex)}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                      >
                        <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        Regenerate
                      </button>
                      <button
                        onClick={() => copyToClipboard(generatedEmails[selectedEmailIndex]?.body || '')}
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                    </div>

                    <button
                      onClick={openSendModal}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      <Send className="w-4 h-4" />
                      Send Test Email
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Tips for higher response rates
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">Send at optimal times</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Tuesday-Thursday, 9-11 AM works best</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Edit3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">Personalize each email</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Reference specific company details</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">Keep it short</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Under 150 words gets 50% more replies</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Campaign Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Save Campaign
            </h3>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Campaign name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCampaign}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition"
              >
                Save Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Test Email Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-500" />
              Send Test Email
            </h3>

            {sendResult && (
              <div className={`mb-4 p-3 rounded-lg ${
                sendResult.success
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                {sendResult.message}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Send to email address *
                </label>
                <input
                  type="email"
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Personalization Variables
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">First Name</label>
                    <input
                      type="text"
                      value={personalizationVars.firstName}
                      onChange={(e) => setPersonalizationVars(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={personalizationVars.lastName}
                      onChange={(e) => setPersonalizationVars(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Company</label>
                    <input
                      type="text"
                      value={personalizationVars.company}
                      onChange={(e) => setPersonalizationVars(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Acme Inc"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Sender Name</label>
                    <input
                      type="text"
                      value={personalizationVars.senderName}
                      onChange={(e) => setPersonalizationVars(prev => ({ ...prev, senderName: e.target.value }))}
                      placeholder="Your Name"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Calendar Link</label>
                    <input
                      type="text"
                      value={personalizationVars.calendar_link}
                      onChange={(e) => setPersonalizationVars(prev => ({ ...prev, calendar_link: e.target.value }))}
                      placeholder="https://calendly.com/your-link"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSendModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={!sendTo.trim() || isSending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
