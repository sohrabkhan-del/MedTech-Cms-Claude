// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockPointValueRules,
  getPointValueRuleById,
  highestCurrentPoints,
  regionMultiplierDefaults,
  PointRuleKpis,
  PointDistributionByCategory,
  getStoredMultipliers,
  storeMultipliers,
  getStoredMultiplierDates,
  storeMultiplierDates,
  formatRuleChangeDate,
  formatRuleChangeTimestamp,
  getStoredRuleStatuses,
  storeRuleStatuses,
  groupPointValueRulesByProduct,
  appendRegionHistoryEntries,
  type RegionMultiplierMap,
  type RegionDateMap,
  type RuleStatusMap,
  type ProductPointRuleGroup,
} from '@/features/rewardsWallet/mockPointRules'
import type {
  PointRulePartnerType,
  PointValueRule,
  RegionPointHistoryEntry,
} from '@/features/rewardsWallet/types/rewardsWallet.types'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// Point value rules API is available. setBasePointValue is currently a no-op
// resolving immediately so the UI/hook contract is stable ahead of time.
// Region multiplier persistence still uses the localStorage-backed mock
// helpers below — that is mock persistence, not a page/hook touching mocks.

const pointRulesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPointRules: builder.query<PointValueRule[], void>({
      query: () => ({
        tag: 'PointRules',
        url: '/point-rules',
        mockResolver: () => mockDelay(mockPointValueRules),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'PointRules' as const, id })),
              { type: 'PointRules' as const, id: 'LIST' },
            ]
          : [{ type: 'PointRules' as const, id: 'LIST' }],
    }),

    getPointRuleDetail: builder.query<PointValueRule | undefined, string>({
      query: (id) => ({
        tag: 'PointRules',
        url: `/point-rules/${id}`,
        mockResolver: () => mockDelay(getPointValueRuleById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'PointRules', id }],
    }),

    getSiblingPointRule: builder.query<
      PointValueRule | undefined,
      { modelCode: string; partnerType: PointRulePartnerType }
    >({
      query: ({ modelCode, partnerType }) => ({
        tag: 'PointRules',
        url: '/point-rules/sibling',
        params: { modelCode, partnerType },
        mockResolver: () => {
          const group = groupPointValueRulesByProduct(mockPointValueRules).find(
            (g) => g.modelCode === modelCode,
          )
          const sibling =
            partnerType === 'Dealer' ? group?.dealerRule : group?.chemistRule
          return mockDelay(sibling ? getPointValueRuleById(sibling.id) : undefined)
        },
      }),
      providesTags: (result) =>
        result ? [{ type: 'PointRules', id: result.id }] : [],
    }),

    getPointRuleKpis: builder.query<typeof PointRuleKpis, void>({
      query: () => ({
        tag: 'PointRules',
        url: '/point-rules/kpis',
        mockResolver: () => mockDelay(PointRuleKpis),
      }),
      providesTags: [{ type: 'PointRules', id: 'KPIS' }],
    }),

    getPointDistributionByCategory: builder.query<typeof PointDistributionByCategory, void>({
      query: () => ({
        tag: 'PointRules',
        url: '/point-rules/distribution-by-category',
        mockResolver: () => mockDelay(PointDistributionByCategory),
      }),
      providesTags: [{ type: 'PointRules', id: 'DISTRIBUTION' }],
    }),

    getRegionMultipliers: builder.query<RegionMultiplierMap, void>({
      query: () => ({
        tag: 'PointRules',
        url: '/point-rules/region-multipliers',
        mockResolver: () => mockDelay(getStoredMultipliers()),
      }),
      providesTags: [{ type: 'PointRules', id: 'REGION_MULTIPLIERS' }],
    }),

    saveRegionMultipliers: builder.mutation<void, RegionMultiplierMap>({
      query: (value) => ({
        tag: 'PointRules',
        url: '/point-rules/region-multipliers',
        method: 'PUT',
        data: value,
        mockResolver: () => {
          storeMultipliers(value)
          return Promise.resolve()
        },
      }),
      invalidatesTags: [{ type: 'PointRules', id: 'REGION_MULTIPLIERS' }],
    }),

    getRegionMultiplierDates: builder.query<RegionDateMap, void>({
      query: () => ({
        tag: 'PointRules',
        url: '/point-rules/region-multiplier-dates',
        mockResolver: () => mockDelay(getStoredMultiplierDates()),
      }),
      providesTags: [{ type: 'PointRules', id: 'REGION_MULTIPLIER_DATES' }],
    }),

    saveRegionMultiplierDates: builder.mutation<void, RegionDateMap>({
      query: (value) => ({
        tag: 'PointRules',
        url: '/point-rules/region-multiplier-dates',
        method: 'PUT',
        data: value,
        mockResolver: () => {
          storeMultiplierDates(value)
          return Promise.resolve()
        },
      }),
      invalidatesTags: [{ type: 'PointRules', id: 'REGION_MULTIPLIER_DATES' }],
    }),

    getRegionMultiplierDefaults: builder.query<typeof regionMultiplierDefaults, void>({
      query: () => ({
        tag: 'PointRules',
        url: '/point-rules/region-multiplier-defaults',
        mockResolver: () => mockDelay(regionMultiplierDefaults),
      }),
      providesTags: [{ type: 'PointRules', id: 'REGION_MULTIPLIER_DEFAULTS' }],
    }),

    setBasePointValue: builder.mutation<void, { id: string; basePointValue: number }>({
      query: ({ id, basePointValue }) => ({
        tag: 'PointRules',
        url: `/point-rules/${id}/base-point-value`,
        method: 'PATCH',
        data: { basePointValue },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PointRules', id },
        { type: 'PointRules', id: 'LIST' },
      ],
    }),

    getProductRuleGroups: builder.query<ProductPointRuleGroup[], void>({
      query: () => ({
        tag: 'PointRules',
        url: '/point-rules/product-groups',
        mockResolver: () => mockDelay(groupPointValueRulesByProduct(mockPointValueRules)),
      }),
      providesTags: [{ type: 'PointRules', id: 'PRODUCT_GROUPS' }],
    }),

    getRuleStatuses: builder.query<RuleStatusMap, void>({
      query: () => ({
        tag: 'PointRules',
        url: '/point-rules/statuses',
        mockResolver: () => mockDelay(getStoredRuleStatuses()),
      }),
      providesTags: [{ type: 'PointRules', id: 'STATUSES' }],
    }),

    saveRuleStatuses: builder.mutation<void, RuleStatusMap>({
      query: (value) => ({
        tag: 'PointRules',
        url: '/point-rules/statuses',
        method: 'PUT',
        data: value,
        mockResolver: () => {
          storeRuleStatuses(value)
          return Promise.resolve()
        },
      }),
      invalidatesTags: [{ type: 'PointRules', id: 'STATUSES' }],
    }),

    saveRegionHistoryEntries: builder.mutation<void, Record<string, RegionPointHistoryEntry[]>>({
      query: (entries) => ({
        tag: 'PointRules',
        url: '/point-rules/region-history',
        method: 'POST',
        data: entries,
        mockResolver: () => {
          appendRegionHistoryEntries(entries)
          return Promise.resolve()
        },
      }),
      invalidatesTags: (_result, _error, entries) => Object.keys(entries).map((id) => ({ type: 'PointRules' as const, id })),
    }),
  }),
})

export const {
  useGetPointRulesQuery,
  useGetPointRuleDetailQuery,
  useLazyGetSiblingPointRuleQuery,
  useGetPointRuleKpisQuery,
  useGetPointDistributionByCategoryQuery,
  useGetRegionMultipliersQuery,
  useSaveRegionMultipliersMutation,
  useGetRegionMultiplierDatesQuery,
  useSaveRegionMultiplierDatesMutation,
  useGetRegionMultiplierDefaultsQuery,
  useSetBasePointValueMutation,
  useGetProductRuleGroupsQuery,
  useGetRuleStatusesQuery,
  useSaveRuleStatusesMutation,
  useSaveRegionHistoryEntriesMutation,
} = pointRulesApi

/** Non-async helpers retained as-is; not network calls, no RTK Query wrapper needed. */
export function getHighestCurrentPoints(rule: PointValueRule): number {
  return highestCurrentPoints(rule)
}

export function getChangeDate(): string {
  return formatRuleChangeDate()
}

export function getChangeTimestamp(): string {
  return formatRuleChangeTimestamp()
}

export type { RegionMultiplierMap, RegionDateMap, RuleStatusMap, ProductPointRuleGroup }
