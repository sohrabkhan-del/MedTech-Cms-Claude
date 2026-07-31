import {
  useGetProductCategoriesQuery,
  type ProductCategoryQueryParams,
} from '@/features/masters/services/productCategoriesApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useProductCategories(params?: ProductCategoryQueryParams) {
  const categoriesResult = useGetProductCategoriesQuery(params)
  const categories = categoriesResult.data ?? []

  const isLoading = categoriesResult.isLoading
  const error = categoriesResult.error
    ? getApiErrorMessage(categoriesResult.error, 'Failed to load product categories.')
    : null

  return {
    categories,
    kpis: {
      totalCategories: categories.length,
      activeCategories: categories.filter((c) => c.status === 'active').length,
      inactiveCategories: categories.filter((c) => c.status === 'inactive').length,
    },
    isLoading,
    error,
  }
}
