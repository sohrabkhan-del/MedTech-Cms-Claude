import { skipToken } from '@reduxjs/toolkit/query/react'
import {
  useGetShowcaseProductDetailQuery,
  useUpdateShowcaseProductMutation,
} from '@/features/marketingProducts/services/showcaseProductsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useShowcaseProductDetail(productId: string | undefined) {
  const { data: product, isLoading, error: queryError } = useGetShowcaseProductDetailQuery(productId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load showcase product.') : null
  const [updateShowcaseProduct, { isLoading: isStatusUpdating }] = useUpdateShowcaseProductMutation()

  async function setActive(isActive: boolean) {
    if (!product) return
    await updateShowcaseProduct({
      id: product.id,
      payload: {
        productCode: product.productCode,
        name: product.name,
        description: product.description || undefined,
        categoryId: product.categoryId ?? '',
        images: product.images.map((image) => ({ url: image.url, alt: image.alt })),
        mrp: product.mrp,
        dealerPrice: product.dealerPrice,
        chemistPrice: product.chemistPrice,
        availableStock: product.availableStock,
        stockUnit: product.stockUnit,
        lowStockThreshold: product.lowStockThreshold,
        visibleTo: product.visibleTo,
        isActive,
      },
    }).unwrap()
  }

  return { product, isLoading, error, setActive, isStatusUpdating }
}
