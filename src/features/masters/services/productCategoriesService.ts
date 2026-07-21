import {
  mockProductCategories,
  getProductCategoryById,
  getParentCategoryName,
  topLevelCategoryOptions,
  productCategoryKpis,
} from '@/features/masters/mockMasters'
import type { ProductCategory, ProductCategoryFormValues } from '@/features/masters/types/masters.types'

// TODO: replace mock-backed implementations with apiClient calls once the
// product categories API is available. create/update are currently no-ops
// resolving immediately so the UI/hook contract is stable ahead of time.

async function getProductCategories(): Promise<ProductCategory[]> {
  return Promise.resolve(mockProductCategories)
}

async function getProductCategoryDetail(id: string): Promise<ProductCategory | undefined> {
  return Promise.resolve(getProductCategoryById(id))
}

async function getProductCategoryKpis() {
  return Promise.resolve(productCategoryKpis)
}

async function getParentCategoryOptions(excludeId?: string) {
  return Promise.resolve(mockProductCategories.filter((category) => category.id !== excludeId))
}

async function getTopLevelCategoryOptions() {
  return Promise.resolve(topLevelCategoryOptions)
}

function resolveParentCategoryName(parentCategoryId?: string): string | undefined {
  return getParentCategoryName(parentCategoryId)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function createProductCategory(_values: ProductCategoryFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function updateProductCategory(_id: string, _values: ProductCategoryFormValues): Promise<void> {
  return Promise.resolve()
}

export const productCategoriesService = {
  getProductCategories,
  getProductCategoryDetail,
  getProductCategoryKpis,
  getParentCategoryOptions,
  getTopLevelCategoryOptions,
  resolveParentCategoryName,
  createProductCategory,
  updateProductCategory,
}
