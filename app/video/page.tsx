"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain, Circle, FileText, Languages, ListChecks, Link2, Video, X,
  Play, Download, Sparkles, Calendar, Plus,
} from 'lucide-react';
import { GlassPanel, SectionLabel, AskLisaBar } from '@/components/peak';
import {
  getMockMeetingDetails, MOCK_CALENDAR_EVENTS, MOCK_USER, MOCK_TEAM,
  FIXED_TODAY_DATE,
} from '@/lib/peak/mock';

interface Meeting {
  id: string;
  title: string;
  time: string;
  duration?: string;
  participants: number;
  status: 'upcoming' | 'live' | 'completed';
  hasAI: boolean;
  joinUrl: string;
  meetingId?: string;
}

interface Recording {
  id: string;
  title: string;
  date: string;
  duration: string;
  size: string;
  transcript: boolean;
  summary: boolean;
  meetingId: string;
}

const PILLAR_BADGES = [
  { label: 'Recorded', icon: Circle },
  { label: 'Transcribed', icon: FileText },
  { label: 'Translated', icon: Languages },
  { label: 'Summarized', icon: Brain },
  { label: 'Action Items', icon: ListChecks },
  { label: 'Memory-Linked', icon: Link2 },
] as const;

// ---- Canonical Acme Corp seed data (pinned to the 2026-06-18 world) ----------

// Today's schedule: calendar meeting events (the two real meetings live + a
// standup upcoming), pinned to the fixed world.
const TODAY = FIXED_TODAY_DATE.slice(0, 10); // 2026-06-18

