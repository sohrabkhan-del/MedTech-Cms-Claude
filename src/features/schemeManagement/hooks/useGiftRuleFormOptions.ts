import { useEffect, useState } from 'react'
import { giftRulesService } from '@/features/schemeManagement/services/giftRulesService'

interface FormOptions {
  rewardTrackOptions: string[]
  ruleTypeOptions: string[]
  schemeNameOptions: string[]
}

const emptyOptions: FormOptions = { rewardTrackOptions: [], ruleTypeOptions: [], schemeNameOptions: [] }

/** Shared static option lists for gift rule filters/forms (not just the form page). */
export function useGiftRuleFormOptions() {
  const [options, setOptions] = useState<FormOptions>(emptyOptions)

  useEffect(() => {
    let cancelled = false
    giftRulesService.getGiftRuleFormOptions().then((result) => {
      if (!cancelled) setOptions(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return options
}
