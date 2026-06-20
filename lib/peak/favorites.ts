/**
 * Shared favorites store (localStorage-backed).
 *
 * A single source of truth so star controls anywhere in the app can write here
 * and the /favorites page reflects them. SSR-safe: every accessor guards on
 * `typeof window`. Seeded once from the canonical Acme Corp dataset.
 */

export type FavoriteType =
  | 'file'
  | 'folder'
  | 'channel'
  | 'meeting'
  | 'task'
  | 'contact'
  | 'mission'
  | 'note'
  | 'call'
  | 'conversation'

export interface FavoriteItem {
  id: string
  type: FavoriteType
  name: string
  description?: string
  /** Deep link to the specific entity. */
  url: string
  /** ISO string (SSR-safe, deterministic from FIXED_TODAY). */
  addedAt: string
}

const STORAGE_KEY = 'peak.favorites.v1'

export function getFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as FavoriteItem[]) : []
  } catch {
    return []
  }
}

export function saveFavorites(items: FavoriteItem[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* ignore quota / serialization errors */
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id)
}

export function addFavorite(item: FavoriteItem): FavoriteItem[] {
  const current = getFavorites()
  if (current.some((f) => f.id === item.id)) return current
  const next = [item, ...current]
  saveFavorites(next)
  return next
}

export function removeFavorite(id: string): FavoriteItem[] {
  const next = getFavorites().filter((f) => f.id !== id)
  saveFavorites(next)
  return next
}

export function toggleFavorite(item: FavoriteItem): FavoriteItem[] {
  return isFavorite(item.id) ? removeFavorite(item.id) : addFavorite(item)
}
