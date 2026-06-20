'use client'

/**
 * Peak One — Create Studio spreadsheet view.
 *
 * Tabbed sheets with a navy-styled table and a sticky totals row. Exports the
 * full workbook to .xlsx (SheetJS) or the active sheet to .csv — both fully
 * client-side. Cell values are formatted by column `type` (currency / percent /
 * number / date / text) for display, while raw values are written to exports.
 *
 * SSR-safe: dynamic blob/URL work happens inside click handlers; no random/time
 * in the render path. Always-navy, inside the Peak shell.
 */

import React, { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { Download, FileSpreadsheet, FileText, ChevronDown, Check } from 'lucide-react'

import type {
  SpreadsheetDoc,
  Sheet,
  SheetColumn,
} from '@/lib/peak/create-types'

// ----------------------------------------------------------------------------
// Value formatting
// ----------------------------------------------------------------------------

type CellValue = string | number | undefined

function isNum(v: CellValue): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

/** Coerce a string like "$1,200" / "12.5%" into a number when possible. */
function toNumber(v: CellValue): number | null {
  if (isNum(v)) return v
  if (typeof v === 'string') {
    const cleaned = v.replace(/[$,%\s]/g, '')
    if (cleaned && !Number.isNaN(Number(cleaned))) return Number(cleaned)
  }
  return null
}

function formatCell(v: CellValue, type?: SheetColumn['type']): string {
  if (v === undefined || v === null || v === '') return ''
  switch (type) {
    case 'currency': {
      const n = toNumber(v)
      if (n === null) return String(v)
      return n.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: Math.abs(n) >= 1000 ? 0 : 2,
      })
    }
    case 'percent': {
      const n = toNumber(v)
      if (n === null) return String(v)
      // Values are stored as whole percents (e.g. 12.5 → "12.5%").
      return `${n.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`
    }
    case 'number': {
      const n = toNumber(v)
      if (n === null) return String(v)
      return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
    }
    case 'date':
    case 'text':
    default:
      return String(v)
  }
}

const ALIGN: Record<NonNullable<SheetColumn['type']> | 'default', string> = {
  currency: 'text-right tabular-nums',
  percent: 'text-right tabular-nums',
  number: 'text-right tabular-nums',
  date: 'text-right tabular-nums',
  text: 'text-left',
  default: 'text-left',
}

function alignFor(type?: SheetColumn['type']): string {
  return ALIGN[type ?? 'default']
}

// ----------------------------------------------------------------------------
// Export helpers
// ----------------------------------------------------------------------------

function safeFilename(title: string, ext: string): string {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'spreadsheet'
  return `${base}.${ext}`
}

