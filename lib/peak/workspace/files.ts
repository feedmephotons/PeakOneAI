/**
 * Peak One — canonical files / documents fixture.
 *
 * Tied to missions and notes, owned by the real Acme team. Thumbnails are
 * inline SVG data: URIs (never via.placeholder.com or a dead remote host), so
 * next/image and <img> both render without remotePatterns config. Deterministic.
 */

import type { FileItem, FileKind } from '../types'
import { MOCK_TEAM, MOCK_USER } from '../core'

const SARAH = MOCK_USER
const MIKE = MOCK_TEAM[1]
const LISA = MOCK_TEAM[2]
const DAVID = MOCK_TEAM[3]
const EMMA = MOCK_TEAM[4]

/**
 * Build a small, valid, self-contained SVG thumbnail as a data: URI.
 * Safe everywhere (no network, no host allowlist) and visually distinct by kind.
 */
function svgThumb(label: string, bg: string, fg = '#ffffff'): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">` +
    `<rect width="300" height="200" rx="12" fill="${bg}"/>` +
    `<text x="150" y="108" font-family="system-ui,Arial,sans-serif" font-size="34" font-weight="700" ` +
    `fill="${fg}" text-anchor="middle">${label}</text>` +
    `</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const KIND_THUMB: Record<FileKind, string> = {
  document: svgThumb('DOC', '#7c3aed'),
  spreadsheet: svgThumb('XLS', '#16a34a'),
  presentation: svgThumb('PPT', '#ea580c'),
  pdf: svgThumb('PDF', '#dc2626'),
  image: svgThumb('IMG', '#2563eb'),
  folder: svgThumb('DIR', '#64748b'),
  other: svgThumb('FILE', '#475569'),
}

const LAUNCH = 'mission-launch-product-x'
const Q2 = 'mission-q2-growth'
const REL = 'mission-platform-reliability'

function file(
  id: string,
  name: string,
  kind: FileKind,
  size: number,
  sizeLabel: string,
  owner: FileItem['owner'],
  missionId: string | null,
  noteId: string | null,
  aiSummary: string,
  aiTags: string[],
  createdAt: string,
  updatedAt: string,
  starred = false,
): FileItem {
  const mimeByKind: Record<FileKind, string> = {
    document: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    spreadsheet: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    presentation: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    pdf: 'application/pdf',
    image: 'image/png',
    folder: 'application/x-directory',
    other: 'application/octet-stream',
  }
  return {
    id,
    name,
    kind,
    size,
    sizeLabel,
    mimeType: mimeByKind[kind],
    owner,
    thumbnailDataUri: KIND_THUMB[kind],
    missionId,
    noteId,
    aiSummary,
    aiTags,
    starred,
    deleted: false,
    folderId: null,
    createdAt,
    updatedAt,
  }
}

export const MOCK_FILES: FileItem[] = [
  file('file-q2-marketing', 'Q2 Marketing Strategy.docx', 'document', 248000, '242 KB', LISA, Q2, 'note-q2-marketing',
    'Q2 marketing plan targeting 3x qualified pipeline for the Product X launch; tracking 18% above target on MQLs.',
    ['marketing', 'q2', 'launch', 'strategy'], '2026-05-02T14:00:00.000Z', '2026-06-16T17:30:00.000Z', true),
  file('file-product-launch-plan', 'Product Launch Plan.pdf', 'pdf', 1320000, '1.3 MB', SARAH, LAUNCH, 'note-product-launch-plan',
    'End-to-end June 30 launch runbook: eng readiness (David), comms (Lisa), legal sign-off (Tom). Gate on the reliability bar.',
    ['launch', 'runbook', 'product-x'], '2026-04-28T09:00:00.000Z', '2026-06-15T16:00:00.000Z', true),
  file('file-pricing-research', 'Competitive Pricing Research.xlsx', 'spreadsheet', 86000, '84 KB', LISA, LAUNCH, 'note-pricing-research',
    'Survey of comparable tools landing $29-$79/seat; recommends a $49 anchor with annual discount.',
    ['pricing', 'research', 'competitive'], '2026-05-10T13:00:00.000Z', '2026-06-10T10:00:00.000Z'),
  file('file-board-deck', 'Q2 Board Update.pptx', 'presentation', 4200000, '4.2 MB', SARAH, LAUNCH, null,
    'Board deck: pipeline 18% above target, Launch Product X at 72%, one HIGH risk (legal). Ask: approve outside counsel.',
    ['board', 'q2', 'finance'], '2026-06-05T09:00:00.000Z', '2026-06-17T11:00:00.000Z', true),
  file('file-spec', 'Product X Spec v3.docx', 'document', 512000, '500 KB', MIKE, LAUNCH, null,
    'Locked Product X specification and roadmap; signed off Feb 20.',
    ['product', 'spec', 'launch'], '2026-02-18T09:00:00.000Z', '2026-02-20T17:00:00.000Z'),
  file('file-beta-report', 'Beta Bug Report.xlsx', 'spreadsheet', 132000, '129 KB', DAVID, LAUNCH, null,
    'Open beta defects with severity and owner; burn-down trending toward zero before GA candidate.',
    ['engineering', 'beta', 'quality'], '2026-06-04T10:00:00.000Z', '2026-06-16T15:10:00.000Z'),
  file('file-pricing-page-mock', 'Pricing Page Mockup.png', 'image', 920000, '898 KB', EMMA, LAUNCH, null,
    'Design mock of the $49-anchor pricing page with annual-discount toggle.',
    ['design', 'pricing', 'launch'], '2026-06-09T13:00:00.000Z', '2026-06-14T09:00:00.000Z'),
  file('file-brightpath-mou', 'BrightPath Co-Marketing MOU (draft).pdf', 'pdf', 210000, '205 KB', MIKE, LAUNCH, 'note-acme-partnership',
    'Draft MOU for the BrightPath co-marketing partnership; revenue share to revisit after the first joint webinar.',
    ['partnership', 'brightpath', 'legal'], '2026-05-20T10:00:00.000Z', '2026-06-12T11:00:00.000Z'),
  file('file-lifecycle-emails', 'Lifecycle Email Sequences.docx', 'document', 188000, '184 KB', LISA, Q2, null,
    'Drafted lifecycle email program for the Q2 Growth Engine; trigger-based nurture for trial and design partners.',
    ['marketing', 'growth', 'email'], '2026-05-25T09:00:00.000Z', '2026-06-15T12:00:00.000Z'),
  file('file-reliability-slo', 'Reliability SLO Report.pdf', 'pdf', 640000, '625 KB', DAVID, REL, null,
    '99.9% uptime SLO report covering 30-day window, incident runbooks, and load-test results.',
    ['reliability', 'engineering', 'slo'], '2026-05-12T09:00:00.000Z', '2026-06-15T08:00:00.000Z'),
  file('file-case-studies', 'Design Partner Case Studies.pptx', 'presentation', 3100000, '3.1 MB', LISA, LAUNCH, null,
    'Three referenceable design-partner case studies for the launch motion.',
    ['marketing', 'case-study', 'launch'], '2026-06-02T09:00:00.000Z', '2026-06-13T10:00:00.000Z'),
  file('file-forecast', 'Financial Forecast FY2026.xlsx', 'spreadsheet', 240000, '234 KB', SARAH, null, null,
    'Driver-based 12-month forecast: revenue, COGS, OpEx, and cash runway ($ in thousands).',
    ['finance', 'forecast', 'board'], '2026-01-10T09:00:00.000Z', '2026-06-01T09:00:00.000Z'),
]

// ----------------------------------------------------------------------------
// Getters
// ----------------------------------------------------------------------------

export function getMockFiles(filter?: { missionId?: string; ownerId?: string; starred?: boolean; q?: string }): FileItem[] {
  let files = MOCK_FILES.filter((f) => !f.deleted)
  if (filter?.missionId) files = files.filter((f) => f.missionId === filter.missionId)
  if (filter?.ownerId) files = files.filter((f) => f.owner.id === filter.ownerId)
  if (filter?.starred !== undefined) files = files.filter((f) => !!f.starred === filter.starred)
  if (filter?.q) {
    const q = filter.q.toLowerCase()
    files = files.filter(
      (f) => f.name.toLowerCase().includes(q) || (f.aiSummary || '').toLowerCase().includes(q) || (f.aiTags || []).some((t) => t.includes(q)),
    )
  }
  return files
}

export function getMockFile(id: string): FileItem | undefined {
  return MOCK_FILES.find((f) => f.id === id)
}
