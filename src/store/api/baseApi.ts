import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react'
import type { AxiosRequestConfig } from 'axios'
import { apiClient, DEFAULT_API_VERSION } from '@/services/apiClient'
import { env } from '@/config/env'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

/**
 * ============================================================================
 * Mock/real switch mechanism — how it works and how to flip a feature later
 * ============================================================================
 *
 * Every RTK Query endpoint in this app is defined via `baseApi.injectEndpoints`
 * and goes through `mockOrRealBaseQuery` below. For each request, the base
 * query decides whether to resolve it from local mock data or forward it to
 * the real backend through `apiClient` (axios). The decision is made in two
 * layers:
 *
 * 1. Top-level flag: `VITE_USE_MOCKS` (read from `import.meta.env`). If it is
 *    unset OR set to anything other than the literal string `'false'`, mocks
 *    are used. Set `VITE_USE_MOCKS=false` in `.env` to make "real" the global
 *    default.
 * 2. Per-feature override: `featureModeOverrides` below. This map is empty by
 *    default, meaning every feature simply follows the top-level flag. To cut
 *    a single feature over to the real API without touching anything else,
 *    add one entry, e.g. `chemists: 'real'`.
 *
 * To flip ONE feature (e.g. chemists) from mock to real once its backend
 * endpoint is ready:
 *   1. Add `VITE_API_BASE_URL=https://your-api.example.com/api` to `.env`
 *      (read by `src/config/env.ts`, already wired into `apiClient`).
 *   2. In `featureModeOverrides` below, set `chemists: 'real'`.
 *   3. Done — no changes needed in the endpoint file, the hook, or any
 *      component. The endpoint file's `mockResolver` is simply skipped and
 *      the `url`/`method`/`data`/`params` on the same endpoint definition are
 *      used to make a real `apiClient` request instead.
 *
 * Endpoint authors: every query/mutation should provide BOTH a `mockResolver`
 * (used in mock mode) and the real request shape (`url`, `method`, `data`,
 * `params`, used in real mode) in the same `args` object — see `MockOrRealArgs`.
 */

/** One tag per feature/domain covering all migrated services. */
export const tagTypes = [
  'AuditLogs',
  'MasterScanLogs',
  'Dashboard',
  'AnalyticsCards',
  'GeoFences',
  'GeoFenceSettings',
  'ScanFeed',
  'SecurityAlerts',
  'DistributorUpload',
  'FactoryUpload',
  'FactoryProductionUpload',
  'ProductBatches',
  'Products',
  'InterestedUsers',
  'ShowcaseProducts',
  'ProductCategories',
  'PartnerInvite',
  'ChemistReports',
  'DealerReports',
  'MrPerformanceReports',
  'ProductReports',
  'RewardReports',
  'ScanReports',
  'SchemeReports',
  'WalletReports',
  'PointRules',
  'PointValueRules',
  'Redemptions',
  'RewardClaims',
  'Wallets',
  'Gifts',
  'Schemes',
  'Admins',
  'MedicalReps',
  'MedicalRepDetail',
  'Chemists',
  'Partners',
  'Verification',
  'Notifications',
] as const

export type FeatureTag = (typeof tagTypes)[number]

/**
 * Per-feature mode overrides. Empty by default — every feature follows
 * `VITE_USE_MOCKS`. Add entries here to cut individual features over to the
 * real API ahead of (or instead of) flipping the global flag, e.g.:
 *
 *   const featureModeOverrides: Partial<Record<FeatureTag, 'mock' | 'real'>> = {
 *     Chemists: 'real',
 *   }
 */
const featureModeOverrides: Partial<Record<FeatureTag, 'mock' | 'real'>> = {
  AuditLogs: 'real',
  Admins: 'real',
  Chemists: 'real',
  InterestedUsers: 'real',
  MedicalRepDetail: 'real',
  Partners: 'real',
  ProductCategories: 'real',
  ShowcaseProducts: 'real',
  Verification: 'real',
  Notifications: 'real',
  SecurityAlerts: 'real',
  ScanFeed: 'real',
  GeoFences: 'real',
  GeoFenceSettings: 'real',
  Products: 'real',
  FactoryProductionUpload: 'real',
  AnalyticsCards: 'real',
  Wallets: 'real',
  Redemptions: 'real',
  PointValueRules: 'real',
  RewardClaims: 'real',
}

function resolveMode(tag: FeatureTag | undefined): 'mock' | 'real' {
  if (tag && featureModeOverrides[tag])
    return featureModeOverrides[tag] as 'mock' | 'real'
  const globalFlag = import.meta.env.VITE_USE_MOCKS
  return globalFlag === 'false' ? 'real' : 'mock'
}

/**
 * Args shape accepted by `mockOrRealBaseQuery`. Endpoint definitions provide
 * both halves: `mockResolver` for mock mode, and the axios-shaped
 * `url`/`method`/`data`/`params` for real mode. `tag` selects which feature's
 * override (if any) applies.
 */
export interface MockOrRealArgs<T = unknown> {
  /** Feature tag used to resolve mock-vs-real mode via `featureModeOverrides`. */
  tag: FeatureTag
  /** Invoked in mock mode; should replicate the old service method exactly. */
  mockResolver: () => Promise<T>
  /** Real request path, relative to the axios `apiClient` base URL. */
  url: string
  method?: AxiosRequestConfig['method']
  data?: unknown
  params?: unknown
  /** API version this request targets, e.g. 'v2'. Defaults to `apiClient`'s
   *  baseURL version (`DEFAULT_API_VERSION`) when omitted — only set this to
   *  pin an endpoint to a specific version other than the default. */
  apiVersion?: string
}

export interface MockOrRealError {
  status: 'MOCK_ERROR' | 'REAL_ERROR'
  message: string
}

/**
 * Custom base query that dispatches each request to either a mock resolver
 * or the real `apiClient` axios instance, based on `resolveMode`. Kept
 * intentionally simple — it only needs to support GET-like queries and
 * simple mutations, matching what the mock services already do.
 */
export const mockOrRealBaseQuery: BaseQueryFn<
  MockOrRealArgs,
  unknown,
  MockOrRealError
> = async (args) => {
  const mode = resolveMode(args.tag)

  if (mode === 'mock') {
    try {
      const data = await args.mockResolver()
      return { data }
    } catch (err) {
      return {
        error: {
          status: 'MOCK_ERROR',
          message: getApiErrorMessage(err, 'Mock request failed.'),
        },
      }
    }
  }

  try {
    const response = await apiClient.request({
      url: args.url,
      method: args.method ?? 'GET',
      data: args.data,
      params: args.params,
      ...(args.apiVersion && args.apiVersion !== DEFAULT_API_VERSION
        ? { baseURL: `${env.apiBaseUrl}/api/${args.apiVersion}` }
        : {}),
    })
    const body = response.data
    if (body && typeof body === 'object' && 'success' in body && body.success === false) {
      return {
        error: {
          status: 'REAL_ERROR',
          message: body.message || 'Request failed.',
        },
      }
    }
    return { data: body }
  } catch (err) {
    return {
      error: {
        status: 'REAL_ERROR',
        message: getApiErrorMessage(err, 'Request failed.'),
      },
    }
  }
}

/**
 * Root RTK Query API. No endpoints defined here — every feature injects its
 * own via `baseApi.injectEndpoints` in a sibling `*Api.ts` file.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: mockOrRealBaseQuery,
  tagTypes,
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
})
