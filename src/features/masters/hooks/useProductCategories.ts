import {
  useGetProductCategoriesQuery,
  useGetProductCategoryKpisQuery,
} from '@/features/masters/services/productCategoriesApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useProductCategories() {
  const categoriesResult = useGetProductCategoriesQuery()
  const kpisResult = useGetProductCategoryKpisQuery()

  const isLoading = categoriesResult.isLoading || kpisResult.isLoading
  const error = categoriesResult.error
    ? getApiErrorMessage(categoriesResult.error, 'Failed to load product categories.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load product categories.')
      : null

  return {
    categories: categoriesResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
