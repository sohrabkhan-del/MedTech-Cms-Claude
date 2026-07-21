import { useEffect, useReducer } from 'react'
import { walletsService } from '@/features/rewardsWallet/services/walletsService'
import type { Wallet } from '@/features/rewardsWallet/types/rewardsWallet.types'
import type { walletKpis } from '@/features/rewardsWallet/mockWallets'

type WalletKpis = typeof walletKpis

interface State {
  wallets: Wallet[]
  kpis: WalletKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; wallets: Wallet[]; kpis: WalletKpis }
  | { type: 'failed'; error: string }

const initialState: State = { wallets: [], kpis: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { wallets: action.wallets, kpis: action.kpis, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useWallets() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([walletsService.getWallets(), walletsService.getWalletKpis()])
      .then(([wallets, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', wallets, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load wallets.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
