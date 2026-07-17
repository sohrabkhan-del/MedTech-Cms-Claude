import type { Gift, GiftDeliveryStatus, GiftInventoryEntry, GiftRedemptionEntry, GiftUserType, StockStatus } from '@/types/gift'
import { mockDealers } from '@/features/dealers/mockDealers'
import { mockChemists } from '@/features/chemists/mockChemists'
import { mrs } from '@/features/partners/mockPartnerData'

export const giftCategoryOptions = ['Electronics', 'Home Appliances', 'Kitchenware', 'Travel', 'Apparel', 'Vouchers']
export const giftBrandOptions = ['Prestige', 'Philips', 'Samsung', 'Milton', 'Amazon', 'Bata']

const giftNames = ['Smart Watch', 'Electric Kettle', 'Bluetooth Speaker', 'Insulated Bottle', 'Travel Backpack', 'Gift Voucher ₹500', 'Non-Stick Cookware Set', 'Wireless Earbuds']

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

function dateFromSeed(seed: number, month = 'Jul'): string {
  const day = (seed % 27) + 1
  return `${pad(day)} ${month} 2026`
}

function buildRedemptionHistory(seed: number, giftId: string): GiftRedemptionEntry[] {
  const count = seededNumber(seed, 2, 6)
  const deliveryStatuses: GiftDeliveryStatus[] = ['pending', 'packed', 'shipped', 'delivered', 'delivered', 'cancelled']
  return Array.from({ length: count }).map((_, i) => {
    const localSeed = seed * 11 + i
    const userType: GiftUserType = localSeed % 2 === 0 ? 'Dealer' : 'Chemist'
    const partner = userType === 'Dealer' ? mockDealers[localSeed % mockDealers.length]! : mockChemists[localSeed % mockChemists.length]!
    return {
      id: `${giftId}-redeem-${i}`,
      userName: partner.shopName,
      userType,
      coinsUsed: seededNumber(localSeed, 100, 2000),
      redemptionDate: dateFromSeed(localSeed, 'Jul'),
      deliveryStatus: deliveryStatuses[localSeed % deliveryStatuses.length]!,
    }
  })
}

function buildInventoryHistory(seed: number, giftId: string, finalStock: number): GiftInventoryEntry[] {
  const reviewer = mrs[seed % mrs.length]!
  return [
    { id: `${giftId}-inv-0`, date: dateFromSeed(seed, 'Jun'), stockAdded: finalStock + 20, stockRemoved: 0, currentStock: finalStock + 20, updatedBy: reviewer },
    { id: `${giftId}-inv-1`, date: dateFromSeed(seed + 3, 'Jun'), stockAdded: 0, stockRemoved: 20, currentStock: finalStock, updatedBy: reviewer },
  ]
}

function buildGift(seed: number): Gift {
  const id = `gift-${seed}`
  const name = giftNames[seed % giftNames.length]!
  const availableQuantity = seed % 8 === 0 ? 0 : seededNumber(seed, 5, 200)
  const redeemedQuantity = seededNumber(seed, 10, 300)

  return {
    id,
    giftCode: `GC-${20260000 + seed * 13}`,
    giftName: name,
    category: giftCategoryOptions[seed % giftCategoryOptions.length]!,
    brand: giftBrandOptions[seed % giftBrandOptions.length]!,
    giftImage: `https://picsum.photos/seed/medtech-gift-${seed}/600/600`,
    description: `${name} is a redeemable reward available in the MedTech Rewards Marketplace for eligible Dealers and Chemists.`,
    sku: `SKU-GIFT-${100000 + seed * 7}`,
    requiredCoins: seededNumber(seed, 200, 5000),
    availableQuantity,
    redeemedQuantity,
    status: seed % 9 === 0 ? 'inactive' : 'active',

    redemptionHistory: buildRedemptionHistory(seed, id),
    inventoryHistory: buildInventoryHistory(seed, id, availableQuantity),
  }
}

export const mockGifts: Gift[] = Array.from({ length: 26 }).map((_, index) => buildGift(index + 1))

export function getGiftById(id: string): Gift | undefined {
  return mockGifts.find((gift) => gift.id === id)
}

export function resolveStockStatus(gift: Gift): StockStatus {
  if (gift.availableQuantity === 0) return 'out_of_stock'
  if (gift.availableQuantity < 15) return 'low_stock'
  return 'in_stock'
}

export const giftCatalogueKpis = {
  totalGifts: mockGifts.length,
  availableStock: mockGifts.reduce((sum, g) => sum + g.availableQuantity, 0),
  outOfStock: mockGifts.filter((g) => g.availableQuantity === 0).length,
  totalRedemptions: mockGifts.reduce((sum, g) => sum + g.redeemedQuantity, 0),
}
