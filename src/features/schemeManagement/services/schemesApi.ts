import { baseApi } from '@/store/api/baseApi'
import {
  mockSchemes,
  mockGeneralSchemes,
  mockSeasonalSchemes,
  getSchemeById,
  setSchemeStatus,
  allSchemeKpis,
  generalSchemeKpis,
  seasonalSchemeKpis,
  schemeRegionOptions,
  schemePartnerTypeOptions,
} from '@/features/schemeManagement/mockSchemes'
import { getGiftById } from '@/features/schemeManagement/mockGifts'
import type {
  Scheme,
  SchemeFormValues,
  SchemeStatus,
  SchemePartnerType,
  SchemePartnerEntry,
} from '@/features/schemeManagement/types/schemeManagement.types'
import { mockDelay } from '@/services/mockDelay'
import type { PartnerZone } from '@/types/partner'
import type { AnalyticsDateParams } from '@/utils/dateRangeToAnalyticsParams'

export interface SchemeGiftProductOption {
  id: string
  name: string
  image: string
  price: number
  dealerBasePoints: number | null
  chemistBasePoints: number | null
}

export interface SchemeMasterProductOption {
  id: string
  name: string
  code: string
  category: string
  dealerRewardPoints: number
  chemistRewardPoints: number
}

export interface SchemeFormOptions {
  regionOptions: PartnerZone[]
  partnerTypeOptions: SchemePartnerType[]
  giftProductOptions: SchemeGiftProductOption[]
  masterProductOptions: SchemeMasterProductOption[]
}

export interface SchemeListKpis {
  totalSchemes: number
  activeSchemes: number
  totalEnrolledPartners: number
  totalPointsAllocated: number
}

export interface SchemeQueryParams extends AnalyticsDateParams {
  page?: number
  limit?: number
  search?: string
  regionId?: string
  schemeType?: Scheme['type']
}

type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
type CampaignPartnerType = 'DEALER' | 'CHEMIST'

interface CampaignRewardApiItem {
  rewardId: string
  rewardProduct?: {
    id?: string | null
    name?: string | null
    rewardProductId?: string | null
  } | null
  dealerPoints?: number | null
  chemistPoints?: number | null
}

interface CampaignApiItem {
  id: string
  code?: string | null
  referenceId?: string | null
  schemeCode?: string | null
  name?: string | null
  description?: string | null
  status?: CampaignStatus | string | null
  type?: string | null
  schemeType?: string | null
  priority?: number | null
  applicableToAllProducts?: boolean | null
  autoEnroll?: boolean | null
  pointCalculationType?: string | null
  redemptionType?: string | null
  isFeatured?: boolean | null
  sendNotification?: boolean | null
  startDate?: string | null
  endDate?: string | null
  partnerTypes?: CampaignPartnerType[]
  regionIds?: string[]
  applicableProducts?: string[]
  applicableProductDetails?: Array<{
    productId?: string | null
    dealerBasePointValue?: number | null
    chemistBasePointValue?: number | null
    dealerRegionMultipliers?: Record<string, number>
    chemistRegionMultipliers?: Record<string, number>
  }>
  rewards?: CampaignRewardApiItem[]
  bannerImage?: string | null
  thumbnailImage?: string | null
  termsAndConditions?: string | null
}

interface CampaignListApiResponse {
  success: boolean
  data: {
    items: CampaignApiItem[]
    totalItems?: number
    totalPages?: number
    currentPage?: number
    pageSize?: number
  }
}

interface CampaignDetailApiResponse {
  success: boolean
  data: CampaignApiItem
}

interface CampaignAnalyticsApiResponse {
  success: boolean
  data: {
    totalSchemes?: number
    currentlyActive?: number
    enrolledPartners?: number
    pointsAllocated?: number
  }
}

interface CampaignPartnerApiItem {
  id: string
  campaignId?: string | null
  partnerId?: string | null
  partnerName?: string | null
  name?: string | null
  partner?: {
    id?: string | null
    name?: string | null
    businessName?: string | null
  } | null
  partnerDetails?: {
    id?: string | null
    referenceId?: string | null
    businessName?: string | null
    ownerName?: string | null
    type?: string | null
    profileImage?: string | null
  } | null
  partnerType?: CampaignPartnerType | string | null
  status?: string | null
  schemePoints?: number | null
  regionId?: string | null
  regionName?: string | null
  region?: {
    name?: string | null
  } | null
}