function triggerDownload(data: BlobPart, filename: string, mime: string) {
  if (typeof window === 'undefined') return
  const blob = new Blob([data], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Build a 2D array-of-arrays for a sheet (header + rows + totals). */
function sheetToAoA(sheet: Sheet): (string | number)[][] {
  const header = sheet.columns.map((c) => c.label)
  const body = sheet.rows.map((row) =>
    sheet.columns.map((c) => {
      const v = row[c.key]
      return v === undefined || v === null ? '' : v
    }),
  )
  const aoa: (string | number)[][] = [header, ...body]
  if (sheet.totals) {
    const totalsRow = sheet.columns.map((c, idx) => {
      const v = sheet.totals?.[c.key]
      if (v !== undefined && v !== null && v !== '') return v
      return idx === 0 ? 'Total' : ''
    })
    aoa.push(totalsRow)
  }
  return aoa
}

function exportXlsx(doc: SpreadsheetDoc) {
  const wb = XLSX.utils.book_new()
  doc.sheets.forEach((sheet, i) => {
    const ws = XLSX.utils.aoa_to_sheet(sheetToAoA(sheet))
    // Excel limits sheet names to 31 chars and forbids a few characters.
    const name = (sheet.name || `Sheet${i + 1}`).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31)
    XLSX.utils.book_append_sheet(wb, ws, name || `Sheet${i + 1}`)
  })
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
  triggerDownload(
    out,
    safeFilename(doc.title, 'xlsx'),
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
}

function exportCsv(sheet: Sheet, title: string) {
  const ws = XLSX.utils.aoa_to_sheet(sheetToAoA(sheet))
  const csv = XLSX.utils.sheet_to_csv(ws)
  triggerDownload(csv, safeFilename(`${title}-${sheet.name}`, 'csv'), 'text/csv;charset=utf-8')
}

// ----------------------------------------------------------------------------
// Export menu
// ----------------------------------------------------------------------------

function ExportMenu({
  doc,
  activeSheet,
}: {
  doc: SpreadsheetDoc
  activeSheet: Sheet
}) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)

  const flash = () => {
    setOpen(false)
    setDone(true)
    if (typeof window !== 'undefined') window.setTimeout(() => setDone(false), 1600)
  }

  return (
    <div className="relative print:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl bg-peak-primary px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-peak-primary-600"
      >
        {done ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        Export
        <ChevronDown className="h-3.5 w-3.5 opacity-80" />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-peak-border bg-peak-panel shadow-peak">
            <button
              type="button"
              onClick={() => {
                exportXlsx(doc)
                flash()
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-peak transition-colors hover:bg-peak-glass-hover"
            >
              <FileSpreadsheet className="h-4 w-4 text-peak-green" />
              Download .xlsx (all sheets)
            </button>
            <button
              type="button"
              onClick={() => {
                exportCsv(activeSheet, doc.title)
                flash()
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-peak transition-colors hover:bg-peak-glass-hover"
            >
              <FileText className="h-4 w-4 text-peak-muted" />
              Download .csv (this sheet)
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}

// ----------------------------------------------------------------------------
// Table
// ----------------------------------------------------------------------------

function SheetTable({ sheet }: { sheet: Sheet }) {
  const hasTotals = !!sheet.totals && Object.keys(sheet.totals).length > 0

  return (
    <div className="overflow-x-auto rounded-xl border border-peak-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-white/[0.03]">
            {sheet.columns.map((col) => (
              <th
                key={col.key}
                className={[
                  'whitespace-nowrap border-b border-peak-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-peak-muted',
                  alignFor(col.type),
                ].join(' ')}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sheet.rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-peak-border/60 transition-colors last:border-0 hover:bg-peak-glass-hover"
            >
              {sheet.columns.map((col, ci) => {
                const v = row[col.key] as CellValue
                const isFirst = ci === 0
                return (
                  <td
                    key={col.key}
                    className={[
                      'whitespace-nowrap px-4 py-2.5',
                      alignFor(col.type),
                      isFirst ? 'font-medium text-peak' : 'text-peak-muted',
                    ].join(' ')}
                  >
                    {formatCell(v, col.type)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
        {hasTotals ? (
          <tfoot>
            <tr className="bg-peak-primary/[0.08]">
              {sheet.columns.map((col, ci) => {
                const v = sheet.totals?.[col.key] as CellValue
                const display =
                  v !== undefined && v !== null && v !== ''
                    ? formatCell(v, col.type)
                    : ci === 0
                      ? 'Total'
                      : ''
                return (
                  <td
                    key={col.key}
                    className={[
                      'whitespace-nowrap border-t border-peak-primary/25 px-4 py-3 font-semibold text-peak',
                      alignFor(col.type),
                    ].join(' ')}
                  >
                    {display}
                  </td>
                )
              })}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  )
}

// ----------------------------------------------------------------------------
// Main view
// ----------------------------------------------------------------------------

export interface SpreadsheetViewProps {
  doc: SpreadsheetDoc
}

export default function SpreadsheetView({ doc }: SpreadsheetViewProps) {
  const sheets = doc.sheets ?? []
  const [activeIdx, setActiveIdx] = useState(0)
  const active = useMemo(
    () => sheets[Math.min(activeIdx, Math.max(0, sheets.length - 1))],
    [sheets, activeIdx],
  )

  if (!sheets.length) {
    return (
      <div className="rounded-2xl border border-peak-border bg-peak-glass p-10 text-center text-sm text-peak-muted">
        This spreadsheet has no sheets.
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar: tabs + export */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {sheets.map((sheet, i) => {
            const isActive = i === activeIdx
            return (
              <button
                key={`${sheet.name}-${i}`}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={[
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-peak-primary/15 text-peak-primary-300 ring-1 ring-peak-primary/25'
                    : 'text-peak-muted hover:bg-peak-glass-hover hover:text-peak',
                ].join(' ')}
              >
                {sheet.name || `Sheet ${i + 1}`}
              </button>
            )
          })}
        </div>
        <ExportMenu doc={doc} activeSheet={active} />
      </div>

      {/* Active sheet meta */}
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-peak">{active.name}</h2>
        <span className="text-xs text-peak-dim">
          {active.rows.length} {active.rows.length === 1 ? 'row' : 'rows'} ·{' '}
          {active.columns.length} {active.columns.length === 1 ? 'column' : 'columns'}
        </span>
      </div>

      <SheetTable sheet={active} />
    </div>
  )
}
