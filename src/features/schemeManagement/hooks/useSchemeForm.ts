import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useToast } from '@/contexts/ToastContext'
import {
  useGetSchemeDetailQuery,
  useGetSchemeFormOptionsQuery,
  useCreateSchemeMutation,
  useUpdateSchemeMutation,
} from '@/features/schemeManagement/services/schemesApi'
import { useGetGiftsQuery } from '@/features/schemeManagement/services/giftsApi'
import { useGetProductsQuery } from '@/features/inventoryManagement/services/productsApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import type { SchemeFormValues } from '@/features/schemeManagement/types/schemeManagement.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const ALL_INDIA_REGION = 'All India'

export function useSchemeForm(
  schemeId: string | undefined,
  cloneFromId: string | null,
  productSearch?: string,
) {
  const isEdit = !!schemeId
  const toast = useToast()
  const { region, regionId: topbarRegionId, dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const effectiveRegionId =
    region === ALL_INDIA_REGION ? undefined : (topbarRegionId ?? undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const schemeResult = useGetSchemeDetailQuery(schemeId ?? skipToken)
  const cloneSourceResult = useGetSchemeDetailQuery(!schemeId && cloneFromId ? cloneFromId : skipToken)
  const optionsResult = useGetSchemeFormOptionsQuery()
  const giftsResult = useGetGiftsQuery({
    ...analyticsParams,
    page: 1,
    limit: 10,
    regionId: effectiveRegionId,
    sortBy: 'name',
    sortOrder: 'desc',
  })
  const productsResult = useGetProductsQuery({
    page: 1,
    limit: 10,
    search: productSearch || undefined,
    sortOrder: 'desc',
  })
  const [createScheme] = useCreateSchemeMutation()
  const [updateScheme] = useUpdateSchemeMutation()

  const isLoading =
    (isEdit && schemeResult.isLoading) ||
    (!isEdit && !!cloneFromId && cloneSourceResult.isLoading) ||
    optionsResult.isLoading ||
    giftsResult.isLoading ||
    productsResult.isLoading
  const loadError = schemeResult.error
    ? getApiErrorMessage(schemeResult.error, 'Failed to load scheme form data.')
    : cloneSourceResult.error
      ? getApiErrorMessage(cloneSourceResult.error, 'Failed to load scheme form data.')
      : optionsResult.error
        ? getApiErrorMessage(optionsResult.error, 'Failed to load scheme form data.')
        : giftsResult.error
          ? getApiErrorMessage(giftsResult.error, 'Failed to load gift products.')
          : productsResult.error
            ? getApiErrorMessage(productsResult.error, 'Failed to load applicable products.')
            : null
  const options = optionsResult.data
    ? {
        ...optionsResult.data,
        giftProductOptions: (giftsResult.data ?? []).map((gift) => ({
          id: gift.id,
          name: gift.giftName,
          image: gift.giftImage,
          price: gift.price,
          dealerBasePoints: gift.dealerBasePoints,
          chemistBasePoints: gift.chemistBasePoints,
        })),
        masterProductOptions: (productsResult.data?.items ?? []).map((product) => ({
          id: product.id,
          name: product.productName || product.productCode || product.id,
          code: product.productCode,
          category: product.productCategory,
          dealerRewardPoints: product.dealerRewardPoints,
          chemistRewardPoints: product.chemistRewardPoints,
        })),
      }
    : null

  async function submit(values: SchemeFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && schemeId) {
        await updateScheme({ id: schemeId, values }).unwrap()
      } else {
        await createScheme(values).unwrap()
      }
      toast.success(isEdit ? 'Scheme updated successfully.' : 'Scheme created successfully.')
      return true
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to save scheme.')
      setSubmitError(message)
      toast.error(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isEdit,
    scheme: schemeResult.data,
    cloneSource: cloneSourceResult.data,
    options,
    isLoading,
    isSubmitting,
    error: loadError ?? submitError,
    submit,
  }
}
