import { useEffect, useState } from 'react'
import { schemesService } from '@/features/schemeManagement/services/schemesService'

interface FormOptions {
  schemeTypeOptions: string[]
  schemeApplicableUserOptions: string[]
  rewardTypeOptions: string[]
  rewardFrequencyOptions: string[]
  festivalOptions: string[]
  productCategoryOptions: string[]
}

const emptyOptions: FormOptions = {
  schemeTypeOptions: [],
  schemeApplicableUserOptions: [],
  rewardTypeOptions: [],
  rewardFrequencyOptions: [],
  festivalOptions: [],
  productCategoryOptions: [],
}

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
