import {
  useGetShowcaseProductsQuery,
  useGetShowcaseProductKpisQuery,
  useDeleteShowcaseProductMutation,
  type ShowcaseProductQueryParams,
} from '@/features/marketingProducts/services/showcaseProductsApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

/** Product list + KPIs for the Products Catalog page. */
export function useShowcaseProducts(params?: ShowcaseProductQueryParams) {
  const { dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const { preset, startDate, endDate } = analyticsParams

  const productsResult = useGetShowcaseProductsQuery({
    ...params,
    preset,
    startDate,
    endDate,
  })
  const kpisResult = useGetShowcaseProductKpisQuery(analyticsParams)
  const [deleteShowcaseProductMutation] = useDeleteShowcaseProductMutation()

  const isLoading = productsResult.isFetching
  const isKpisLoading = kpisResult.isFetching
  const error = productsResult.error
    ? getApiErrorMessage(
        productsResult.error,
        'Failed to load showcase products.',
      )
    : kpisResult.error
      ? getApiErrorMessage(
          kpisResult.error,
          'Failed to load showcase products.',
        )
      : null

  async function deleteProduct(id: string) {
    await deleteShowcaseProductMutation(id).unwrap()
  }

  const data = productsResult.data
  const products = data?.items ?? []
  const totalCount = data?.totalItems ?? products.length

  return {
    products,
    totalCount,
    kpis: kpisResult.data ?? null,
    isLoading,
    isKpisLoading,
    error,
    deleteProduct,
  }
}
