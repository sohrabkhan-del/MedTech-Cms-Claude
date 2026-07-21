import { useEffect, useReducer, useState } from 'react'
import { showcaseProductsService } from '@/features/marketingProducts/services/showcaseProductsService'
import type { ShowcaseProduct } from '@/features/marketingProducts/types/marketingProducts.types'
import type { showcaseProductKpis } from '@/features/marketingProducts/mockShowcaseProducts'

type ShowcaseProductKpis = typeof showcaseProductKpis

interface State {
  products: ShowcaseProduct[]
  kpis: ShowcaseProductKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; products: ShowcaseProduct[]; kpis: ShowcaseProductKpis }
  | { type: 'failed'; error: string }

const initialState: State = { products: [], kpis: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { products: action.products, kpis: action.kpis, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

/** List + flattened enquiries for the Products Catalog enquiries table. */
export function useShowcaseProducts() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [respondedIds, setRespondedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([showcaseProductsService.getShowcaseProducts(), showcaseProductsService.getShowcaseProductKpis()])
      .then(([products, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', products, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load showcase products.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function markEnquiryResponded(enquiryId: string) {
    await showcaseProductsService.markEnquiryResponded(enquiryId)
    setRespondedIds((prev) => new Set(prev).add(enquiryId))
  }

  const enquiries = state.products.flatMap((product) =>
    product.enquiries.map((enquiry) => ({
      ...enquiry,
      enquiryStatus: respondedIds.has(enquiry.id) ? ('responded' as const) : enquiry.enquiryStatus,
      product,
    })),
  )

  return { ...state, enquiries, markEnquiryResponded }
}
