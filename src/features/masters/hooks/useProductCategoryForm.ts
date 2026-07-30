import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useToast } from '@/contexts/ToastContext'
import {
  useGetProductCategoryDetailQuery,
  useGetParentCategoryOptionsQuery,
  useCreateProductCategoryMutation,
  useUpdateProductCategoryMutation,
} from '@/features/masters/services/productCategoriesApi'
import type { ProductCategory, ProductCategoryFormValues } from '@/features/masters/types/masters.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

interface FormOptions {
  parentCategoryOptions: ProductCategory[]
}

export function useProductCategoryForm(categoryId: string | undefined) {
  const isEdit = !!categoryId
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const categoryResult = useGetProductCategoryDetailQuery(categoryId ?? skipToken)
  const parentOptionsResult = useGetParentCategoryOptionsQuery(categoryId)
  const [createProductCategory] = useCreateProductCategoryMutation()
  const [updateProductCategory] = useUpdateProductCategoryMutation()

  const isLoading = (isEdit && categoryResult.isLoading) || parentOptionsResult.isLoading
  const loadError = categoryResult.error
    ? getApiErrorMessage(categoryResult.error, 'Failed to load product category form data.')
    : parentOptionsResult.error
      ? getApiErrorMessage(parentOptionsResult.error, 'Failed to load product category form data.')
      : null

  const options: FormOptions | null = parentOptionsResult.data
    ? { parentCategoryOptions: parentOptionsResult.data }
    : null

  async function submit(values: ProductCategoryFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && categoryId) {
        await updateProductCategory({ id: categoryId, values }).unwrap()
      } else {
        await createProductCategory(values).unwrap()
      }
      toast.success(isEdit ? 'Category updated successfully.' : 'Category created successfully.')
      return true
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to save product category.')
      setSubmitError(message)
      toast.error(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isEdit,
    category: categoryResult.data,
    options,
    isLoading,
    isSubmitting,
    error: loadError ?? submitError,
    submit,
  }
}
