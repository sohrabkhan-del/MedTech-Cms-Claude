import { useGetGiftFormOptionsQuery } from '@/features/schemeManagement/services/giftsApi'

interface FormOptions {
  giftCategoryOptions: string[]
  giftBrandOptions: string[]
  giftEligibilityOptions: string[]
}

const emptyOptions: FormOptions = { giftCategoryOptions: [], giftBrandOptions: [], giftEligibilityOptions: [] }

/** Shared static option lists for gift filters/forms (not just the form page). */
export function useGiftFormOptions() {
  const { data } = useGetGiftFormOptionsQuery()
  return data ?? emptyOptions
}
