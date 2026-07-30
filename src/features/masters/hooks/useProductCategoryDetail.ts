import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetProductCategoryDetailQuery } from '@/features/masters/services/productCategoriesApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useProductCategoryDetail(categoryId: string | undefined) {
  const { data: category, isLoading, error: queryError } = useGetProductCategoryDetailQuery(categoryId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load product category.') : null

  return { category, isLoading, error }
}
