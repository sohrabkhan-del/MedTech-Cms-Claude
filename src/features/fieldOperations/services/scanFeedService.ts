import {
  mockScanEvents,
  generateLiveScanEvent,
  getScanEventById,
  getUserScanSummary,
  getUserScanHistory,
  scanFeedKpis,
} from '@/features/fieldOperations/mocks/mockScanFeed'
import type { ScanEvent } from '@/features/fieldOperations/types/fieldOperations.types'

// TODO: replace mock-backed implementations with apiClient calls once the
// scan feed API is available. `subscribeToLiveScans` currently polls a mock
// generator on an interval — swap for a websocket/SSE subscription.

async function getScanEvents(): Promise<ScanEvent[]> {
  return Promise.resolve(mockScanEvents)
}

async function getScanEventDetail(id: string): Promise<ScanEvent | undefined> {
  return Promise.resolve(getScanEventById(id))
}

async function getScanFeedKpis() {
  return Promise.resolve(scanFeedKpis)
}

async function getUserScanProfile(userId: string) {
  return Promise.resolve({
    summary: getUserScanSummary(userId),
    history: getUserScanHistory(userId),
  })
}

/** Emits one simulated scan event per interval tick; returns an unsubscribe function. */
function subscribeToLiveScans(onScan: (scan: ScanEvent) => void, intervalMs = 1000): () => void {
  const interval = setInterval(() => onScan(generateLiveScanEvent()), intervalMs)
  return () => clearInterval(interval)
}

export const scanFeedService = {
  getScanEvents,
  getScanEventDetail,
  getScanFeedKpis,
  getUserScanProfile,
  subscribeToLiveScans,
}
