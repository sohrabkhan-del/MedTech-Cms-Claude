import { mockWallets, getWalletById, walletKpis, walletGiftCategoryOptions } from '@/features/wallets/mockWallets'
import type { Wallet } from '@/features/rewardsWallet/types/rewardsWallet.types'

// TODO: replace mock-backed implementations with apiClient calls once the
// wallet management API is available. adjustBalance is currently a no-op
// resolving immediately so the UI/hook contract is stable ahead of time.

async function getWallets(): Promise<Wallet[]> {
  return Promise.resolve(mockWallets)
}

async function getWalletDetail(id: string): Promise<Wallet | undefined> {
  return Promise.resolve(getWalletById(id))
}

async function getWalletKpis() {
  return Promise.resolve(walletKpis)
}

async function getWalletFormOptions() {
  return Promise.resolve({ walletGiftCategoryOptions })
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
