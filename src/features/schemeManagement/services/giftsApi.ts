import { baseApi } from '@/store/api/baseApi'
import {
  mockGifts,
  getGiftById,
  giftCatalogueKpis,
  giftCategoryOptions,
  giftBrandOptions,
  giftEligibilityOptions,
  resolveStockStatus,
} from '@/features/schemeManagement/mockGifts'
import type {
  Gift,
  GiftFormValues,
  StockStatus,
} from '@/features/schemeManagement/types/schemeManagement.types'
import { mockDelay } from '@/services/mockDelay'
import type { AnalyticsDateParams } from '@/utils/dateRangeToAnalyticsParams'

export interface GiftFormOptions {
  giftCategoryOptions: string[]
  giftCategorySelectOptions: Array<{ id: string; name: string }>
  giftBrandOptions: string[]
  giftEligibilityOptions: string[]
  regionOptions: Array<{ id: string; name: string; code?: string | null }>
}

export interface GiftQueryParams extends AnalyticsDateParams {
  page?: number
  limit?: number
  search?: string
  regionId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

type RewardPartnerType = 'dealer' | 'chemist'

interface RewardRegionApiItem {
  id: string
  code?: string | null
  name?: string | null
}

interface RewardImageApiItem {
  url?: string | null
  isPrimary?: boolean
}

interface RewardProductApiItem {
  id: string
  rewardProductId?: string | null
  name?: string | null
  description?: string | null
  categoryId?: string | null
  category?:
    { id?: string; name?: string; categoryName?: string } | string | null
  brand?: string | null
  images?: RewardImageApiItem[]
  visibleTo?: RewardPartnerType[]
  partnerConfig?: Array<{
    partnerType?: RewardPartnerType
    regionIds?: string[]
    regions?: RewardRegionApiItem[]
    basePoints?: number | null
  }>
  price?: number | null
  availableQuantity?: number | null
  isActive?: boolean
  createdAt?: string | null
}

interface RewardListApiResponse {
  success: boolean
  data: {
    items: RewardProductApiItem[]
    totalItems?: number
    totalPages?: number
    currentPage?: number
    pageSize?: number
  }
}

interface RewardDetailApiResponse {
  success: boolean
  data: RewardProductApiItem
}

interface RewardAnalyticsApiResponse {
  success: boolean
  data: Partial<typeof giftCatalogueKpis> & Record<string, unknown>
}

interface CategoryOptionsResponse {
  success: boolean
  data:
    | {
        items?: Array<{
          id: string
          code?: string
          name?: string
          categoryName?: string
        }>
      }
    | Array<{ id: string; code?: string; name?: string; categoryName?: string }>
}

interface RewardCategoryResponse {
  success: boolean
  data: { id: string; code: string; name: string; status?: string }
}

interface RegionOptionsResponse {
  success: boolean
  data: Array<{
    id: string
    name: string
    code?: string | null
    isActive?: boolean
  }>
}

const regionNameByCode: Record<string, 'East' | 'West' | 'North' | 'South'> = {
  EAST: 'East',
  WEST: 'West',
  NORTH: 'North',
  SOUTH: 'South',
}

function toPartnerType(value: RewardPartnerType): 'Dealer' | 'Chemist' {
  return value === 'dealer' ? 'Dealer' : 'Chemist'
}

function mapRegions(
  regions?: RewardRegionApiItem[],
): Array<'East' | 'West' | 'North' | 'South'> {
  return (regions ?? [])
    .map(
      (region) =>
        regionNameByCode[(region.code ?? '').toUpperCase()] ?? region.name,
    )
    .filter(
      (name): name is 'East' | 'West' | 'North' | 'South' =>
        name === 'East' ||
        name === 'West' ||
        name === 'North' ||
        name === 'South',
    )
}

function getCategoryName(item: RewardProductApiItem): string {
  if (typeof item.category === 'string') return item.category
  return (
    item.category?.name ?? item.category?.categoryName ?? item.categoryId ?? '-'
  )
}

function mapRewardProduct(item: RewardProductApiItem): Gift {
  const dealerConfig = item.partnerConfig?.find(
    (config) => config.partnerType === 'dealer',
  )
  const chemistConfig = item.partnerConfig?.find(
    (config) => config.partnerType === 'chemist',
  )
  const primaryImage =
    item.images?.find((image) => image.isPrimary)?.url ??
    item.images?.[0]?.url ??
    ''
  const dealerPoints = dealerConfig?.basePoints ?? null
  const chemistPoints = chemistConfig?.basePoints ?? null
  const requiredPoints = dealerPoints ?? chemistPoints ?? 0
  const partnerTypes = (
    item.visibleTo ??
    item.partnerConfig?.map((config) => config.partnerType).filter(Boolean) ??
    []
  )
    .filter(
      (type): type is RewardPartnerType =>
        type === 'dealer' || type === 'chemist',
    )
    .map(toPartnerType)

  return {
    id: item.id,
    giftCode: item.rewardProductId ?? item.id,
    giftName: item.name ?? '-',
    categoryId: item.categoryId ?? undefined,
    category: getCategoryName(item),
    brand: item.brand ?? '-',
    giftImage: primaryImage,
    description: item.description ?? '',
    sku: item.rewardProductId ?? item.id,
    price: item.price ?? 0,
    requiredPoints,
    availableQuantity: item.availableQuantity ?? 0,
    redeemedQuantity: 0,
    status: item.isActive ? 'active' : 'inactive',
    eligibleUserType:
      partnerTypes.length === 2 ? 'All' : (partnerTypes[0] ?? 'All'),
    partnerTypes,
    dealerRegions: mapRegions(dealerConfig?.regions),
    chemistRegions: mapRegions(chemistConfig?.regions),
    dealerRegionIds:
      dealerConfig?.regionIds ??
      dealerConfig?.regions?.map((region) => region.id) ??
      [],
    chemistRegionIds:
      chemistConfig?.regionIds ??
      chemistConfig?.regions?.map((region) => region.id) ??
      [],
    dealerBasePoints: dealerPoints,
    chemistBasePoints: chemistPoints,
    redemptionHistory: [],
    inventoryHistory: item.createdAt
      ? [
          {
            id: `${item.id}-created`,
            date: new Date(item.createdAt).toLocaleDateString('en-GB'),
            stockAdded: item.availableQuantity ?? 0,
            stockRemoved: 0,
            currentStock: item.availableQuantity ?? 0,
            updatedBy: 'System',
          },
        ]
      : [],
  }
}

function buildRewardPayload(values: GiftFormValues) {
  const dealerRegions = values.dealerRegions.map((region) => String(region))
  const chemistRegions = values.chemistRegions.map((region) => String(region))
  return {
    name: values.giftName,
    description: values.description ?? '',
    categoryId: values.category,
    brand: values.brand,
    price: values.price ? Number(values.price) : null,
    images: values.giftImage
      ? [{ url: values.giftImage, isPrimary: true }]
      : [],
    visibleTo: values.partnerTypes.map((type) => type.toLowerCase()),
    partnerConfig: [
      ...(values.partnerTypes.includes('Dealer')
        ? [
            {
              partnerType: 'dealer',
              regionIds: dealerRegions,
              basePoints: Number(values.dealerBasePoints || 0),
            },
          ]
        : []),
      ...(values.partnerTypes.includes('Chemist')
        ? [
            {
              partnerType: 'chemist',
              regionIds: chemistRegions,
              basePoints: Number(values.chemistBasePoints || 0),
            },
          ]
        : []),
    ],
    availableQuantity: Number(values.availableQuantity || 0),
  }
}

function buildRewardCategoryCode(name: string) {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

const giftsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGifts: builder.query<Gift[], GiftQueryParams | void>({
      query: (params) => ({
        tag: 'Gifts',
        url: '/rewards',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search || undefined,
          regionId: params?.regionId || undefined,
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
          sortBy: params?.sortBy || undefined,
          sortOrder: params?.sortOrder ?? 'desc',
        },
        mockResolver: () => mockDelay(mockGifts),
      }),
      transformResponse: (response: RewardListApiResponse | Gift[]) =>
        Array.isArray(response)
          ? response
          : response.data.items.map(mapRewardProduct),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Gifts' as const, id })),
              { type: 'Gifts' as const, id: 'LIST' },
            ]
          : [{ type: 'Gifts' as const, id: 'LIST' }],
    }),

    getGiftDetail: builder.query<Gift | undefined, string>({
      query: (id) => ({
        tag: 'Gifts',
        url: `/rewards/${id}`,
        mockResolver: () => mockDelay(getGiftById(id)),
      }),
      transformResponse: (
        response: RewardDetailApiResponse | Gift | undefined,
      ) =>
        response && 'success' in response
          ? mapRewardProduct(response.data)
          : response,
      providesTags: (_result, _error, id) => [{ type: 'Gifts', id }],
    }),

    getGiftCatalogueKpis: builder.query<
      typeof giftCatalogueKpis,
      (AnalyticsDateParams & { regionId?: string }) | void
    >({
      query: (params) => ({
        tag: 'Gifts',
        url: '/analytics-cards/reward-products',
        params: {
          regionId: params?.regionId || undefined,
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
        mockResolver: () => mockDelay(giftCatalogueKpis),
      }),
      transformResponse: (
        response: RewardAnalyticsApiResponse | typeof giftCatalogueKpis,
      ) =>
        'success' in response
          ? {
              totalGifts: Number(
                response.data.totalGifts ??
                  response.data.totalRewardProducts ??
                  response.data.totalProducts ??
                  0,
              ),
              availableStock: Number(
                response.data.availableStock ?? response.data.totalStock ?? 0,
              ),
              outOfStock: Number(response.data.outOfStock ?? 0),
              totalRedemptions: Number(
                response.data.totalRedemptions ??
                  response.data.redemptions ??
                  0,
              ),
            }
          : response,
      providesTags: [{ type: 'Gifts', id: 'KPIS' }],
    }),

    getGiftFormOptions: builder.query<GiftFormOptions, void>({
      query: () => ({
        tag: 'Gifts',
        url: '/reward-categories',
        params: { page: 1, limit: 100, status: 'ACTIVE' },
        mockResolver: () =>
          mockDelay({
            giftCategoryOptions,
            giftCategorySelectOptions: giftCategoryOptions.map((name) => ({
              id: name,
              name,
            })),
            giftBrandOptions,
            giftEligibilityOptions,
            regionOptions: [],
          }),
      }),
      transformResponse: (
        response: CategoryOptionsResponse | GiftFormOptions,
      ) => {
        if ('giftCategoryOptions' in response) return response
        const categories = Array.isArray(response.data)
          ? response.data
          : (response.data.items ?? [])
        const selectOptions = categories.map((category) => ({
          id: category.id,
          name: category.name ?? category.categoryName ?? category.id,
        }))
        return {
          giftCategoryOptions: selectOptions.map((category) => category.name),
          giftCategorySelectOptions: selectOptions,
          giftBrandOptions,
          giftEligibilityOptions,
          regionOptions: [],
        }
      },
      providesTags: [{ type: 'Gifts', id: 'FORM_OPTIONS' }],
    }),

    createRewardCategory: builder.mutation<
      { id: string; name: string },
      string
    >({
      query: (name) => ({
        tag: 'Gifts',
        url: '/reward-categories',
        method: 'POST',
        data: {
          code: buildRewardCategoryCode(name),
          name,
        },
        mockResolver: () => Promise.resolve({ id: name, name }),
      }),
      transformResponse: (
        response: RewardCategoryResponse | { id: string; name: string },
      ) => ('success' in response ? response.data : response),
      invalidatesTags: [{ type: 'Gifts', id: 'FORM_OPTIONS' }],
    }),

    getGiftRegionOptions: builder.query<GiftFormOptions['regionOptions'], void>(
      {
        query: () => ({
          tag: 'Gifts',
          url: '/regions',
          mockResolver: () => mockDelay([]),
        }),
        transformResponse: (
          response: RegionOptionsResponse | GiftFormOptions['regionOptions'],
        ) =>
          Array.isArray(response)
            ? response
            : response.data
                .filter(
                  (region) =>
                    region.isActive !== false && region.code !== 'ALL_INDIA',
                )
                .map((region) => ({
                  id: region.id,
                  name: region.name,
                  code: region.code,
                })),
        providesTags: [{ type: 'Gifts', id: 'FORM_OPTIONS' }],
      },
    ),

    createGift: builder.mutation<void, GiftFormValues>({
      query: (values) => ({
        tag: 'Gifts',
        url: '/rewards',
        method: 'POST',
        data: buildRewardPayload(values),
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [
        { type: 'Gifts', id: 'LIST' },
        { type: 'Gifts', id: 'KPIS' },
      ],
    }),

    updateGift: builder.mutation<void, { id: string; values: GiftFormValues }>({
      query: ({ id, values }) => ({
        tag: 'Gifts',
        url: `/rewards/${id}`,
        method: 'PUT',
        data: buildRewardPayload(values),
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Gifts', id },
        { type: 'Gifts', id: 'LIST' },
        { type: 'Gifts', id: 'KPIS' },
      ],
    }),

    setGiftStatus: builder.mutation<
      void,
      { id: string; status: Gift['status'] }
    >({
      query: ({ id }) => ({
        tag: 'Gifts',
        url: `/rewards/${id}/toggle-status`,
        method: 'PATCH',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Gifts', id },
        { type: 'Gifts', id: 'LIST' },
      ],
    }),

    deleteGift: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'Gifts',
        url: `/rewards/${id}`,
        method: 'DELETE',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Gifts', id },
        { type: 'Gifts', id: 'LIST' },
        { type: 'Gifts', id: 'KPIS' },
      ],
    }),
  }),
})

export const {
  useGetGiftsQuery,
  useGetGiftDetailQuery,
  useGetGiftCatalogueKpisQuery,
  useGetGiftFormOptionsQuery,
  useCreateRewardCategoryMutation,
  useGetGiftRegionOptionsQuery,
  useCreateGiftMutation,
  useUpdateGiftMutation,
  useSetGiftStatusMutation,
  useDeleteGiftMutation,
} = giftsApi

/** Non-async helper retained as-is; not a network call, no RTK Query wrapper needed. */
export function getGiftStockStatus(gift: Gift): StockStatus {
  return resolveStockStatus(gift)
}
