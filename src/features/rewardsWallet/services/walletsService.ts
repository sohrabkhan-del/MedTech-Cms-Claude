import { mockWallets, getWalletById, walletKpis, walletGiftCategoryOptions } from '@/features/rewardsWallet/mockWallets'
import type { Wallet } from '@/features/rewardsWallet/types/rewardsWallet.types'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// wallet management API is available. adjustBalance is currently a no-op
// resolving immediately so the UI/hook contract is stable ahead of time.

async function getWallets(): Promise<Wallet[]> {
  return mockDelay(mockWallets)
}

async function getWalletDetail(id: string): Promise<Wallet | undefined> {
  return mockDelay(getWalletById(id))
}

async function getWalletKpis() {
  return mockDelay(walletKpis)
}

async function getWalletFormOptions() {
  return mockDelay({ walletGiftCategoryOptions })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function adjustBalance(_id: string, _type: 'add' | 'deduct', _amount: number, _reason?: string): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function exportWalletStatement(_id: string): Promise<void> {
  return Promise.resolve()
}

export const walletsService = {
  getWallets,
  getWalletDetail,
  getWalletKpis,
  getWalletFormOptions,
  adjustBalance,
  exportWalletStatement,
}
