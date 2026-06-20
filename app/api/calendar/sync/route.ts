import { NextResponse } from 'next/server'
import { MOCK_CALENDAR_EVENTS } from '@/lib/peak/mock'

/**
 * Calendar sync endpoint.
 *
 * In the canonical demo there is no live Google Calendar connection, so this
 * route is a deterministic no-op success that echoes back the canonical Acme
 * Corp events (so the client can merge/reseed without losing the 2026-06-18
 * world). A `?conflict=1` query param exercises the 409 double-booking path the
 * UI handles.
 *
 * EXTERNAL: needs Google Calendar OAuth for a real two-way sync.
 */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)

  if (searchParams.get('conflict') === '1') {
    return NextResponse.json(
      {
        ok: false,
        error: 'Conflict detected: 2 events overlap with existing meetings.',
      },
      { status: 409 },
    )
  }

  // Map canonical calendar events into the page's lightweight Event shape so the
  // client can merge them straight into the `calendar-events` store.
  const events = MOCK_CALENDAR_EVENTS.map((e) => {
    const startDate = e.start.split('T')[0]
    const startTime = e.start.slice(11, 16)
    const endTime = e.end ? e.end.slice(11, 16) : startTime
    const type =
      e.type === 'MEETING'
        ? 'meeting'
        : e.type === 'DEADLINE'
          ? 'task'
          : e.type === 'REMINDER'
            ? 'reminder'
            : 'meeting'
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      date: startDate,
      startTime,
      endTime,
      type,
      participants: (e.attendees || []).map((a) => a.name),
      location: e.location || undefined,
      color: 'bg-blue-500',
      isAllDay: e.type === 'DEADLINE' || !e.end,
      recurring: e.id === 'evt-standup-eng' ? 'daily' : 'none',
      joinUrl: e.joinUrl || undefined,
      meetingId: e.meetingId || undefined,
    }
  })

  return NextResponse.json({
    ok: true,
    provider: 'Google Calendar',
    syncedAt: '2026-06-18T00:00:00.000Z',
    count: events.length,
    events,
  })
}
