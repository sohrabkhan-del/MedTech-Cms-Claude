import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useToast } from '@/contexts/ToastContext'
import {
  useGetProductDetailQuery,
  useGetProductCategoryOptionsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} from '@/features/inventoryManagement/services/productsApi'
import type { ProductFormValues } from '@/features/inventoryManagement/types/inventoryManagement.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useProductForm(productId: string | undefined, cloneFromId: string | null) {
  const isEdit = !!productId
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const productResult = useGetProductDetailQuery(productId ?? skipToken)
  const cloneSourceResult = useGetProductDetailQuery(!productId && cloneFromId ? cloneFromId : skipToken)
  const categoryOptionsResult = useGetProductCategoryOptionsQuery()
  const [createProduct] = useCreateProductMutation()
  const [updateProduct] = useUpdateProductMutation()

  const isLoading =
    (isEdit && productResult.isLoading) ||
    (!isEdit && !!cloneFromId && cloneSourceResult.isLoading) ||
    categoryOptionsResult.isLoading

  const loadError = productResult.error
    ? getApiErrorMessage(productResult.error, 'Failed to load product form data.')
    : cloneSourceResult.error
      ? getApiErrorMessage(cloneSourceResult.error, 'Failed to load product form data.')
      : categoryOptionsResult.error
        ? getApiErrorMessage(categoryOptionsResult.error, 'Failed to load product form data.')
        : null

  async function submit(values: ProductFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && productId) {
        await updateProduct({ id: productId, values }).unwrap()
      } else {
        await createProduct(values).unwrap()
      }
      toast.success(isEdit ? 'Product updated successfully.' : 'Product created successfully.')
      return true
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to save product.')
      setSubmitError(message)
      toast.error(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isEdit,
    product: productResult.data,
    cloneSource: cloneSourceResult.data,
    categoryOptions: categoryOptionsResult.data ?? [],
    isLoading,
    loadError,
    isSubmitting,
    error: loadError ?? submitError,
    submit,
  }
}
