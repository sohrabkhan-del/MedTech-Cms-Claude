import { useState } from 'react'
import {
  useGetShowcaseProductsQuery,
  useGetShowcaseProductKpisQuery,
  useMarkEnquiryRespondedMutation,
} from '@/features/marketingProducts/services/showcaseProductsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

/** List + flattened enquiries for the Products Catalog enquiries table. */
export function useShowcaseProducts() {
  const [respondedIds, setRespondedIds] = useState<Set<string>>(new Set())

  const productsResult = useGetShowcaseProductsQuery()
  const kpisResult = useGetShowcaseProductKpisQuery()
  const [markEnquiryRespondedMutation] = useMarkEnquiryRespondedMutation()

  const isLoading = productsResult.isLoading || kpisResult.isLoading
  const error = productsResult.error
    ? getApiErrorMessage(productsResult.error, 'Failed to load showcase products.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load showcase products.')
      : null

  async function markEnquiryResponded(enquiryId: string) {
    await markEnquiryRespondedMutation(enquiryId).unwrap()
    setRespondedIds((prev) => new Set(prev).add(enquiryId))
  }

  const products = productsResult.data ?? []
  const enquiries = products.flatMap((product) =>
    product.enquiries.map((enquiry) => ({
      ...enquiry,
      enquiryStatus: respondedIds.has(enquiry.id) ? ('responded' as const) : enquiry.enquiryStatus,
      product,
    })),
  )

  return {
    products,
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
    enquiries,
    markEnquiryResponded,
  }
}
