import { useEffect, useState } from 'react'
import { giftsService } from '@/features/schemeManagement/services/giftsService'

interface FormOptions {
  giftCategoryOptions: string[]
  giftBrandOptions: string[]
}

const emptyOptions: FormOptions = { giftCategoryOptions: [], giftBrandOptions: [] }

/** Shared static option lists for gift filters/forms (not just the form page). */
export function useGiftFormOptions() {
  const [options, setOptions] = useState<FormOptions>(emptyOptions)

  useEffect(() => {
    let cancelled = false
    giftsService.getGiftFormOptions().then((result) => {
      if (!cancelled) setOptions(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return options
}
