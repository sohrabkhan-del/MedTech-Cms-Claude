import { useEffect, useReducer } from 'react'
import { coinRulesService, type RegionMultiplierMap, type RegionDateMap } from '@/features/rewardsWallet/services/coinRulesService'
import type { CoinValueRule } from '@/features/rewardsWallet/types/rewardsWallet.types'
import type { coinRuleKpis, coinDistributionByCategory } from '@/features/wallets/mockCoinRules'

type CoinRuleKpis = typeof coinRuleKpis
type CoinDistributionByCategory = typeof coinDistributionByCategory

interface State {
  rules: CoinValueRule[]
  kpis: CoinRuleKpis | null
  distributionByCategory: CoinDistributionByCategory
  regionMultipliers: RegionMultiplierMap | null
  multiplierDates: RegionDateMap | null
  baseValueOverrides: Record<string, number>
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | {
      type: 'succeeded'
      rules: CoinValueRule[]
      kpis: CoinRuleKpis
      distributionByCategory: CoinDistributionByCategory
      regionMultipliers: RegionMultiplierMap
      multiplierDates: RegionDateMap
    }
  | { type: 'failed'; error: string }
  | { type: 'regionMultiplierChanged'; regionMultipliers: RegionMultiplierMap; multiplierDates: RegionDateMap }
  | { type: 'baseValueChanged'; ruleId: string; value: number }

const initialState: State = {
  rules: [],
  kpis: null,
  distributionByCategory: [],
  regionMultipliers: null,
  multiplierDates: null,
  baseValueOverrides: {},
  isLoading: false,
  error: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return {
        rules: action.rules,
        kpis: action.kpis,
        distributionByCategory: action.distributionByCategory,
        regionMultipliers: action.regionMultipliers,
        multiplierDates: action.multiplierDates,
        baseValueOverrides: {},
        isLoading: false,
        error: null,
      }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
    case 'regionMultiplierChanged':
      return { ...state, regionMultipliers: action.regionMultipliers, multiplierDates: action.multiplierDates }
    case 'baseValueChanged':
      return { ...state, baseValueOverrides: { ...state.baseValueOverrides, [action.ruleId]: action.value } }
  }
}

export function useCoinRules() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      coinRulesService.getCoinRules(),
      coinRulesService.getCoinRuleKpis(),
      coinRulesService.getCoinDistributionByCategory(),
      coinRulesService.getRegionMultipliers(),
      coinRulesService.getRegionMultiplierDates(),
    ])
      .then(([rules, kpis, distributionByCategory, regionMultipliers, multiplierDates]) => {
        if (!cancelled) dispatch({ type: 'succeeded', rules, kpis, distributionByCategory, regionMultipliers, multiplierDates })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load coin value rules.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function setRegionMultiplier(region: keyof RegionMultiplierMap, value: number) {
    if (!state.regionMultipliers || !state.multiplierDates) return
    const changeDate = coinRulesService.getChangeDate()
    const nextMultipliers = { ...state.regionMultipliers, [region]: value }
    const nextDates = { ...state.multiplierDates, [region]: changeDate }
    await Promise.all([coinRulesService.saveRegionMultipliers(nextMultipliers), coinRulesService.saveRegionMultiplierDates(nextDates)])
    dispatch({ type: 'regionMultiplierChanged', regionMultipliers: nextMultipliers, multiplierDates: nextDates })
  }

  function setBaseValueOverride(ruleId: string, value: number) {
    dispatch({ type: 'baseValueChanged', ruleId, value })
  }

  return { ...state, setRegionMultiplier, setBaseValueOverride }
}
