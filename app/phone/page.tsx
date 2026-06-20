"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MOCK_PEOPLE, MOCK_CALLS, FIXED_TODAY } from '@/lib/peak/mock';
import type { CallRecord } from '@/lib/peak/types';

interface Call {
  id: string;
  type: 'incoming' | 'outgoing' | 'missed';
  contact: string;
  phoneNumber: string;
  time: string;
  duration?: string;
  recorded: boolean;
  transcribed: boolean;
  aiSummary: boolean;
  status?: 'active' | 'ended';
  summaryId: string; // canonical call id for /calls/summary/[id]
  actionItems?: { text: string; severity?: string }[];
  summaryText?: string;
  transcriptText?: string;
}

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  company?: string;
  lastCalled?: string;
  favorite?: boolean;
}

const NOW = new Date(FIXED_TODAY).getTime();

function relTime(iso: string): string {
  const diff = NOW - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  if (diff < 0) return new Date(iso).toLocaleDateString();
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

// Look up a phone number for a participant from the canonical contacts.
function phoneFor(name: string): string {
  const p = MOCK_PEOPLE.find((m) => m.name === name);
  return p?.phoneNumber || '+1 (415) 555-0100';
}

// Seed the call list from the canonical MOCK_CALLS (Acme world).
function seedCalls(): Call[] {
  return MOCK_CALLS.map((c: CallRecord) => {
    const other = c.participants.find((p) => p.name !== 'Sarah Chen') || c.participants[0];
    const type: Call['type'] =
      c.direction === 'INBOUND' ? 'incoming' : c.direction === 'MISSED' ? 'missed' : 'outgoing';
    return {
      id: c.id,
      summaryId: c.id,
      type,
      contact: c.title,
      phoneNumber: phoneFor(other.name),
      time: relTime(c.startTime),
      duration: c.durationSec > 0 ? c.durationLabel : undefined,
      recorded: c.hasRecording,
      transcribed: !!(c.transcript && c.transcript.length),
      aiSummary: !!c.aiSummary,
      summaryText: c.aiSummary || undefined,
      transcriptText: c.transcript?.map((t) => `${t.speaker}: ${t.text}`).join('\n'),
      actionItems: c.actionItems?.map((a) => ({ text: a, severity: 'HIGH' })),
      status: 'ended',
    };
  });
}

// Seed contacts from the canonical people directory.
function seedContacts(): Contact[] {
  return MOCK_PEOPLE.map((p) => ({
    id: p.id,
    name: p.name,
    phoneNumber: p.phoneNumber || '',
    email: p.email || undefined,
    company: p.company || undefined,
    favorite: p.favorite,
  }));
}

function PhonePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'recent' | 'contacts' | 'recordings'>('recent');
  const [isCallActive, setIsCallActive] = useState(false);
  const [dialNumber, setDialNumber] = useState('');
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);

  const [calls, setCalls] = useState<Call[]>(() => seedCalls());
  const [contacts, setContacts] = useState<Contact[]>(() => seedContacts());

  const dialerRef = useRef<HTMLInputElement | null>(null);

  // New Contact form state
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactCompany, setNewContactCompany] = useState('');

  // Read contact / autoDial query params (deep-link from /messages).
  useEffect(() => {
    const contactParam = searchParams.get('contact');
    const autoDial = searchParams.get('autoDial');
    if (!contactParam) return;
    const match = contacts.find(
      (c) => c.name.toLowerCase() === contactParam.toLowerCase()
    );
    const number = match?.phoneNumber || contactParam;
    setDialNumber(number);
    setCallError(null);
    if (autoDial === 'true' && number.trim()) {
      setIsCallActive(true);
    }
    dialerRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Stat tiles derived from the calls array (no hardcoded 47/3.5h/23/92%).
  const insights = useMemo(() => {
    const totalSec = MOCK_CALLS.reduce((s, c) => s + c.durationSec, 0);
    const totalMin = Math.round(totalSec / 60);
    const hours = (totalSec / 3600).toFixed(1);
    const avgMin = calls.length ? Math.round(totalMin / calls.length) : 0;
    const actionItems = MOCK_CALLS.reduce((s, c) => s + (c.actionItems?.length || 0), 0);
    const transcribed = calls.filter((c) => c.transcribed).length;
    const rate = calls.length ? Math.round((transcribed / calls.length) * 100) : 0;
    return { total: calls.length, hours, avgMin, actionItems, rate };
  }, [calls]);

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      setCallError('Name and Phone Number are required.');
      return;
    }
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      name: newContactName.trim(),
      phoneNumber: newContactPhone.trim(),
      email: newContactEmail || undefined,
      company: newContactCompany || undefined,
      favorite: false,
    };
    setContacts((prev) => [...prev, newContact]);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactEmail('');
    setNewContactCompany('');
    setShowNewContactModal(false);
  };

  const focusDialer = () => {
    setActiveTab('recent');
    dialerRef.current?.focus();
    dialerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const recentCalls = calls;

  const CallIcon = ({ type }: { type: 'incoming' | 'outgoing' | 'missed' }) => {
    if (type === 'incoming') {
      return (
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    }
    if (type === 'outgoing') {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  };

  const CallCard = ({ call }: { call: Call }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 rounded-full ${
            call.type === 'missed' ? 'bg-red-100' : 'bg-gray-100'
          } flex items-center justify-center`}>
            <CallIcon type={call.type} />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">{call.contact}</h3>
              {call.status === 'active' && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full animate-pulse">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
              <span>{call.phoneNumber}</span>
              <span>•</span>
              <span>{call.time}</span>
              {call.duration && (
                <>
                  <span>•</span>
                  <span>{call.duration}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {call.aiSummary && (
            <Link
              href={`/calls/summary/${call.summaryId}`}
              className="px-3 py-1.5 bg-violet-100 text-violet-700 text-sm rounded-lg hover:bg-violet-200 transition-colors"
            >
              Summary
            </Link>
          )}
          {call.transcribed && (
            <Link
              href={`/calls/summary/${call.summaryId}#transcript`}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
            >
              Transcript
            </Link>
          )}
          <button
            onClick={() => {
              setDialNumber(call.phoneNumber);
              setCallError(null);
              setIsCallActive(true);
              focusDialer();
            }}
            title="Call back"
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const ContactCard = ({ contact }: { contact: Contact }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-medium">
            {contact.name ? contact.name.split(' ').map(n => n ? n[0] : '').join('') : 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">{contact.name}</h3>
              {contact.favorite && (
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-500">{contact.company}</p>
            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
              <span>{contact.phoneNumber}</span>
              {contact.lastCalled && (
                <>
                  <span>•</span>
                  <span>Last called: {contact.lastCalled}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href={`/messages?contact=${encodeURIComponent(contact.name)}`}
            title="Message"
            className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </Link>
          <button
            onClick={() => {
              setDialNumber(contact.phoneNumber);
              setCallError(null);
              focusDialer();
            }}
            title="Call"
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Phone Calls</h1>
              <p className="text-sm text-gray-500 mt-1">Make calls with automatic recording and AI transcription</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowNewContactModal(true)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                Add Contact
              </button>
              <button
                onClick={focusDialer}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm font-medium"
              >
                New Call
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-6">
        {/* Dialer */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-8 text-white mb-6">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Quick Dial</h2>

            {callError && (
              <div className="mb-4 p-3 bg-red-500/20 backdrop-blur-sm border border-red-500 text-red-100 rounded-lg text-center text-sm font-semibold" id="phone-validation-message">
                {callError}
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <input
                ref={dialerRef}
                type="tel"
                value={dialNumber}
                onChange={(e) => {
                  setDialNumber(e.target.value);
                  if (e.target.value.trim()) setCallError(null);
                }}
                placeholder="Enter phone number..."
                className="w-full bg-transparent text-2xl text-center placeholder-white/50 focus:outline-none"
              />
            </div>

            {/* Dial Pad */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => {
                    setDialNumber(prev => prev + digit);
                    setCallError(null);
                  }}
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg p-4 text-xl font-medium transition-colors"
                >
                  {digit}
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              {isCallActive ? (
                <button
                  // EXTERNAL: needs Twilio to place a real outbound call + recording media.
                  // Demo path: logs the call to the in-memory recents list.
                  onClick={() => {
                    setIsCallActive(false);
                    setCallError(null);
                    const contactName =
                      contacts.find((c) => c.phoneNumber === dialNumber)?.name ||
                      dialNumber || 'Unknown Number';
                    const newCall: Call = {
                      id: `call-${Date.now()}`,
                      summaryId: 'call-q2-campaign',
                      type: 'outgoing',
                      contact: contactName,
                      phoneNumber: dialNumber || 'Unknown Number',
                      time: 'Just now',
                      duration: '0:15',
                      recorded: true,
                      transcribed: false,
                      aiSummary: false,
                      status: 'ended',
                    };
                    setCalls((prev) => [newCall, ...prev]);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 rounded-lg py-3 flex items-center justify-center space-x-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>End Call</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!dialNumber.trim()) {
                      setCallError('Please enter a phone number before calling.');
                      return;
                    }
                    setCallError(null);
                    setIsCallActive(true);
                  }}
                  className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg py-3 flex items-center justify-center space-x-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Call</span>
                </button>
              )}
              <button
                onClick={() => {
                  setDialNumber('');
                  setCallError(null);
                }}
                className="px-6 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>

            {/* AI Recording Notice */}
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="font-medium">Lisa Recording Active</p>
                  <p className="text-sm text-violet-100">Auto-transcription enabled</p>
                </div>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 p-1 mb-6">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-all ${
              activeTab === 'recent' ? 'bg-violet-500 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recent Calls
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-all ${
              activeTab === 'contacts' ? 'bg-violet-500 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Contacts
          </button>
          <button
            onClick={() => setActiveTab('recordings')}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-all ${
              activeTab === 'recordings' ? 'bg-violet-500 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recordings
          </button>
        </div>

        {/* Recent Calls */}
        {activeTab === 'recent' && (
          <div className="space-y-3">
            {recentCalls.map((call) => (
              <CallCard key={call.id} call={call} />
            ))}
          </div>
        )}

        {/* Contacts */}
        {activeTab === 'contacts' && (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        )}

        {/* Recordings */}
        {activeTab === 'recordings' && (
          <div className="space-y-3" id="recordings-list-container">
            {recentCalls.filter(call => call.recorded).map((call) => (
              <div key={call.id} className="bg-white rounded-xl border border-gray-200 p-6 recording-item-card text-gray-950 dark:text-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{call.contact}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{call.time}</span>
                      <span>•</span>
                      <span>Duration: {call.duration}</span>
                    </div>

                    <div className="flex items-center space-x-3 mt-4">
                      {call.transcribed ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          ✓ Transcribed
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                          Not Transcribed
                        </span>
                      )}
                      {call.aiSummary && (
                        <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full">
                          ✓ Summary
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/calls/summary/${call.summaryId}#transcript`}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      View Transcript
                    </Link>
                    <Link
                      href={`/calls/summary/${call.summaryId}`}
                      className="px-3 py-1.5 bg-violet-500 text-white text-sm rounded-lg hover:bg-violet-600 transition-colors"
                    >
                      View Summary
                    </Link>
                  </div>
                </div>

                {call.transcribed && call.transcriptText && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-xs font-semibold text-gray-500 mb-2">TRANSCRIPT:</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 transcript-content-text whitespace-pre-line">{call.transcriptText}</p>
                  </div>
                )}

                {call.aiSummary && call.summaryText && (
                  <div className="mt-4 p-4 bg-violet-50 dark:bg-violet-950/20 rounded-lg">
                    <div className="flex items-center text-sm text-violet-700 dark:text-violet-300 mb-2">
                      <span className="mr-2">🤖</span>
                      <span className="font-medium">Lisa&apos;s Summary:</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 summary-content-text">{call.summaryText}</p>
                    {call.actionItems && call.actionItems.length > 0 && (
                      <div className="mt-3 border-t border-violet-100 dark:border-violet-900 pt-2">
                        <div className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-1">Extracted Action Items (Auto-Synced to Tasks):</div>
                        <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-400 space-y-1 action-items-list">
                          {call.actionItems.map((item: { text: string; severity?: string }, idx: number) => (
                            <li key={idx} className="action-item-text-row">
                              {item.text} <span className="text-[10px] font-semibold uppercase px-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded ml-1">{item.severity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Insights */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🤖</span>
              Call Intelligence by Lisa
            </h3>
            <button
              onClick={() => router.push('/calls')}
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              View All Insights
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-violet-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📞</span>
                <span className="text-2xl font-bold text-gray-900">{insights.total}</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Total Calls</p>
              <p className="text-xs text-gray-500 mt-1">Recent activity</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">⏱️</span>
                <span className="text-2xl font-bold text-gray-900">{insights.hours}h</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Total Duration</p>
              <p className="text-xs text-gray-500 mt-1">Average: {insights.avgMin} min</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📝</span>
                <span className="text-2xl font-bold text-gray-900">{insights.actionItems}</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Action Items</p>
              <p className="text-xs text-gray-500 mt-1">Extracted from calls</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">💬</span>
                <span className="text-2xl font-bold text-gray-900">{insights.rate}%</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Transcription Rate</p>
              <p className="text-xs text-gray-500 mt-1">Calls transcribed</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Contact Modal */}
      {showNewContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Contact</h2>
              <button
                onClick={() => {
                  setShowNewContactModal(false);
                  setNewContactName('');
                  setNewContactPhone('');
                  setNewContactEmail('');
                  setNewContactCompany('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="Enter contact name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="Enter phone number..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="Enter email address..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={newContactCompany}
                  onChange={(e) => setNewContactCompany(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="Enter company name..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewContactModal(false);
                  setNewContactName('');
                  setNewContactPhone('');
                  setNewContactEmail('');
                  setNewContactCompany('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContact}
                className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all text-sm font-medium"
              >
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PhonePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <PhonePageInner />
    </Suspense>
  );
}
