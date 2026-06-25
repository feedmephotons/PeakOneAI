"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MOCK_PEOPLE, MOCK_CALLS, FIXED_TODAY } from '@/lib/peak/mock';
import type { CallRecord } from '@/lib/peak/types';
import { useSoftphone, formatCallDuration } from '@/lib/peak/use-softphone';
import { SmsComposeModal } from '@/components/peak';

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
  const [dialNumber, setDialNumber] = useState('');
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);

  // Real in-browser softphone (Twilio Voice SDK). The hook handles token fetch,
  // Device registration, the active Call object, mute, hang up and live state.
  const phone = useSoftphone();
  const isCallActive =
    phone.status === 'connecting' ||
    phone.status === 'ringing' ||
    phone.status === 'in-call';

  // SMS composer (navy Peak modal) — target prefilled from a contact/dial number.
  const [smsTarget, setSmsTarget] = useState<{ to: string; name?: string } | null>(null);

  const [calls, setCalls] = useState<Call[]>(() => seedCalls());
  const [contacts, setContacts] = useState<Contact[]>(() => seedContacts());

  const dialerRef = useRef<HTMLInputElement | null>(null);

  // Surface Twilio/device errors from the softphone into the dialer banner.
  useEffect(() => {
    if (phone.status === 'error' && phone.error) {
      setCallError(phone.error);
    }
  }, [phone.status, phone.error]);

  // When a real call ends, log it into the in-memory recents list (once).
  const loggedEndRef = useRef(false);
  useEffect(() => {
    if (phone.status === 'in-call' || phone.status === 'ringing' || phone.status === 'connecting') {
      loggedEndRef.current = false;
    }
    if (phone.status === 'ended' && !loggedEndRef.current) {
      loggedEndRef.current = true;
      const dialed = phone.activeNumber || dialNumber || 'Unknown Number';
      const contactName =
        contacts.find((c) => c.phoneNumber === dialed)?.name || dialed;
      const secs = phone.durationSec;
      const newCall: Call = {
        id: `call-${Date.now()}`,
        summaryId: 'call-q2-campaign',
        type: 'outgoing',
        contact: contactName,
        phoneNumber: dialed,
        time: 'Just now',
        duration: secs > 0 ? formatCallDuration(secs) : '0:00',
        recorded: false,
        transcribed: false,
        aiSummary: false,
        status: 'ended',
      };
      setCalls((prev) => [newCall, ...prev]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone.status]);

  // Start a softphone call to a given number (used by dialer + contact/recent buttons).
  const startCall = (number: string) => {
    const num = (number || '').trim();
    if (!num) {
      setCallError('Please enter a phone number before calling.');
      return;
    }
    setCallError(null);
    setDialNumber(num);
    phone.call(num);
  };

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
      // Place a real softphone call to the deep-linked number.
      startCall(number);
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
        <svg className="w-4 h-4 text-peak-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    }
    if (type === 'outgoing') {
      return (
        <svg className="w-4 h-4 text-peak-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-peak-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  };

  const CallCard = ({ call }: { call: Call }) => (
    <div className="bg-peak-glass border border-peak-border rounded-2xl p-4 transition-all duration-200 hover:bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 rounded-full ${
            call.type === 'missed' ? 'bg-peak-red/15' : 'bg-white/[0.06]'
          } flex items-center justify-center`}>
            <CallIcon type={call.type} />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-peak">{call.contact}</h3>
              {call.status === 'active' && (
                <span className="px-2 py-0.5 bg-peak-green/15 text-peak-green text-xs rounded-full animate-pulse">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 mt-1 text-sm text-peak-muted">
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
              className="px-3 py-1.5 bg-peak-primary/15 text-peak-primary-300 text-sm rounded-lg hover:bg-peak-primary/25 transition-colors"
            >
              Summary
            </Link>
          )}
          {call.transcribed && (
            <Link
              href={`/calls/summary/${call.summaryId}#transcript`}
              className="px-3 py-1.5 bg-white/[0.04] border border-peak-border text-peak-muted text-sm rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              Transcript
            </Link>
          )}
          <button
            onClick={() => {
              focusDialer();
              startCall(call.phoneNumber);
            }}
            title="Call back"
            className="p-2 bg-peak-primary text-white rounded-lg hover:bg-peak-primary-600 transition-colors"
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
    <div className="bg-peak-glass border border-peak-border rounded-2xl p-4 transition-all duration-200 hover:bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-peak-primary/20 ring-1 ring-peak-primary/20 flex items-center justify-center text-peak-primary-300 font-medium">
            {contact.name ? contact.name.split(' ').map(n => n ? n[0] : '').join('') : 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-peak">{contact.name}</h3>
              {contact.favorite && (
                <svg className="w-4 h-4 text-peak-amber fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              )}
            </div>
            <p className="text-sm text-peak-muted">{contact.company}</p>
            <div className="flex items-center space-x-3 mt-1 text-xs text-peak-dim">
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
          <button
            type="button"
            onClick={() => setSmsTarget({ to: contact.phoneNumber, name: contact.name })}
            title="Message (SMS)"
            disabled={!contact.phoneNumber}
            className="p-2 bg-white/[0.04] border border-peak-border text-peak-muted rounded-lg hover:bg-white/[0.06] hover:text-peak transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
          <button
            onClick={() => {
              focusDialer();
              startCall(contact.phoneNumber);
            }}
            title="Call"
            disabled={!contact.phoneNumber}
            className="p-2 bg-peak-primary text-white rounded-lg hover:bg-peak-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-peak-muted">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-peak-primary/15 text-peak-primary-300">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </span>
            Softphone
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-peak md:text-4xl">Phone Calls</h1>
          <p className="mt-2 max-w-xl text-sm text-peak-muted">Make calls with automatic recording and AI transcription</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNewContactModal(true)}
            className="px-4 py-2 bg-white/[0.04] border border-peak-border rounded-xl hover:bg-white/[0.06] transition-colors text-sm font-medium text-peak"
          >
            Add Contact
          </button>
          <button
            onClick={focusDialer}
            className="px-4 py-2 bg-peak-primary text-white rounded-xl shadow-peak-glow hover:bg-peak-primary-600 transition-colors text-sm font-medium"
          >
            New Call
          </button>
        </div>
      </div>

      <div className="w-full">
        {/* Dialer */}
        <div className="relative overflow-hidden bg-peak-glass border border-peak-border rounded-2xl p-8 text-peak mb-6">
          {/* Cosmic purple aurora bloom on the right */}
          <div className="peak-aurora" aria-hidden />
          <div className="pointer-events-none absolute -right-16 top-1/2 -translate-y-1/2 h-56 w-56 rounded-full bg-peak-primary/25 blur-[90px]" aria-hidden />
          <div className="relative max-w-md mx-auto">
            <h2 className="text-2xl font-semibold tracking-tight text-center mb-6 text-peak">Quick Dial</h2>

            {callError && (
              <div className="mb-4 p-3 bg-peak-red/15 border border-peak-red/40 text-peak-red rounded-lg text-center text-sm font-semibold" id="phone-validation-message">
                {callError}
              </div>
            )}

            <div className="bg-white/[0.04] border border-peak-border rounded-lg p-4 mb-6">
              <input
                ref={dialerRef}
                type="tel"
                value={dialNumber}
                onChange={(e) => {
                  setDialNumber(e.target.value);
                  if (e.target.value.trim()) setCallError(null);
                }}
                placeholder="Enter phone number..."
                className="w-full bg-transparent text-2xl text-center text-peak placeholder:text-peak-dim focus:outline-none"
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
                  className="bg-white/[0.04] border border-peak-border text-peak hover:bg-white/[0.06] focus:ring-2 focus:ring-peak-primary focus:outline-none active:ring-2 active:ring-peak-primary rounded-lg p-4 text-xl font-medium transition-colors"
                >
                  {digit}
                </button>
              ))}
            </div>

            {/* Live call status banner (real Twilio Voice SDK state) */}
            {isCallActive && (
              <div className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-peak" id="softphone-status">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-peak-green opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-peak-green"></span>
                </span>
                {phone.status === 'connecting' && <span>Connecting…</span>}
                {phone.status === 'ringing' && <span>Ringing…</span>}
                {phone.status === 'in-call' && (
                  <span>In call · {formatCallDuration(phone.durationSec)}</span>
                )}
              </div>
            )}
            {phone.status === 'initializing' && (
              <div className="mb-4 text-center text-sm text-peak-muted" id="softphone-status">
                Setting up your line…
              </div>
            )}

            <div className="flex space-x-3">
              {isCallActive ? (
                <>
                  <button
                    onClick={phone.toggleMute}
                    disabled={phone.status !== 'in-call'}
                    title={phone.muted ? 'Unmute' : 'Mute'}
                    className={`px-5 rounded-lg border transition-colors disabled:opacity-40 ${
                      phone.muted
                        ? 'bg-peak-primary/20 border-peak-primary/40 text-peak-primary-300'
                        : 'bg-white/[0.04] border-peak-border text-peak-muted hover:bg-white/[0.06] hover:text-peak'
                    }`}
                  >
                    {phone.muted ? 'Unmute' : 'Mute'}
                  </button>
                  <button
                    onClick={phone.hangup}
                    className="flex-1 bg-peak-red hover:bg-peak-red/80 text-white rounded-lg py-3 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Hang Up</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => startCall(dialNumber)}
                  disabled={phone.status === 'initializing'}
                  className="flex-1 bg-peak-primary hover:bg-peak-primary-600 text-white shadow-peak-glow rounded-lg py-3 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Call</span>
                </button>
              )}
              <button
                onClick={() => {
                  if (isCallActive) return;
                  setDialNumber('');
                  setCallError(null);
                }}
                disabled={isCallActive}
                className="px-6 bg-white/[0.04] border border-peak-border text-peak-muted hover:bg-white/[0.06] hover:text-peak rounded-lg transition-colors disabled:opacity-40"
              >
                Clear
              </button>
            </div>

            {/* AI Recording Notice */}
            <div className="mt-6 bg-white/[0.04] border border-peak-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="font-medium text-peak">Lisa Recording Active</p>
                  <p className="text-sm text-peak-muted">Auto-transcription enabled</p>
                </div>
              </div>
              <div className="w-2 h-2 bg-peak-green rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-peak-border bg-white/[0.02] p-1 mb-6">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'recent' ? 'bg-peak-primary/20 text-peak-primary-300' : 'text-peak-muted hover:text-peak'
            }`}
          >
            Recent Calls
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'contacts' ? 'bg-peak-primary/20 text-peak-primary-300' : 'text-peak-muted hover:text-peak'
            }`}
          >
            Contacts
          </button>
          <button
            onClick={() => setActiveTab('recordings')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'recordings' ? 'bg-peak-primary/20 text-peak-primary-300' : 'text-peak-muted hover:text-peak'
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
              <div key={call.id} className="bg-peak-glass border border-peak-border rounded-2xl p-6 recording-item-card text-peak">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-peak">{call.contact}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-peak-muted">
                      <span>{call.time}</span>
                      <span>•</span>
                      <span>Duration: {call.duration}</span>
                    </div>

                    <div className="flex items-center space-x-3 mt-4">
                      {call.transcribed ? (
                        <span className="px-2 py-1 bg-peak-green/15 text-peak-green text-xs rounded-full">
                          ✓ Transcribed
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-white/[0.06] text-peak-muted text-xs rounded-full">
                          Not Transcribed
                        </span>
                      )}
                      {call.aiSummary && (
                        <span className="px-2 py-1 bg-peak-primary/15 text-peak-primary-300 text-xs rounded-full">
                          ✓ Summary
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/calls/summary/${call.summaryId}#transcript`}
                      className="px-3 py-1.5 bg-white/[0.04] border border-peak-border text-peak-muted text-sm rounded-lg hover:bg-white/[0.06] hover:text-peak transition-colors"
                    >
                      View Transcript
                    </Link>
                    <Link
                      href={`/calls/summary/${call.summaryId}`}
                      className="px-3 py-1.5 bg-peak-primary text-white text-sm rounded-lg hover:bg-peak-primary-600 transition-colors"
                    >
                      View Summary
                    </Link>
                  </div>
                </div>

                {call.transcribed && call.transcriptText && (
                  <div className="mt-4 p-4 bg-white/[0.03] border border-peak-border rounded-lg">
                    <div className="text-xs font-semibold text-peak-muted mb-2">TRANSCRIPT:</div>
                    <p className="text-sm text-peak-muted transcript-content-text whitespace-pre-line">{call.transcriptText}</p>
                  </div>
                )}

                {call.aiSummary && call.summaryText && (
                  <div className="mt-4 p-4 bg-peak-primary/[0.08] border border-peak-primary/20 rounded-lg">
                    <div className="flex items-center text-sm text-peak-primary-300 mb-2">
                      <span className="mr-2">🤖</span>
                      <span className="font-medium">Lisa&apos;s Summary:</span>
                    </div>
                    <p className="text-sm text-peak-muted summary-content-text">{call.summaryText}</p>
                    {call.actionItems && call.actionItems.length > 0 && (
                      <div className="mt-3 border-t border-peak-primary/20 pt-2">
                        <div className="text-xs font-bold text-peak-primary-300 mb-1">Extracted Action Items (Auto-Synced to Tasks):</div>
                        <ul className="list-disc pl-5 text-xs text-peak-muted space-y-1 action-items-list">
                          {call.actionItems.map((item: { text: string; severity?: string }, idx: number) => (
                            <li key={idx} className="action-item-text-row">
                              {item.text} <span className="text-[10px] font-semibold uppercase px-1 bg-peak-red/15 text-peak-red rounded ml-1">{item.severity}</span>
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
        <div className="mt-8 bg-peak-glass border border-peak-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-peak flex items-center">
              <span className="mr-2">🤖</span>
              Call Intelligence by Lisa
            </h3>
            <button
              onClick={() => router.push('/calls')}
              className="text-sm text-peak-primary-300 hover:text-peak-primary font-medium"
            >
              View All Insights
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-peak-primary/[0.08] border border-peak-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📞</span>
                <span className="text-2xl font-bold text-peak">{insights.total}</span>
              </div>
              <p className="text-sm font-medium text-peak">Total Calls</p>
              <p className="text-xs text-peak-muted mt-1">Recent activity</p>
            </div>

            <div className="bg-peak-green/[0.08] border border-peak-green/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">⏱️</span>
                <span className="text-2xl font-bold text-peak">{insights.hours}h</span>
              </div>
              <p className="text-sm font-medium text-peak">Total Duration</p>
              <p className="text-xs text-peak-muted mt-1">Average: {insights.avgMin} min</p>
            </div>

            <div className="bg-peak-blue/[0.08] border border-peak-blue/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📝</span>
                <span className="text-2xl font-bold text-peak">{insights.actionItems}</span>
              </div>
              <p className="text-sm font-medium text-peak">Action Items</p>
              <p className="text-xs text-peak-muted mt-1">Extracted from calls</p>
            </div>

            <div className="bg-peak-amber/[0.08] border border-peak-amber/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">💬</span>
                <span className="text-2xl font-bold text-peak">{insights.rate}%</span>
              </div>
              <p className="text-sm font-medium text-peak">Transcription Rate</p>
              <p className="text-xs text-peak-muted mt-1">Calls transcribed</p>
            </div>
          </div>
        </div>
      </div>

      {/* SMS Compose Modal (navy Peak) — posts /api/twilio/sms */}
      <SmsComposeModal
        open={!!smsTarget}
        onClose={() => setSmsTarget(null)}
        to={smsTarget?.to || ''}
        contactName={smsTarget?.name}
      />

      {/* New Contact Modal */}
      {showNewContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowNewContactModal(false);
              setNewContactName('');
              setNewContactPhone('');
              setNewContactEmail('');
              setNewContactCompany('');
            }}
            aria-hidden
          />
          <div className="relative z-10 peak-glass rounded-2xl p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-peak">Add New Contact</h2>
              <button
                onClick={() => {
                  setShowNewContactModal(false);
                  setNewContactName('');
                  setNewContactPhone('');
                  setNewContactEmail('');
                  setNewContactCompany('');
                }}
                className="text-peak-muted hover:text-peak"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-peak-muted mb-1">Name</label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-lg focus:outline-none focus:border-peak-primary/50"
                  placeholder="Enter contact name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-peak-muted mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-lg focus:outline-none focus:border-peak-primary/50"
                  placeholder="Enter phone number..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-peak-muted mb-1">Email</label>
                <input
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-lg focus:outline-none focus:border-peak-primary/50"
                  placeholder="Enter email address..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-peak-muted mb-1">Company</label>
                <input
                  type="text"
                  value={newContactCompany}
                  onChange={(e) => setNewContactCompany(e.target.value)}
                  className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border text-peak placeholder:text-peak-dim rounded-lg focus:outline-none focus:border-peak-primary/50"
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
                className="px-4 py-2 text-peak-muted hover:text-peak font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContact}
                className="px-6 py-2 bg-peak-primary text-white rounded-lg shadow-peak-glow hover:bg-peak-primary-600 transition-colors text-sm font-medium"
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
    <Suspense fallback={<div className="min-h-full" />}>
      <PhonePageInner />
    </Suspense>
  );
}
