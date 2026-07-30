import { useEffect, useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import {
  useGetWalletDetailQuery,
  useAdjustBalanceMutation,
  useExportWalletStatementMutation,
} from '@/features/rewardsWallet/services/walletsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useWalletDetail(walletId: string | undefined) {
  const [balanceOverride, setBalanceOverride] = useState<number | null>(null)
  const { data: wallet, isLoading, error: queryError } = useGetWalletDetailQuery(walletId ?? skipToken)

  useEffect(() => {
    setBalanceOverride(null)
  }, [walletId])
  const [adjustBalanceMutation] = useAdjustBalanceMutation()
  const [exportWalletStatementMutation] = useExportWalletStatementMutation()

  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load wallet.') : null

  async function adjustBalance(type: 'add' | 'deduct', amount: number, currentBalance: number) {
    if (!walletId) return
    await adjustBalanceMutation({ id: walletId, type, amount }).unwrap()
    const nextBalance = type === 'add' ? currentBalance + amount : Math.max(0, currentBalance - amount)
    setBalanceOverride(nextBalance)
  }

  async function exportStatement() {
    if (!walletId) return
    await exportWalletStatementMutation(walletId).unwrap()
  }

  const resolvedWallet = wallet && balanceOverride !== null ? { ...wallet, availableBalance: balanceOverride } : wallet

  return {
    wallet: resolvedWallet,
    balanceOverride,
    isLoading,
    error,
    adjustBalance,
    exportStatement,
  }
}
