import { mockProducts, getProductById, productKpis, productCategoryOptions } from '@/features/inventory/mockProducts'
import type { Product, ProductFormValues } from '@/features/inventoryManagement/types/inventoryManagement.types'

// TODO: replace mock-backed implementations with apiClient calls once the
// product master API is available. create/update are currently no-ops
// resolving immediately so the UI/hook contract is stable ahead of time.

async function getProducts(): Promise<Product[]> {
  return Promise.resolve(mockProducts)
}

async function getProductDetail(id: string): Promise<Product | undefined> {
  return Promise.resolve(getProductById(id))
}

async function getProductKpis() {
  return Promise.resolve(productKpis)
}

async function getProductCategoryOptions() {
  return Promise.resolve(productCategoryOptions)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function createProduct(_values: ProductFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function updateProduct(_id: string, _values: ProductFormValues): Promise<void> {
  return Promise.resolve()
}

export const productsService = {
  getProducts,
  getProductDetail,
  getProductKpis,
  getProductCategoryOptions,
  createProduct,
  updateProduct,
}
