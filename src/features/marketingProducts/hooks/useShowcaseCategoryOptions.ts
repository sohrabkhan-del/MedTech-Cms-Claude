import { useGetShowcaseCategoryOptionsQuery } from '@/features/marketingProducts/services/showcaseProductsApi'

export function useShowcaseCategoryOptions() {
  const { data } = useGetShowcaseCategoryOptionsQuery()
  return data ?? []
}
