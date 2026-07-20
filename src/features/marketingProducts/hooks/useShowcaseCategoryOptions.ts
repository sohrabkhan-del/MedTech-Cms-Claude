import { useEffect, useState } from 'react'
import { showcaseProductsService } from '@/features/marketingProducts/services/showcaseProductsService'

export function useShowcaseCategoryOptions() {
  const [options, setOptions] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    showcaseProductsService.getShowcaseCategoryOptions().then((result) => {
      if (!cancelled) setOptions(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return options
}
