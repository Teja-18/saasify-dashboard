import type { Subscription } from './supabase'

// Isolated LocalStorage namespace for offline fallback (see report section 3 +
// the "Network Resilience" test case). When the network is unavailable the
// dashboard reads from here so the UI keeps working.
const KEY = 'saasify:subscriptions:cache'

export function writeCache(subs: Subscription[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(subs))
  } catch {
    // storage full / unavailable — ignore
  }
}

export function readCache(): Subscription[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Subscription[]) : []
  } catch {
    return []
  }
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}
