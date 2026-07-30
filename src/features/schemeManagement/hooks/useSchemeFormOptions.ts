import { useGetSchemeFormOptionsQuery } from '@/features/schemeManagement/services/schemesApi'
import type { PartnerZone } from '@/types/partner'
import type { SchemePartnerType } from '@/features/schemeManagement/types/schemeManagement.types'

export interface SchemeGiftProductOption {
  id: string
  name: string
  image: string
  price: number
  dealerBasePoints: number | null
  chemistBasePoints: number | null
}

export interface SchemeMasterProductOption {
  id: string
  name: string
  code: string
  category: string
  dealerRewardPoints: number
  chemistRewardPoints: number
}

interface FormOptions {
  regionOptions: PartnerZone[]
  partnerTypeOptions: SchemePartnerType[]
  giftProductOptions: SchemeGiftProductOption[]
  masterProductOptions: SchemeMasterProductOption[]
}

const emptyOptions: FormOptions = {
  regionOptions: [],
  partnerTypeOptions: [],
  giftProductOptions: [],
  masterProductOptions: [],
}

/** Shared static option lists for scheme filters/forms (not just the form page). */
export function useSchemeFormOptions() {
  const { data } = useGetSchemeFormOptionsQuery()
  return data ?? emptyOptions
}
