import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetShowcaseProductDetailQuery } from '@/features/marketingProducts/services/showcaseProductsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useShowcaseProductDetail(productId: string | undefined) {
  const { data: product, isLoading, error: queryError } = useGetShowcaseProductDetailQuery(productId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load showcase product.') : null

  return { product, isLoading, error }
}