interface CampaignPartnersApiResponse {
  success: boolean
  data: {
    items: CampaignPartnerApiItem[]
  }
}

function formatDate(value?: string | null) {
  if (!value) return null
  return value.slice(0, 10)
}

function toUiStatus(status?: string | null): SchemeStatus {
  return status === 'ACTIVE' ? 'active' : 'inactive'
}

function toApiStatus(status: SchemeStatus): CampaignStatus {
  return status === 'active' ? 'ACTIVE' : 'INACTIVE'
}

function toUiPartnerType(type: CampaignPartnerType): SchemePartnerType {
  return type === 'DEALER' ? 'Dealer' : 'Chemist'
}

function toApiPartnerType(type: SchemePartnerType): CampaignPartnerType {
  return type === 'Dealer' ? 'DEALER' : 'CHEMIST'
}

function uniqueRegions(scheme: CampaignApiItem): PartnerZone[] {
  if (!scheme.regionIds?.length) return []

  const normalizedIds = new Set(
    scheme.regionIds.map((regionId) => regionId.trim().toLowerCase()),
  )

  return schemeRegionOptions.filter((region) =>
    normalizedIds.has(region.toLowerCase()),
  )
}

function mapCampaign(item: CampaignApiItem): Scheme {
  const partnerTypes = (item.partnerTypes ?? [])
    .filter(
      (type): type is CampaignPartnerType =>
        type === 'DEALER' || type === 'CHEMIST',
    )
    .map(toUiPartnerType)
  const regions = uniqueRegions(item)
  const schemeType = item.schemeType ?? item.type ?? 'general'

  return {
    id: item.id,
    type: schemeType === 'seasonal' ? 'seasonal' : 'general',
    name:
      item.name ?? item.code ?? item.schemeCode ?? item.referenceId ?? item.id,
    status: toUiStatus(item.status),
    startDate: formatDate(item.startDate) ?? '',
    endDate: formatDate(item.endDate),
    partnerTypes,
    dealerRegions: partnerTypes.includes('Dealer') ? regions : [],
    chemistRegions: partnerTypes.includes('Chemist') ? regions : [],
    regions,
    applicableProducts: (
      item.applicableProductDetails ??
      item.applicableProducts ??
      []
    ).map((entry) => {
      // API may return either product IDs (string) or detailed objects
      if (typeof entry === 'string') {
        return {
          productId: entry,
          productName: undefined,
          dealerBasePointValue: null,
          chemistBasePointValue: null,
          dealerRegionMultipliers: {},
          chemistRegionMultipliers: {},
        }
      }

      const e = entry as Record<string, unknown>
      const nestedProduct = e['product'] as Record<string, unknown> | undefined
      const productId =
        (e['id'] as string) ??
        (e['productId'] as string) ??
        (nestedProduct?.['id'] as string) ??
        'unknown-product'
      const productName =
        (e['productName'] as string) ??
        (nestedProduct?.['productName'] as string) ??
        (nestedProduct?.['name'] as string) ??
        undefined
      const productCode =
        (e['productCode'] as string) ??
        (nestedProduct?.['productCode'] as string) ??
        (nestedProduct?.['code'] as string) ??
        undefined
      // prefer explicit product-level points when provided, else container-level
      const dealerBase =
        (e['dealerBasePointValue'] as number | undefined) ??
        (e['dealerProductPoints'] as number | undefined) ??
        (e['dealerContainerPoints'] as number | undefined) ??
        null
      const chemistBase =
        (e['chemistBasePointValue'] as number | undefined) ??
        (e['chemistProductPoints'] as number | undefined) ??
        (e['chemistContainerPoints'] as number | undefined) ??
        null

      // build region multiplier maps from the `regions` array when present,
      // else fall back to pre-built dealerRegionMultipliers/chemistRegionMultipliers maps
      let dealerRegionMultipliers: Record<string, number> = {}
      let chemistRegionMultipliers: Record<string, number> = {}
      if (Array.isArray(e['regions'])) {
        ;(e['regions'] as Array<Record<string, unknown>>).forEach((r) => {
          const regionObj = r['region'] as Record<string, unknown> | undefined
          // Prefer human friendly names when available, then regionCode, then id
          const regionName =
            (r['regionName'] as string | undefined) ??
            (regionObj?.['name'] as string | undefined)
          const regionCode =
            (r['regionCode'] as string | undefined) ??
            (regionObj?.['code'] as string | undefined)
          const key =
            regionName ??
            regionCode ??
            (r['regionId'] as string) ??
            (regionObj?.['id'] as string) ??
            'unknown-region'
          const dm = r['dealerMultiplier'] as number | undefined
          const cm = r['chemistMultiplier'] as number | undefined
          if (typeof dm === 'number') dealerRegionMultipliers[key] = dm
          if (typeof cm === 'number') chemistRegionMultipliers[key] = cm
        })
      } else {
        if (
          e['dealerRegionMultipliers'] &&
          typeof e['dealerRegionMultipliers'] === 'object'
        ) {
          dealerRegionMultipliers = e[
            'dealerRegionMultipliers'
          ] as Record<string, number>
        }
        if (
          e['chemistRegionMultipliers'] &&
          typeof e['chemistRegionMultipliers'] === 'object'
        ) {
          chemistRegionMultipliers = e[
            'chemistRegionMultipliers'
          ] as Record<string, number>
        }
      }

      return {
        productId,
        productName,
        productCode,
        dealerBasePointValue: dealerBase,
        chemistBasePointValue: chemistBase,
        dealerRegionMultipliers,
        chemistRegionMultipliers,
      }
    }),
    giftRules: (item.rewards ?? []).map((reward) => ({
      giftId: reward.rewardProduct?.id ?? reward.rewardId,
      giftName:
        reward.rewardProduct?.name ??
        getGiftById(reward.rewardId)?.giftName ??
        reward.rewardProduct?.rewardProductId ??
        reward.rewardId,
      dealerRule:
        reward.dealerPoints != null
          ? { price: 0, Points: reward.dealerPoints, discountPrice: 0 }
          : null,
      chemistRule:
        reward.chemistPoints != null
          ? { price: 0, Points: reward.chemistPoints, discountPrice: 0 }
          : null,
    })),
    description: item.description ?? '',
    disclaimer: item.termsAndConditions ?? '',
    image: item.thumbnailImage ?? undefined,
    banner: item.bannerImage ?? undefined,
    code: item.code ?? item.schemeCode ?? undefined,
    referenceId: item.referenceId ?? undefined,
    schemeCode: item.schemeCode ?? item.code ?? undefined,
    totalDealerPoints:
      item.rewards?.reduce(
        (sum, reward) => sum + (reward.dealerPoints ?? 0),
        0,
      ) ?? 0,
    totalChemistPoints:
      item.rewards?.reduce(
        (sum, reward) => sum + (reward.chemistPoints ?? 0),
        0,
      ) ?? 0,
    priority: item.priority ?? undefined,
    applicableToAllProducts: item.applicableToAllProducts ?? undefined,
    autoEnroll: item.autoEnroll ?? undefined,
    pointCalculationType: item.pointCalculationType ?? undefined,
    redemptionType: item.redemptionType ?? undefined,
    isFeatured: item.isFeatured ?? undefined,
    sendNotification: item.sendNotification ?? undefined,
    partners: { dealer: [], chemist: [] },
  }
}

