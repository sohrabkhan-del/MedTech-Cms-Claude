import {
  mockGifts,
  getGiftById,
  giftCatalogueKpis,
  giftCategoryOptions,
  giftBrandOptions,
  resolveStockStatus,
} from '@/features/schemeManagement/mockGifts'
import type { Gift, GiftFormValues, StockStatus } from '@/features/schemeManagement/types/schemeManagement.types'

// TODO: replace mock-backed implementations with apiClient calls once the
// gift catalogue API is available. create/update/setStatus/deleteGift are
// currently no-ops resolving immediately so the UI/hook contract is stable
// ahead of time.

async function getGifts(): Promise<Gift[]> {
  return Promise.resolve(mockGifts)
}

async function getGiftDetail(id: string): Promise<Gift | undefined> {
  return Promise.resolve(getGiftById(id))
}

async function getGiftCatalogueKpis() {
  return Promise.resolve(giftCatalogueKpis)
}

async function getGiftFormOptions() {
  return Promise.resolve({ giftCategoryOptions, giftBrandOptions })
}

function getStockStatus(gift: Gift): StockStatus {
  return resolveStockStatus(gift)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function createGift(_values: GiftFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function updateGift(_id: string, _values: GiftFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function setGiftStatus(_id: string, _status: Gift['status']): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function deleteGift(_id: string): Promise<void> {
  return Promise.resolve()
}

export const giftsService = {
  getGifts,
  getGiftDetail,
  getGiftCatalogueKpis,
  getGiftFormOptions,
  getStockStatus,
  createGift,
  updateGift,
  setGiftStatus,
  deleteGift,
}
