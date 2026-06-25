'use client'

import React, { useEffect, useState } from 'react'
import { X, Send, MessageSquare, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'

export interface SmsComposeModalProps {
  open: boolean
  onClose: () => void
  /** Recipient phone number (prefilled). */
  to: string
  /** Optional display name shown in the header. */
  contactName?: string
}

type SendState =
  | { phase: 'idle' }
  | { phase: 'sending' }
  | { phase: 'sent'; sid: string; status: string }
  | { phase: 'error'; message: string; code?: number | string; hint?: string }

/**
 * Navy Peak SMS composer. POSTs /api/twilio/sms and surfaces the REAL Twilio
 * result/error inline — including the trial-account "recipient not verified"
 * (code 21608) case, which we show honestly rather than faking success.
 */
export default function SmsComposeModal({
  open,
  onClose,
  to,
  contactName,
}: SmsComposeModalProps) {
  const [number, setNumber] = useState(to)
  const [body, setBody] = useState('')
  const [send, setSend] = useState<SendState>({ phase: 'idle' })

  // Re-sync the prefilled number whenever the target changes / modal reopens.
  useEffect(() => {
    if (open) {
      setNumber(to)
      setSend({ phase: 'idle' })
    }
  }, [open, to])

  if (!open) return null

  const handleSend = async () => {
    if (!number.trim() || !body.trim()) {
      setSend({ phase: 'error', message: 'Enter a number and a message.' })
      return
    }
    setSend({ phase: 'sending' })
    try {
      const res = await fetch('/api/twilio/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: number.trim(), body: body.trim() }),
      })
      const data = await res.json()
      if (data?.sid) {
        setSend({ phase: 'sent', sid: data.sid, status: data.status })
      } else {
        setSend({
          phase: 'error',
          message: data?.error || 'Message failed to send.',
          code: data?.code,
          hint: data?.hint,
        })
      }
    } catch (err) {
      setSend({
        phase: 'error',
        message:
          (err as { message?: string })?.message || 'Network error sending message.',
      })
    }
  }

  const sending = send.phase === 'sending'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0a0e2a]/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="peak-glass relative z-10 w-full max-w-md p-6 text-peak">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/20">
              <MessageSquare className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-peak">Send Message</h2>
              {contactName && (
                <p className="text-xs text-peak-muted">to {contactName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-peak-dim transition-colors hover:bg-white/[0.06] hover:text-peak"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-peak-muted">
              To
            </label>
            <input
              type="tel"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="+15551234567"
              disabled={sending}
              className="w-full rounded-xl border border-peak-border bg-white/[0.04] px-3 py-2.5 text-sm text-peak placeholder:text-peak-dim focus:border-peak-primary/50 focus:outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-peak-muted">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message…"
              rows={4}
              maxLength={1600}
              disabled={sending}
              className="w-full resize-none rounded-xl border border-peak-border bg-white/[0.04] px-3 py-2.5 text-sm text-peak placeholder:text-peak-dim focus:border-peak-primary/50 focus:outline-none disabled:opacity-60"
            />
            <div className="mt-1 text-right text-[11px] text-peak-dim">
              {body.length}/1600
            </div>
          </div>

          {/* Result / error surfaces */}
          {send.phase === 'sent' && (
            <div className="flex items-start gap-2 rounded-xl border border-peak-green/30 bg-peak-green/10 px-3 py-2.5 text-sm text-peak-green">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Message sent</p>
                <p className="text-xs opacity-80">
                  SID {send.sid} · {send.status}
                </p>
              </div>
            </div>
          )}

          {send.phase === 'error' && (
            <div className="flex items-start gap-2 rounded-xl border border-peak-red/30 bg-peak-red/10 px-3 py-2.5 text-sm text-peak-red">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">{send.message}</p>
                {send.code !== undefined && (
                  <p className="text-xs opacity-80">Twilio code {send.code}</p>
                )}
                {send.hint && (
                  <p className="mt-1 text-xs opacity-90">{send.hint}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={sending}
            className="rounded-xl px-4 py-2 text-sm font-medium text-peak-muted transition-colors hover:text-peak disabled:opacity-60"
          >
            Close
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !body.trim() || !number.trim()}
            className="flex items-center gap-2 rounded-xl bg-peak-primary px-4 py-2 text-sm font-semibold text-white shadow-peak-glow transition-colors hover:bg-peak-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send SMS
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
