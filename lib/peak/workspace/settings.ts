/**
 * Peak One — canonical org / billing / settings identity, automations retargeted
 * to Acme channels/people, and a seeded brand-voice guideline. Deterministic.
 */

import type { AutomationRule, BrandVoiceGuideline, OrgIdentity } from '../types'
import { ACME_COMPANY, ACME_TEAM_SIZE, MOCK_TEAM, MOCK_USER } from '../core'

// ----------------------------------------------------------------------------
// Org / billing / settings identity — ONE canonical Acme profile.
// ----------------------------------------------------------------------------

export const MOCK_ORG_IDENTITY: OrgIdentity = {
  user: MOCK_USER, // Sarah Chen / sarah.chen@acmecorp.com / Founder & CEO
  company: ACME_COMPANY,
  companySlug: 'acme-corp',
  teamSize: ACME_TEAM_SIZE, // 5 — consistent across org/billing/settings
  departments: 4, // Product, Engineering, Marketing, Design
  plan: 'Business',
  seats: ACME_TEAM_SIZE,
  seatsUsed: ACME_TEAM_SIZE,
  cardBrand: 'Visa',
  cardLast4: '8821', // non-test card
  cardExpiry: '09/28',
  billingEmail: 'sarah.chen@acmecorp.com',
  nextInvoiceDate: '2026-07-01T00:00:00.000Z',
  invoices: [
    { id: 'inv-2026-06', date: '2026-06-01T00:00:00.000Z', amount: '$245.00', status: 'PAID', url: null },
    { id: 'inv-2026-05', date: '2026-05-01T00:00:00.000Z', amount: '$245.00', status: 'PAID', url: null },
    { id: 'inv-2026-04', date: '2026-04-01T00:00:00.000Z', amount: '$245.00', status: 'PAID', url: null },
    { id: 'inv-2026-03', date: '2026-03-01T00:00:00.000Z', amount: '$196.00', status: 'PAID', url: null },
  ],
  storageUsedGb: 18.4, // stable — no Math.random
  storageTotalGb: 100,
}

export function getMockOrgIdentity(): OrgIdentity {
  return MOCK_ORG_IDENTITY
}

// ----------------------------------------------------------------------------
// Automations — retargeted to Acme channels / people.
// ----------------------------------------------------------------------------

export const MOCK_AUTOMATIONS: AutomationRule[] = [
  {
    id: 'auto-standup',
    name: 'Daily standup digest',
    description: 'Posts a Product X standup prompt and yesterday\'s burn-down to #product-x.',
    enabled: true,
    trigger: 'Every weekday at 9:00 AM',
    action: 'Post standup digest',
    target: '#product-x',
    runsCount: 42,
    lastRun: '2026-06-18T09:00:00.000Z',
  },
  {
    id: 'auto-weekly-summary',
    name: 'Weekly mission summary email',
    description: 'Emails a Launch Product X progress summary to Sarah and Lisa every Friday.',
    enabled: true,
    trigger: 'Every Friday at 4:00 PM',
    action: 'Email mission summary',
    target: 'Sarah Chen + Lisa Park',
    runsCount: 11,
    lastRun: '2026-06-13T16:00:00.000Z',
  },
  {
    id: 'auto-risk-alert',
    name: 'HIGH-risk alert to Lisa',
    description: 'When any mission risk is set to HIGH, ping Lisa AI and notify the mission owner.',
    enabled: true,
    trigger: 'Risk level set to HIGH',
    action: 'Notify owner + Ask Lisa',
    target: 'Mission owner + #product-x',
    runsCount: 3,
    lastRun: '2026-06-15T14:20:00.000Z',
  },
  {
    id: 'auto-call-summary',
    name: 'Auto-summarize calls',
    description: 'After every recorded call, Lisa generates a summary and posts action items.',
    enabled: false,
    trigger: 'Call recording finishes',
    action: 'Generate AI summary + action items',
    target: 'Call participants',
    runsCount: 27,
    lastRun: '2026-06-18T18:35:00.000Z',
  },
]

export function getMockAutomations(): AutomationRule[] {
  return MOCK_AUTOMATIONS
}

// ----------------------------------------------------------------------------
// Brand voice — seeded Acme "Company Brand Voice" guideline.
// ----------------------------------------------------------------------------

export const MOCK_BRAND_VOICE: BrandVoiceGuideline = {
  id: 'brand-voice-acme',
  name: 'Acme Corp — Company Brand Voice',
  enabled: true,
  defaultLevel: 'balanced',
  tone: ['Clear', 'Confident', 'Warm', 'Founder-led'],
  doList: [
    'Lead with the customer outcome, not the feature.',
    'Be specific with numbers (e.g. "18% above target").',
    'Sound like a founder who ships: direct, optimistic, honest about risk.',
    'Use plain language; explain jargon the first time.',
  ],
  dontList: [
    'No hype words ("revolutionary", "game-changing").',
    'No em-dashes in customer-facing copy; use commas or restructure.',
    'Do not over-promise on timelines.',
    'Avoid passive voice in calls to action.',
  ],
  sample:
    'Product X turns your company\'s scattered knowledge into action. This quarter our pipeline is tracking 18% above target, and we are on track to launch June 30. We will tell you what is working and what is at risk, plainly.',
  createdBy: MOCK_USER,
  createdAt: '2026-05-01T09:00:00.000Z',
  updatedAt: '2026-06-10T09:00:00.000Z',
}

export function getMockBrandVoice(): BrandVoiceGuideline {
  return MOCK_BRAND_VOICE
}