function mapCampaignPartners(
  items: CampaignPartnerApiItem[],
): Scheme['partners'] {
  return items.reduce<Scheme['partners']>(
    (partners, item) => {
      const partnerRegion =
        item.regionName ?? item.region?.name ?? item.regionId ?? 'North'
      const entry: SchemePartnerEntry = {
        id: item.partnerId ?? item.id,
        name:
          item.partnerDetails?.businessName ??
          item.partnerName ??
          item.name ??
          item.partner?.name ??
          item.partner?.businessName ??
          item.partnerDetails?.ownerName ??
          item.partnerId ??
          item.id,
        region:
          (partnerRegion as string).startsWith('North') ||
          partnerRegion === 'North'
            ? 'North'
            : (partnerRegion as string).startsWith('South') ||
                partnerRegion === 'South'
              ? 'South'
              : (partnerRegion as string).startsWith('East') ||
                  partnerRegion === 'East'
                ? 'East'
                : (partnerRegion as string).startsWith('West') ||
                    partnerRegion === 'West'
                  ? 'West'
                  : 'North',
        Points: item.schemePoints ?? 0,
        status:
          item.status === 'ACTIVE'
            ? 'enrolled'
            : item.status === 'PENDING_APPROVAL'
              ? 'interested'
              : 'redeemed',
      }

      if (item.partnerType === 'CHEMIST') {
        partners.chemist.push(entry)
      } else {
        partners.dealer.push(entry)
      }

      return partners
    },
    { dealer: [], chemist: [] },
  )
}

