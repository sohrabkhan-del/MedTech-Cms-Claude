import {
  useGetFactoryProductionUploadRowsQuery,
  type FactoryProductionUploadRowsQueryParams,
} from '@/features/inventoryManagement/services/factoryProductionUploadApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

/** Backs the Active Product Registry Directory listing page — GET /products/upload-rows
 *  with server-side pagination, search, sort, and date-range filtering. */
export function useFactoryProductionUploadRowsList(
  params: FactoryProductionUploadRowsQueryParams,
) {
  const { data, isFetching, error: queryError } = useGetFactoryProductionUploadRowsQuery(params)

  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load upload rows.') : null

  return {
    rows: data?.items ?? [],
    totalItems: data?.totalItems ?? 0,
    isLoading: isFetching,
    error,
  }
}
