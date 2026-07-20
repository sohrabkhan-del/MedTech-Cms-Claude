import { useEffect, useState } from 'react'
import { redemptionsService } from '@/features/rewardsWallet/services/redemptionsService'

interface FormOptions {
  rewardCategoryOptions: string[]
}

const emptyOptions: FormOptions = { rewardCategoryOptions: [] }

/** Shared static option list for the redemption request filter drawer. */
export function useRedemptionFormOptions() {
  const [options, setOptions] = useState<FormOptions>(emptyOptions)

  useEffect(() => {
    let cancelled = false
    redemptionsService.getRedemptionFormOptions().then((result) => {
      if (!cancelled) setOptions(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return options
}
