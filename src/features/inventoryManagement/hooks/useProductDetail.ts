import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetProductDetailQuery } from '@/features/inventoryManagement/services/productsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useProductDetail(productId: string | undefined) {
  const { data: product, isLoading, error: queryError } = useGetProductDetailQuery(productId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load product.') : null

  return { product, isLoading, error }
}