function buildCampaignPayload(values: SchemeFormValues) {
  const applicableProducts = values.applicableProducts.map(
    (product) => product.productId,
  )
  return {
    code: values.name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_'),
    name: values.name,
    description: values.description ?? '',
    type: 'POINT_REDEMPTION',
    status: toApiStatus(values.status),
    priority: 1,
    schemeType: values.type,
    applicableToAllProducts: applicableProducts.length === 0,
    applicableProducts,
    startDate: new Date(values.startDate).toISOString(),
    endDate: values.endDate
      ? new Date(`${values.endDate}T23:59:59.000Z`).toISOString()
      : undefined,
    claimEndDate: values.endDate
      ? new Date(`${values.endDate}T23:59:59.000Z`).toISOString()
      : undefined,
    partnerTypes: values.partnerTypes.map(toApiPartnerType),
    regionIds: Array.from(
      new Set([...values.dealerRegions, ...values.chemistRegions]),
    ),
    autoEnroll: values.type === 'general',
    pointCalculationType: 'CURRENT_BALANCE',
    pointFromDate: new Date(values.startDate).toISOString(),
    pointToDate: values.endDate
      ? new Date(`${values.endDate}T23:59:59.000Z`).toISOString()
      : undefined,
    redemptionType: values.type === 'general' ? 'ALL_OR_NOTHING' : 'INDIVIDUAL',
    rewards: values.giftRules.map((rule, index) => ({
      rewardId: rule.giftId,
      chemistPoints: Number(rule.chemistRule?.Points ?? 0),
      dealerPoints: Number(rule.dealerRule?.Points ?? 0),
      stock: 0,
      claimedStock: 0,
      perUserLimit: 1,
      displayOrder: index + 1,
      isActive: true,
    })),
    isFeatured: false,
    termsAndConditions: values.disclaimer ?? '',
    sendNotification: true,
  }
}

const schemesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSchemes: builder.query<Scheme[], SchemeQueryParams | void>({
      query: (params) => ({
        tag: 'Schemes',
        url: '/campaigns',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          search: params?.search || undefined,
          regionId: params?.regionId || undefined,
          schemeType: params?.schemeType || undefined,
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
        mockResolver: () => mockDelay(mockSchemes),
      }),
      transformResponse: (response: CampaignListApiResponse | Scheme[]) =>
        Array.isArray(response)
          ? response
          : response.data.items.map(mapCampaign),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Schemes' as const, id })),
              { type: 'Schemes' as const, id: 'LIST' },
            ]
          : [{ type: 'Schemes' as const, id: 'LIST' }],
    }),

    getGeneralSchemes: builder.query<Scheme[], void>({
      query: () => ({
        tag: 'Schemes',
        url: '/schemes/general',
        mockResolver: () => mockDelay(mockGeneralSchemes),
      }),
      providesTags: [{ type: 'Schemes', id: 'GENERAL_LIST' }],
    }),

    getSeasonalSchemes: builder.query<Scheme[], void>({
      query: () => ({
        tag: 'Schemes',
        url: '/schemes/seasonal',
        mockResolver: () => mockDelay(mockSeasonalSchemes),
      }),
      providesTags: [{ type: 'Schemes', id: 'SEASONAL_LIST' }],
    }),

    getSchemeDetail: builder.query<Scheme | undefined, string>({
      query: (id) => ({
        tag: 'Schemes',
        url: `/campaigns/${id}`,
        mockResolver: () => mockDelay(getSchemeById(id)),
      }),
      transformResponse: (
        response: CampaignDetailApiResponse | Scheme | undefined,
      ) =>
        response && 'success' in response
          ? mapCampaign(response.data)
          : response,
      providesTags: (_result, _error, id) => [{ type: 'Schemes', id }],
    }),

    getSchemePartners: builder.query<Scheme['partners'], string>({
      query: (id) => ({
        tag: 'Schemes',
        url: `/campaigns/${id}/partners`,
        mockResolver: () =>
          mockDelay(getSchemeById(id)?.partners ?? { dealer: [], chemist: [] }),
      }),
      transformResponse: (
        response: CampaignPartnersApiResponse | Scheme['partners'],
      ) =>
        'dealer' in response
          ? response
          : mapCampaignPartners(response.data.items),
      providesTags: (_result, _error, id) => [
        { type: 'Schemes', id: `${id}-partners` },
      ],
    }),

    getAllSchemeKpis: builder.query<
      SchemeListKpis,
      | (AnalyticsDateParams & {
          regionId?: string
          schemeType?: Scheme['type']
        })
      | void
    >({
      query: (params) => ({
        tag: 'Schemes',
        url: '/analytics-cards/campaigns',
        params: {
          regionId: params?.regionId || undefined,
          schemeType: params?.schemeType || undefined,
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
        mockResolver: () => mockDelay(allSchemeKpis),
      }),
      transformResponse: (
        response: CampaignAnalyticsApiResponse | SchemeListKpis,
      ) =>
        'success' in response
          ? {
              totalSchemes: Number(response.data.totalSchemes ?? 0),
              activeSchemes: Number(response.data.currentlyActive ?? 0),
              totalEnrolledPartners: Number(
                response.data.enrolledPartners ?? 0,
              ),
              totalPointsAllocated: Number(response.data.pointsAllocated ?? 0),
            }
          : response,
      providesTags: [{ type: 'Schemes', id: 'KPIS' }],
    }),

    getGeneralSchemeKpis: builder.query<typeof generalSchemeKpis, void>({
      query: () => ({
        tag: 'Schemes',
        url: '/schemes/general/kpis',
        mockResolver: () => mockDelay(generalSchemeKpis),
      }),
      providesTags: [{ type: 'Schemes', id: 'GENERAL_KPIS' }],
    }),

    getSeasonalSchemeKpis: builder.query<typeof seasonalSchemeKpis, void>({
      query: () => ({
        tag: 'Schemes',
        url: '/schemes/seasonal/kpis',
        mockResolver: () => mockDelay(seasonalSchemeKpis),
      }),
      providesTags: [{ type: 'Schemes', id: 'SEASONAL_KPIS' }],
    }),

    getSchemeFormOptions: builder.query<SchemeFormOptions, void>({
      queryFn: () => ({
        data: {
          regionOptions: schemeRegionOptions,
          partnerTypeOptions: schemePartnerTypeOptions,
          giftProductOptions: [],
          masterProductOptions: [],
        },
      }),
      providesTags: [{ type: 'Schemes', id: 'FORM_OPTIONS' }],
    }),

    createScheme: builder.mutation<void, SchemeFormValues>({
      query: (values) => ({
        tag: 'Schemes',
        url: '/campaigns',
        method: 'POST',
        data: buildCampaignPayload(values),
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [
        { type: 'Schemes', id: 'LIST' },
        { type: 'Schemes', id: 'KPIS' },
      ],
    }),

    updateScheme: builder.mutation<
      void,
      { id: string; values: SchemeFormValues }
    >({
      query: ({ id, values }) => ({
        tag: 'Schemes',
        url: `/campaigns/${id}`,
        method: 'PUT',
        data: buildCampaignPayload(values),
        mockResolver: () => {
          setSchemeStatus(id, values.status)
          return Promise.resolve()
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Schemes', id },
        { type: 'Schemes', id: 'LIST' },
        { type: 'Schemes', id: 'KPIS' },
      ],
    }),

    updateSchemeStatus: builder.mutation<
      Scheme | undefined,
      { id: string; status: SchemeStatus }
    >({
      query: ({ id, status }) => ({
        tag: 'Schemes',
        url: `/campaigns/${id}/status`,
        method: 'PATCH',
        data: { status: toApiStatus(status) },
        mockResolver: () => mockDelay(setSchemeStatus(id, status), 300),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Schemes', id },
        { type: 'Schemes', id: 'LIST' },
        { type: 'Schemes', id: 'KPIS' },
      ],
    }),

    deleteScheme: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'Schemes',
        url: `/campaigns/${id}`,
        method: 'DELETE',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Schemes', id },
        { type: 'Schemes', id: 'LIST' },
        { type: 'Schemes', id: 'KPIS' },
      ],
    }),
  }),
})

export const {
  useGetAllSchemesQuery,
  useGetGeneralSchemesQuery,
  useGetSeasonalSchemesQuery,
  useGetSchemeDetailQuery,
  useGetSchemePartnersQuery,
  useGetAllSchemeKpisQuery,
  useGetGeneralSchemeKpisQuery,
  useGetSeasonalSchemeKpisQuery,
  useGetSchemeFormOptionsQuery,
  useCreateSchemeMutation,
  useUpdateSchemeMutation,
  useUpdateSchemeStatusMutation,
  useDeleteSchemeMutation,
} = schemesApi
