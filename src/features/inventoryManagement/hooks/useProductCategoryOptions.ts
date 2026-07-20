import { useEffect, useState } from 'react'
import { productsService } from '@/features/inventoryManagement/services/productsService'

export function useProductCategoryOptions() {
  const [options, setOptions] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    productsService.getProductCategoryOptions().then((result) => {
      if (!cancelled) setOptions(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return options
}
