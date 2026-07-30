// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockScanEvents,
  generateLiveScanEvent,
  getScanEventById,
  getUserScanSummary,
  getUserScanHistory,
  scanFeedKpis,
} from '@/features/fieldOperations/mocks/mockScanFeed'
import type { ScanEvent, ScanUserSummary } from '@/features/fieldOperations/types/fieldOperations.types'
import { mockDelay } from '@/services/mockDelay'

export type ScanFeedKpis = typeof scanFeedKpis

export interface UserScanProfile {
  summary: ScanUserSummary | undefined
  history: ScanEvent[]
}

const scanFeedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getScanEvents: builder.query<ScanEvent[], void>({
      query: () => ({ tag: 'ScanFeed', url: '/scan-feed', mockResolver: () => mockDelay(mockScanEvents) }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'ScanFeed' as const, id })), { type: 'ScanFeed' as const, id: 'LIST' }]
          : [{ type: 'ScanFeed' as const, id: 'LIST' }],
    }),

    getScanEventDetail: builder.query<ScanEvent | undefined, string>({
      query: (id) => ({
        tag: 'ScanFeed',
        url: `/scan-feed/${id}`,
        mockResolver: () => mockDelay(getScanEventById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'ScanFeed', id }],
    }),

    getScanFeedKpis: builder.query<ScanFeedKpis, void>({
      query: () => ({ tag: 'ScanFeed', url: '/scan-feed/kpis', mockResolver: () => mockDelay(scanFeedKpis) }),
      providesTags: [{ type: 'ScanFeed', id: 'KPIS' }],
    }),

    getUserScanProfile: builder.query<UserScanProfile, string>({
      query: (userId) => ({
        tag: 'ScanFeed',
        url: `/scan-feed/users/${userId}`,
        mockResolver: () =>
          mockDelay({
            summary: getUserScanSummary(userId),
            history: getUserScanHistory(userId),
          }),
      }),
      providesTags: (_result, _error, userId) => [{ type: 'ScanFeed', id: `USER_${userId}` }],
    }),
  }),
})

export const { useGetScanEventsQuery, useGetScanEventDetailQuery, useGetScanFeedKpisQuery, useGetUserScanProfileQuery } =
  scanFeedApi

/**
 * Emits one simulated scan event per interval tick; returns an unsubscribe function.
 * Not a network call (local interval-based generator) — no RTK Query wrapper needed.
 */
export function subscribeToLiveScans(onScan: (scan: ScanEvent) => void, intervalMs = 1000): () => void {
  const interval = setInterval(() => onScan(generateLiveScanEvent()), intervalMs)
  return () => clearInterval(interval)
}
