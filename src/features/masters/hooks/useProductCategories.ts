import {
  useGetProductCategoriesQuery,
  type ProductCategoryQueryParams,
} from '@/features/masters/services/productCategoriesApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useProductCategories(params?: ProductCategoryQueryParams) {
  const categoriesResult = useGetProductCategoriesQuery(params)
  const categories = categoriesResult.data?.items ?? []
  const totalItems = categoriesResult.data?.totalItems ?? 0

  const isLoading = categoriesResult.isLoading || categoriesResult.isFetching
  const error = categoriesResult.error
    ? getApiErrorMessage(
        categoriesResult.error,
        'Failed to load product categories.',
      )
    : null

  return {
    categories,
    totalItems,
    kpis: {
      totalCategories: categories.length,
      activeCategories: categories.filter((c) => c.status === 'active').length,
      inactiveCategories: categories.filter((c) => c.status === 'inactive')
        .length,
    },
    isLoading,
    error,
  }
}
