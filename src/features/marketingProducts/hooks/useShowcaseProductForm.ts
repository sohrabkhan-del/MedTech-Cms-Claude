import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useToast } from '@/contexts/ToastContext'
import {
  useGetShowcaseProductDetailQuery,
  useCreateShowcaseProductMutation,
  useUpdateShowcaseProductMutation,
} from '@/features/marketingProducts/services/showcaseProductsApi'
import {
  toShowcaseProductApiPayload,
  type ShowcaseProductFormValues,
} from '@/features/marketingProducts/showcaseProductFormSchema'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useShowcaseProductForm(productId: string | undefined) {
  const isEdit = !!productId
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const productResult = useGetShowcaseProductDetailQuery(productId ?? skipToken)
  const [createShowcaseProduct] = useCreateShowcaseProductMutation()
  const [updateShowcaseProduct] = useUpdateShowcaseProductMutation()

  const isLoading = isEdit && productResult.isLoading
  const loadError = productResult.error
    ? getApiErrorMessage(productResult.error, 'Failed to load product form data.')
    : null

  async function submit(values: ShowcaseProductFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const payload = toShowcaseProductApiPayload(values, isEdit)
      if (isEdit && productId) {
        await updateShowcaseProduct({ id: productId, payload }).unwrap()
      } else {
        await createShowcaseProduct(payload).unwrap()
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
    isLoading,
    isSubmitting,
    error: loadError ?? submitError,
    submit,
  }
}