function buildTodayMeetings(): Meeting[] {
  return MOCK_CALENDAR_EVENTS.filter((e) => e.type === 'MEETING').map((e) => {
    const startDate = e.start.split('T')[0];
    const startTime = new Date(e.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const status: Meeting['status'] =
      startDate < TODAY ? 'completed' : e.meetingId ? 'live' : 'upcoming';
    return {
      id: e.id,
      title: e.title,
      time: startTime,
      participants: (e.attendees || []).length,
      status,
      hasAI: !!e.meetingId,
      joinUrl: e.joinUrl || `/video/room/${e.meetingId || e.id}`,
      meetingId: e.meetingId || undefined,
    };
  });
}

// Recordings: derived from the two meetings that have transcripts/summaries.
function buildRecordings(): Recording[] {
  return getMockMeetingDetails().map((d) => ({
    id: `rec-${d.id}`,
    title: d.title,
    date: new Date(d.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    duration: d.durationLabel || '—',
    size: d.id === 'meeting-launch-sync' ? '512 MB' : '298 MB',
    transcript: !!(d.transcript && d.transcript.length),
    summary: !!d.aiSummary,
    meetingId: d.id,
  }));
}

export default function VideoPage() {
  const router = useRouter();
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [selectedView, setSelectedView] = useState<'meetings' | 'recordings'>('meetings');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Controlled Schedule Meeting form.
  const [form, setForm] = useState({
    title: '',
    date: TODAY,
    time: '10:00',
    duration: '30 minutes',
    participants: '',
  });
  const [scheduleConfirm, setScheduleConfirm] = useState<string | null>(null);

  const todayMeetings = buildTodayMeetings();
  const recordings = buildRecordings();

  const joinMeeting = (m: Meeting) => {
    router.push(m.joinUrl);
  };

  const startInstantMeeting = () => {
    // Deterministic room id for the demo world.
    router.push('/video/room/instant');
  };

  const joinMeetingWithCode = () => {
    if (joinCode.trim()) {
      const id = joinCode.trim().replace(/^.*\/video\/room\//, '');
      router.push(`/video/room/${id}`);
      setShowJoinModal(false);
      setJoinCode('');
    }
  };

  // Persist a scheduled meeting into the shared calendar store so it shows on
  // /calendar. (Same `Event` shape the calendar page reads.)
  const handleScheduleMeeting = () => {
    if (!form.title.trim()) return;
    const durMins = form.duration === '1 hour' ? 60 : form.duration === '1.5 hours' ? 90 : form.duration === '2 hours' ? 120 : 30;
    const [h, mn] = form.time.split(':').map(Number);
    const endTotal = h * 60 + mn + durMins;
    const endTime = `${String(Math.floor(endTotal / 60) % 24).padStart(2, '0')}:${String(endTotal % 60).padStart(2, '0')}`;
    const id = `evt-scheduled-${form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24)}`;
    const newEvent = {
      id,
      title: form.title.trim(),
      description: aiEnabled ? 'Lisa Meeting Intelligence enabled — recorded, transcribed & summarized.' : undefined,
      date: form.date,
      startTime: form.time,
      endTime,
      type: 'meeting' as const,
      participants: form.participants
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
      color: 'bg-peak-primary',
      isAllDay: false,
      recurring: 'none' as const,
      joinUrl: `/video/room/${id}`,
      meetingId: id,
    };
    try {
      const raw = localStorage.getItem('calendar-events');
      const existing = raw ? JSON.parse(raw) : [];
      const merged = [...existing.filter((e: { id: string }) => e.id !== id), newEvent];
      localStorage.setItem('calendar-events', JSON.stringify(merged));
    } catch {
      // ignore storage errors in the demo
    }
    setScheduleConfirm(`“${form.title.trim()}” added to your calendar for ${form.date} at ${form.time}.`);
    setShowNewMeetingModal(false);
    setForm({ title: '', date: TODAY, time: '10:00', duration: '30 minutes', participants: '' });
  };

  const statusBadge = (status: Meeting['status']) => {
    if (status === 'live')
      return <span className="px-2 py-1 bg-peak-red/15 text-peak-red ring-1 ring-peak-red/25 text-xs font-medium rounded-full animate-pulse">LIVE</span>;
    if (status === 'upcoming')
      return <span className="px-2 py-1 bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/25 text-xs font-medium rounded-full">UPCOMING</span>;
    return <span className="px-2 py-1 bg-white/[0.06] text-peak-muted ring-1 ring-peak-border text-xs font-medium rounded-full">COMPLETED</span>;
  };

  const MeetingCard = ({ meeting }: { meeting: Meeting }) => (
    <GlassPanel className="p-6 hover:bg-white/[0.04] transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-peak">{meeting.title}</h3>
          <p className="text-sm text-peak-muted mt-1">{meeting.time}</p>
        </div>
        {statusBadge(meeting.status)}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex -space-x-2">
          {[...Array(Math.min(4, meeting.participants))].map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-peak-primary/20 ring-2 ring-peak-panel flex items-center justify-center text-peak-primary-300 text-xs font-medium"
            >
              {i + 1}
            </div>
          ))}
        </div>
        <span className="text-sm text-peak-muted">{meeting.participants} participants</span>
      </div>

      {meeting.hasAI && (
        <div className="flex items-center text-sm text-peak-primary-300 mb-4">
          <Brain className="w-4 h-4 mr-2" />
          <span>Lisa will record, transcribe &amp; summarize</span>
        </div>
      )}

      <div className="flex gap-2">
        {meeting.status === 'completed' ? (
          <>
            <button
              onClick={() => router.push(`/meeting/${meeting.meetingId || meeting.id}`)}
              className="flex-1 px-4 py-2 bg-white/[0.04] border border-peak-border text-peak rounded-lg hover:bg-white/[0.08] transition-colors text-sm font-medium"
            >
              View Recording
            </button>
            <button
              onClick={() => router.push(`/meeting/${meeting.meetingId || meeting.id}`)}
              className="px-4 py-2 bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/25 rounded-lg hover:bg-peak-primary/25 transition-colors text-sm font-medium"
            >
              Summary
            </button>
          </>
        ) : (
          <button
            onClick={() => joinMeeting(meeting)}
            className="flex-1 px-4 py-2 bg-peak-primary text-white rounded-lg hover:bg-peak-primary-600 shadow-peak-glow transition text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Video className="w-4 h-4" />
            {meeting.status === 'live' ? 'Join Now' : 'Start Meeting'}
          </button>
        )}
      </div>
    </GlassPanel>
  );

  const RecordingCard = ({ recording }: { recording: Recording }) => (
    <GlassPanel className="p-6 hover:bg-white/[0.04] transition-colors">
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.push(`/meeting/${recording.meetingId}`)}
          className="w-32 h-20 bg-peak-primary/10 ring-1 ring-peak-primary/20 rounded-lg flex items-center justify-center hover:bg-peak-primary/20 transition shrink-0"
          title="Play recording"
        >
          <Play className="w-8 h-8 text-peak-primary-300" />
        </button>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-peak">{recording.title}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-peak-muted">
            <span>{recording.date}</span>
            <span>&bull;</span>
            <span>{recording.duration}</span>
            <span>&bull;</span>
            <span>{recording.size}</span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            {recording.transcript && (
              <span className="px-2 py-1 bg-peak-green/12 text-peak-green ring-1 ring-peak-green/25 text-xs rounded-full flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Transcript
              </span>
            )}
            {recording.summary && (
              <span className="px-2 py-1 bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/25 text-xs rounded-full flex items-center gap-1">
                <Brain className="w-3 h-3" />
                Summary
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => router.push(`/meeting/${recording.meetingId}`)}
              className="px-3 py-1.5 bg-peak-primary text-white text-sm rounded-lg hover:bg-peak-primary-600 shadow-peak-glow transition flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5" /> Play
            </button>
            <button
              onClick={() => router.push('/files')}
              className="px-3 py-1.5 bg-white/[0.04] border border-peak-border text-peak text-sm rounded-lg hover:bg-white/[0.08] transition flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            {recording.transcript && (
              <button
                onClick={() => router.push(`/meeting/${recording.meetingId}`)}
                className="px-3 py-1.5 bg-white/[0.04] border border-peak-border text-peak text-sm rounded-lg hover:bg-white/[0.08] transition"
              >
                View Transcript
              </button>
            )}
            {recording.summary && (
              <button
                onClick={() => router.push(`/meeting/${recording.meetingId}`)}
                className="px-3 py-1.5 bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/25 text-sm rounded-lg hover:bg-peak-primary/25 transition"
              >
                Insights
              </button>
            )}
          </div>
        </div>
      </div>
    </GlassPanel>
  );

  return (
    <div className="px-6 py-6 sm:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-peak-muted">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-peak-primary/15 text-peak-primary-300">
              <Video className="h-3 w-3" />
            </span>
            Meetings
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-peak">Meetings</h1>
          <p className="mt-2 text-sm text-peak-muted">Meetings that run themselves</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden w-56 xl:block">
            <AskLisaBar placeholder="Ask Lisa about your meetings…" />
          </div>
          <button
            onClick={() => setShowNewMeetingModal(true)}
            className="px-4 py-2 bg-white/[0.04] border border-peak-border rounded-xl hover:bg-white/[0.08] transition-colors text-sm font-medium text-peak flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Schedule Meeting
          </button>
          <button
            onClick={startInstantMeeting}
            className="px-4 py-2 bg-peak-primary text-white rounded-xl hover:bg-peak-primary-600 shadow-peak-glow transition text-sm font-semibold flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            Start Instant Meeting
          </button>
        </div>
      </div>

      {scheduleConfirm && (
        <div className="mb-4 text-sm px-4 py-2.5 rounded-xl bg-peak-green/12 border border-peak-green/25 text-peak-green flex items-center justify-between">
          <span>{scheduleConfirm}</span>
          <button onClick={() => setScheduleConfirm(null)} className="text-peak-green/80 hover:text-peak-green">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="rounded-2xl p-8 mb-6 bg-gradient-to-br from-peak-primary/25 to-peak-primary/5 border border-peak-primary/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-peak">Meetings that run themselves</h2>
            <p className="text-peak-muted mt-1">Every meeting is automatically captured, understood, and connected to your workflow.</p>
          </div>
          <div className="flex items-center gap-2 bg-white/[0.06] px-4 py-2 rounded-lg ring-1 ring-peak-border">
            <div className="w-2 h-2 bg-peak-green rounded-full"></div>
            <span className="text-sm font-medium text-peak">System Ready</span>
          </div>
        </div>

        {/* 6 Pillar Feature Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {PILLAR_BADGES.map(({ label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 bg-white/[0.05] ring-1 ring-peak-border rounded-lg px-3 py-2.5">
              <Icon className="w-4 h-4 text-peak-primary-300 flex-shrink-0" />
              <span className="text-sm font-medium text-peak">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/video/room/multi-party')}
            className="bg-white/[0.05] ring-1 ring-peak-border rounded-xl p-6 hover:bg-white/[0.08] transition-colors text-left"
          >
            <div className="w-12 h-12 bg-peak-primary/15 rounded-lg flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-peak-primary-300" />
            </div>
            <h3 className="font-semibold mb-1 text-peak">Start Multi-Party Room</h3>
            <p className="text-sm text-peak-muted">Real-time video with multiple participants</p>
            {/* EXTERNAL: needs Daily.co for real multi-party rooms */}
            <p className="text-xs text-peak-dim mt-2">Requires Daily.co API key</p>
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-white/[0.05] ring-1 ring-peak-border rounded-xl p-6 hover:bg-white/[0.08] transition-colors text-left"
          >
            <div className="w-12 h-12 bg-peak-primary/15 rounded-lg flex items-center justify-center mb-4">
              <Link2 className="w-6 h-6 text-peak-primary-300" />
            </div>
            <h3 className="font-semibold mb-1 text-peak">Join Meeting</h3>
            <p className="text-sm text-peak-muted">Enter meeting ID or link to join</p>
          </button>

          <button
            onClick={() => router.push('/calendar')}
            className="bg-white/[0.05] ring-1 ring-peak-border rounded-xl p-6 hover:bg-white/[0.08] transition-colors text-left"
          >
            <div className="w-12 h-12 bg-peak-primary/15 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-peak-primary-300" />
            </div>
            <h3 className="font-semibold mb-1 text-peak">Schedule</h3>
            <p className="text-sm text-peak-muted">Plan meetings with calendar integration</p>
          </button>
        </div>

        {/* Lisa Assistant Toggle */}
        <div className="mt-6 flex items-center justify-between bg-white/[0.05] ring-1 ring-peak-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-peak-primary/15 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-peak-primary-300" />
            </div>
            <div>
              <p className="font-medium text-peak">Lisa Meeting Intelligence</p>
              <p className="text-sm text-peak-muted">Automatic recording, transcription, translation, summaries &amp; action items</p>
            </div>
          </div>
          <button
            onClick={() => setAiEnabled(!aiEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${aiEnabled ? 'bg-peak-primary' : 'bg-white/10'}`}
            aria-pressed={aiEnabled}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${aiEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* View Toggle + Filter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center bg-white/[0.02] rounded-xl border border-peak-border p-1">
          <button
            onClick={() => setSelectedView('meetings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedView === 'meetings' ? 'bg-peak-primary/20 text-peak-primary-300' : 'text-peak-muted hover:text-peak'}`}
          >
            Meetings
          </button>
          <button
            onClick={() => setSelectedView('recordings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedView === 'recordings' ? 'bg-peak-primary/20 text-peak-primary-300' : 'text-peak-muted hover:text-peak'}`}
          >
            Recordings
          </button>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-peak-muted">Filter:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-1.5 bg-white/[0.04] border border-peak-border rounded-lg text-peak focus:outline-none focus:border-peak-primary/50"
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Meetings View */}
      {selectedView === 'meetings' && (
        <div>
          <SectionLabel className="mb-4">Today&apos;s Schedule</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </div>
      )}

      {/* Recordings View */}
      {selectedView === 'recordings' && (
        <div className="space-y-4">
          {recordings.map((recording) => (
            <RecordingCard key={recording.id} recording={recording} />
          ))}
        </div>
      )}

      {/* Meeting Intelligence */}
      <GlassPanel className="mt-8 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-peak-primary-300" />
            <h3 className="text-lg font-semibold text-peak">Meeting Intelligence</h3>
          </div>
          <button
            onClick={() => router.push('/ai/meetings')}
            className="text-sm text-peak-primary-300 hover:text-peak-primary-200 font-medium"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-peak-primary/10 ring-1 ring-peak-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <ListChecks className="w-5 h-5 text-peak-primary-300" />
              <span className="text-2xl font-bold text-peak">
                {getMockMeetingDetails().reduce((n, d) => n + (d.actionItems?.length || 0), 0)}
              </span>
            </div>
            <p className="text-sm font-medium text-peak">Action Items</p>
            <p className="text-xs text-peak-muted mt-1">Extracted from meetings this week</p>
          </div>

          <div className="bg-peak-green/10 ring-1 ring-peak-green/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="w-5 h-5 text-peak-green" />
              <span className="text-2xl font-bold text-peak">1.2h</span>
            </div>
            <p className="text-sm font-medium text-peak">Time Saved</p>
            <p className="text-xs text-peak-muted mt-1">With automated summaries</p>
          </div>

          <div className="bg-peak-primary/10 ring-1 ring-peak-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-5 h-5 text-peak-primary-300" />
              <span className="text-2xl font-bold text-peak">{getMockMeetingDetails().length}</span>
            </div>
            <p className="text-sm font-medium text-peak">Recorded Meetings</p>
            <p className="text-xs text-peak-muted mt-1">Transcribed &amp; summarized by Lisa</p>
          </div>
        </div>
      </GlassPanel>

      {/* Join Meeting Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-peak-panel border border-peak-border rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold tracking-tight text-peak">Join Meeting</h2>
              <button onClick={() => setShowJoinModal(false)} className="text-peak-dim hover:text-peak transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-peak-muted mb-1">Meeting ID or Link</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && joinMeetingWithCode()}
                  className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border rounded-lg text-peak placeholder:text-peak-dim focus:outline-none focus:border-peak-primary/50"
                  placeholder="e.g. meeting-launch-sync"
                />
              </div>
              <div className="bg-white/[0.03] border border-peak-border rounded-lg p-4">
                <p className="text-xs text-peak-muted">
                  Try <span className="text-peak-primary-300">meeting-launch-sync</span> or{' '}
                  <span className="text-peak-primary-300">meeting-lisa-briefing</span> to open a canonical meeting.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowJoinModal(false)} className="px-4 py-2 text-peak-muted hover:text-peak transition text-sm">
                Cancel
              </button>
              <button
                onClick={joinMeetingWithCode}
                className="px-6 py-2 bg-peak-primary text-white rounded-xl hover:bg-peak-primary-600 shadow-peak-glow transition text-sm font-semibold"
              >
                Join Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule New Meeting Modal */}
      {showNewMeetingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-peak-panel border border-peak-border rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold tracking-tight text-peak flex items-center gap-2">
                <Plus className="w-5 h-5 text-peak-primary-300" /> Schedule New Meeting
              </h2>
              <button onClick={() => setShowNewMeetingModal(false)} className="text-peak-dim hover:text-peak transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-peak-muted mb-1">Meeting Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border rounded-lg text-peak placeholder:text-peak-dim focus:outline-none focus:border-peak-primary/50"
                  placeholder="e.g. Launch Week Comms Review"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-peak-muted mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border rounded-lg text-peak focus:outline-none focus:border-peak-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-peak-muted mb-1">Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border rounded-lg text-peak focus:outline-none focus:border-peak-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-peak-muted mb-1">Duration</label>
                <select
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border rounded-lg text-peak focus:outline-none focus:border-peak-primary/50"
                >
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>1.5 hours</option>
                  <option>2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-peak-muted mb-1">Participants</label>
                <input
                  type="text"
                  value={form.participants}
                  onChange={(e) => setForm({ ...form, participants: e.target.value })}
                  className="w-full px-4 py-2 bg-white/[0.04] border border-peak-border rounded-lg text-peak placeholder:text-peak-dim focus:outline-none focus:border-peak-primary/50"
                  placeholder={`e.g. ${MOCK_TEAM[1].email}, ${MOCK_TEAM[2].email}`}
                />
                <p className="mt-1 text-xs text-peak-dim">
                  Team: {MOCK_TEAM.map((m) => m.name.split(' ')[0]).join(', ')}
                </p>
              </div>

              <div className="bg-peak-primary/10 border border-peak-primary/20 rounded-lg p-4">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-peak-primary"
                    checked={aiEnabled}
                    onChange={(e) => setAiEnabled(e.target.checked)}
                  />
                  <span className="text-sm text-peak">
                    <span className="font-medium">Enable Lisa Meeting Intelligence</span>
                    <span className="block text-xs text-peak-muted mt-1">
                      Automatic recording, transcription, translation, summaries, and action item extraction
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowNewMeetingModal(false)} className="px-4 py-2 text-peak-muted hover:text-peak transition text-sm">
                Cancel
              </button>
              <button
                onClick={handleScheduleMeeting}
                disabled={!form.title.trim()}
                className="px-6 py-2 bg-peak-primary text-white rounded-xl hover:bg-peak-primary-600 shadow-peak-glow transition text-sm font-semibold disabled:opacity-50"
              >
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
