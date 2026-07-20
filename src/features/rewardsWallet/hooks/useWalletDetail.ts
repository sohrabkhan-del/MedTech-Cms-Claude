import { useEffect, useReducer } from 'react'
import { walletsService } from '@/features/rewardsWallet/services/walletsService'
import type { Wallet } from '@/features/rewardsWallet/types/rewardsWallet.types'

interface State {
  wallet: Wallet | undefined
  balanceOverride: number | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; wallet: Wallet | undefined }
  | { type: 'failed'; error: string }
  | { type: 'balanceChanged'; balance: number }

const initialState: State = { wallet: undefined, balanceOverride: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { wallet: undefined, balanceOverride: null, isLoading: true, error: null }
    case 'succeeded':
      return { wallet: action.wallet, balanceOverride: null, isLoading: false, error: null }
    case 'failed':
      return { wallet: undefined, balanceOverride: null, isLoading: false, error: action.error }
    case 'balanceChanged':
      return { ...state, balanceOverride: action.balance }
  }
}

export function useWalletDetail(walletId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!walletId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    walletsService
      .getWalletDetail(walletId)
      .then((wallet) => {
        if (!cancelled) dispatch({ type: 'succeeded', wallet })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load wallet.' })
      })

    return () => {
      cancelled = true
    }
  }, [walletId])

  async function adjustBalance(type: 'add' | 'deduct', amount: number, currentBalance: number) {
    if (!walletId) return
    await walletsService.adjustBalance(walletId, type, amount)
    const nextBalance = type === 'add' ? currentBalance + amount : Math.max(0, currentBalance - amount)
    dispatch({ type: 'balanceChanged', balance: nextBalance })
  }

  async function exportStatement() {
    if (!walletId) return
    await walletsService.exportWalletStatement(walletId)
  }

  const wallet = state.wallet && state.balanceOverride !== null ? { ...state.wallet, availableBalance: state.balanceOverride } : state.wallet

  return { ...state, wallet, adjustBalance, exportStatement }
}
