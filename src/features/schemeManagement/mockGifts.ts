import type { Gift, GiftDeliveryStatus, GiftEligibility, GiftInventoryEntry, GiftRedemptionEntry, GiftUserType, StockStatus } from '@/types/gift'
import { mockDealers } from '@/features/userManagement/mockDealers'
import { mockChemists } from '@/features/userManagement/mockChemists'
import { mrs } from '@/features/userManagement/mockPartnerData'

export const giftCategoryOptions = ['Electronics', 'Home Appliances', 'Kitchenware', 'Travel', 'Apparel', 'Vouchers']
export const giftBrandOptions = ['Prestige', 'Philips', 'Samsung', 'Milton', 'Amazon', 'Bata']
export const giftEligibilityOptions: GiftEligibility[] = ['All', 'Dealer', 'Chemist']

const giftNames = ['Smart Watch', 'Electric Kettle', 'Bluetooth Speaker', 'Insulated Bottle', 'Travel Backpack', 'Gift Voucher ₹500', 'Non-Stick Cookware Set', 'Wireless Earbuds']

/** Real stock photo per gift item (Unsplash direct CDN — stable, hotlink-safe URLs), matched 1:1 with giftNames. */
const giftImagesByName: Record<string, string> = {
  'Smart Watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&h=600&q=80',
  'Electric Kettle': 'https://images.unsplash.com/photo-1585237672814-8c0ba24b8b1d?auto=format&fit=crop&w=600&h=600&q=80',
  'Bluetooth Speaker': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&h=600&q=80',
  'Insulated Bottle': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&h=600&q=80',
  'Travel Backpack': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&h=600&q=80',
  'Gift Voucher ₹500': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&h=600&q=80',
  'Non-Stick Cookware Set': 'https://images.unsplash.com/photo-1584990347449-a5d9f800a783?auto=format&fit=crop&w=600&h=600&q=80',
  'Wireless Earbuds': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&h=600&q=80',
}

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
    giftImage: giftImagesByName[name]!,
    description: `${name} is a redeemable reward available in the MedTech Rewards Marketplace for eligible Dealers and Chemists.`,
    sku: `SKU-GIFT-${100000 + seed * 7}`,
    price: seededNumber(seed, 199, 4999),
    requiredCoins: seededNumber(seed, 200, 5000),
    availableQuantity,
    redeemedQuantity,
    status: seed % 9 === 0 ? 'inactive' : 'active',
    eligibleUserType: giftEligibilityOptions[seed % giftEligibilityOptions.length]!,

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
