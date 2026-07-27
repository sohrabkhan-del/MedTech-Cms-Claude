import { useEffect, useState } from 'react'
import { schemesService } from '@/features/schemeManagement/services/schemesService'
import type { PartnerZone } from '@/types/partner'
import type { SchemePartnerType } from '@/features/schemeManagement/types/schemeManagement.types'

export interface SchemeGiftProductOption {
  id: string
  name: string
  image: string
}

interface FormOptions {
  regionOptions: PartnerZone[]
  partnerTypeOptions: SchemePartnerType[]
  giftProductOptions: SchemeGiftProductOption[]
}

const emptyOptions: FormOptions = { regionOptions: [], partnerTypeOptions: [], giftProductOptions: [] }

/** Shared static option lists for scheme filters/forms (not just the form page). */
export function useSchemeFormOptions() {
  const [options, setOptions] = useState<FormOptions>(emptyOptions)

  useEffect(() => {
    let cancelled = false
    schemesService.getSchemeFormOptions().then((result) => {
      if (!cancelled) setOptions(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return options
}
