import { useEffect, useReducer, useState } from 'react'
import { giftRulesService } from '@/features/schemeManagement/services/giftRulesService'
import type { RewardRule, GiftRuleFormValues } from '@/features/schemeManagement/types/schemeManagement.types'

interface FormOptions {
  rewardTrackOptions: string[]
  ruleTypeOptions: string[]
  schemeNameOptions: string[]
}

interface LoadState {
  rule: RewardRule | undefined
  options: FormOptions | null
  isLoading: boolean
  loadError: string | null
}

type LoadAction =
  | { type: 'loading' }
  | { type: 'succeeded'; rule: RewardRule | undefined; options: FormOptions }
  | { type: 'failed'; error: string }

const initialLoadState: LoadState = { rule: undefined, options: null, isLoading: false, loadError: null }

function loadReducer(state: LoadState, action: LoadAction): LoadState {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, loadError: null }
    case 'succeeded':
      return { ...action, isLoading: false, loadError: null }
    case 'failed':
      return { ...state, isLoading: false, loadError: action.error }
  }
}

export function useGiftRuleForm(ruleId: string | undefined) {
  const isEdit = !!ruleId
  const [loadState, dispatch] = useReducer(loadReducer, initialLoadState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      ruleId ? giftRulesService.getRewardRuleDetail(ruleId) : Promise.resolve(undefined),
      giftRulesService.getGiftRuleFormOptions(),
    ])
      .then(([rule, options]) => {
        if (!cancelled) dispatch({ type: 'succeeded', rule, options })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load reward rule form data.' })
      })

    return () => {
      cancelled = true
    }
  }, [ruleId])

  async function submit(values: GiftRuleFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && ruleId) {
        await giftRulesService.updateRewardRule(ruleId, values)
      } else {
        await giftRulesService.createRewardRule(values)
      }
      return true
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save reward rule.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isEdit, ...loadState, isSubmitting, error: loadState.loadError ?? submitError, submit }
}
