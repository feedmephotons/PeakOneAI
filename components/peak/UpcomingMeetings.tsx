'use client'

import React from 'react'
import { Calendar, Video, Phone } from 'lucide-react'

export interface MeetingItem {
  id: string | number
  time: string
  title: string
  duration?: string
  /** Avatar image URLs for the attendee stack. */
  attendees?: string[]
  /** Channel icon shown at the far right. */
  channel?: 'calendar' | 'video' | 'phone'
  onClick?: () => void
}

export interface UpcomingMeetingsProps {
  items: MeetingItem[]
  className?: string
}

const CHANNEL_ICON = {
  calendar: Calendar,
  video: Video,
  phone: Phone,
}

/** Upcoming meetings list — time, title, attendee stack, channel icon. */
export default function UpcomingMeetings({ items, className = '' }: UpcomingMeetingsProps) {
  return (
    <ul className={['divide-y divide-white/5', className].filter(Boolean).join(' ')}>
      {items.map((m) => {
        const ChannelIcon = m.channel ? CHANNEL_ICON[m.channel] : null
        return (
          <li key={m.id}>
            <button
              onClick={m.onClick}
              className="flex w-full items-center gap-4 px-1 py-3 text-left transition-colors hover:bg-white/[0.03] rounded-lg"
            >
              <span className="w-16 shrink-0 text-sm font-medium text-peak">{m.time}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-peak">{m.title}</span>
                {m.duration && <span className="block text-xs text-peak-muted">{m.duration}</span>}
              </span>
              {m.attendees && m.attendees.length > 0 && (
                <span className="flex -space-x-2">
                  {m.attendees.slice(0, 3).map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="h-7 w-7 rounded-full border-2 border-peak-bg object-cover"
                    />
                  ))}
                </span>
              )}
              {ChannelIcon && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-peak-muted">
                  <ChannelIcon className="h-4 w-4" />
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
