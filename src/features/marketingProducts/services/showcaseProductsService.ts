import {
  mockShowcaseProducts,
  getShowcaseProductById,
  showcaseProductKpis,
  showcaseCategoryOptions,
} from '@/features/marketing/mockShowcaseProducts'
import type { ShowcaseProduct, ShowcaseProductFormValues } from '@/features/marketingProducts/types/marketingProducts.types'

// TODO: replace mock-backed implementations with apiClient calls once the
// showcase products API is available. create/update/markEnquiryResponded are
// currently no-ops resolving immediately so the UI/hook contract is stable
// ahead of time.

async function getShowcaseProducts(): Promise<ShowcaseProduct[]> {
  return Promise.resolve(mockShowcaseProducts)
}

async function getShowcaseProductDetail(id: string): Promise<ShowcaseProduct | undefined> {
  return Promise.resolve(getShowcaseProductById(id))
}

async function getShowcaseProductKpis() {
  return Promise.resolve(showcaseProductKpis)
}

async function getShowcaseCategoryOptions(): Promise<string[]> {
  return Promise.resolve(showcaseCategoryOptions)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function createShowcaseProduct(_values: ShowcaseProductFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function updateShowcaseProduct(_id: string, _values: ShowcaseProductFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function markEnquiryResponded(_enquiryId: string): Promise<void> {
  return Promise.resolve()
}

export const showcaseProductsService = {
  getShowcaseProducts,
  getShowcaseProductDetail,
  getShowcaseProductKpis,
  getShowcaseCategoryOptions,
  createShowcaseProduct,
  updateShowcaseProduct,
  markEnquiryResponded,
}
