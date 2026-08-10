import { useCallback, useState } from 'react'
import {
  useGetProductsQuery,
  useGetProductKpisQuery,
  useImportProductsMutation,
} from '@/features/inventoryManagement/services/productsApi'
import type { Product } from '@/features/inventoryManagement/types/inventoryManagement.types'
import type { productKpis } from '@/features/inventoryManagement/mockProducts'
import type { ParsedImportFile } from '@/components/common/CommonTable/tableCsv'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import type { ProductQueryParams } from '@/features/inventoryManagement/services/productsApi'

type ProductKpis = typeof productKpis

export function useProducts(params?: ProductQueryParams) {
  const productsResult = useGetProductsQuery(params)
  const kpisResult = useGetProductKpisQuery()
  const [importProductsMutation] = useImportProductsMutation()

  // Imported rows aren't persisted server-side (see productsApi importProducts), so
  // they're layered on top of the query results locally, same as the pre-RTK-Query hook.
  const [importedProducts, setImportedProducts] = useState<Product[]>([])
  const [importedKpiDelta, setImportedKpiDelta] = useState(0)

  const isLoading = productsResult.isLoading || kpisResult.isLoading
  const error = productsResult.error
    ? getApiErrorMessage(productsResult.error, 'Failed to load products.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load products.')
      : null

  const products = [...importedProducts, ...(productsResult.data ?? [])]
  const baseKpis = kpisResult.data
  const kpis: ProductKpis | null = baseKpis
    ? {
        ...baseKpis,
        totalProducts: baseKpis.totalProducts + importedKpiDelta,
        activeProducts: baseKpis.activeProducts + importedKpiDelta,
      }
    : null

  const importProducts = useCallback(
    async (parsed: ParsedImportFile) => {
      const imported = await importProductsMutation(parsed).unwrap()
      setImportedProducts((prev) => [...imported, ...prev])
      setImportedKpiDelta((prev) => prev + imported.length)
    },
    [importProductsMutation],
  )

  return { products, kpis, isLoading, error, importProducts }
}
