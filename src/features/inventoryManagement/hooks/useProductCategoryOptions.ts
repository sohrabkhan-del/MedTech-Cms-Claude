import { useGetProductCategoryOptionsQuery } from '@/features/inventoryManagement/services/productsApi'

export function useProductCategoryOptions() {
  const { data } = useGetProductCategoryOptionsQuery()
  return data ?? []
}
