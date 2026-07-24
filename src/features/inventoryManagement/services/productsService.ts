import { mockProducts, getProductById, productKpis, productCategoryOptions, productFromImportedRow } from '@/features/inventoryManagement/mockProducts'
import type { Product, ProductFormValues } from '@/features/inventoryManagement/types/inventoryManagement.types'
import type { ParsedImportFile } from '@/components/common/CommonTable/tableCsv'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// product master API is available. create/update are currently no-ops
// resolving immediately so the UI/hook contract is stable ahead of time.

async function getProducts(): Promise<Product[]> {
  return mockDelay(mockProducts)
}

async function getProductDetail(id: string): Promise<Product | undefined> {
  return mockDelay(getProductById(id))
}

async function getProductKpis() {
  return mockDelay(productKpis)
}

async function getProductCategoryOptions() {
  return mockDelay(productCategoryOptions)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function createProduct(_values: ProductFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function updateProduct(_id: string, _values: ProductFormValues): Promise<void> {
  return Promise.resolve()
}

// Maps parsed xlsx rows onto Product records for the mock store. Real imports
// will need a backend endpoint that validates/maps columns server-side.
async function importProducts(parsed: ParsedImportFile): Promise<Product[]> {
  return mockDelay(parsed.rows.map((row, i) => productFromImportedRow(row, mockProducts.length + i + 1)))
}

export const productsService = {
  getProducts,
  getProductDetail,
  getProductKpis,
  getProductCategoryOptions,
  createProduct,
  updateProduct,
  importProducts,
}
