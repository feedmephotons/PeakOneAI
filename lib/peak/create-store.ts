/**
 * Peak One — Create Studio document store (localStorage CRUD).
 *
 * SSR-safe: every entry point guards `typeof window`. On the server (or when
 * storage is unavailable) reads return empty / undefined and writes are no-ops,
 * so pages can call these freely during render without crashing.
 */

import type { DocumentSpec } from './create-types'

const STORAGE_KEY = 'p1-create-docs'

/** True when we have a usable localStorage. */
function hasStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch {
    return false
  }
}

/** Read + parse the whole collection. Never throws. */
function readAll(): DocumentSpec[] {
  if (!hasStorage()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as DocumentSpec[]) : []
  } catch {
    return []
  }
}

/** Persist the whole collection. No-op on the server. */
function writeAll(docs: DocumentSpec[]): void {
  if (!hasStorage()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
  } catch {
    /* quota / serialization errors are non-fatal */
  }
}

/** All saved docs, newest first (by createdAt, falling back to insertion order). */
export function listDocs(): DocumentSpec[] {
  const docs = readAll()
  return [...docs].sort((a, b) => {
    const ta = Date.parse(a.createdAt || '') || 0
    const tb = Date.parse(b.createdAt || '') || 0
    return tb - ta
  })
}

/** Get a single doc by id. */
export function getDoc(id: string): DocumentSpec | undefined {
  return readAll().find((d) => d.id === id)
}

/** Upsert a doc (matched by id). Returns the saved doc. */
export function saveDoc(doc: DocumentSpec): DocumentSpec {
  const docs = readAll()
  const idx = docs.findIndex((d) => d.id === doc.id)
  if (idx >= 0) {
    docs[idx] = doc
  } else {
    docs.push(doc)
  }
  writeAll(docs)
  return doc
}

/** Delete a doc by id. Returns true if something was removed. */
export function deleteDoc(id: string): boolean {
  const docs = readAll()
  const next = docs.filter((d) => d.id !== id)
  const removed = next.length !== docs.length
  if (removed) writeAll(next)
  return removed
}
