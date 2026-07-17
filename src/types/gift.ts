export type GiftStatus = 'active' | 'inactive'
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'
export type GiftUserType = 'Dealer' | 'Chemist' | 'MR'
export type GiftDeliveryStatus = 'pending' | 'packed' | 'shipped' | 'delivered' | 'cancelled'

export interface GiftRedemptionEntry {
  id: string
  userName: string
  userType: GiftUserType
  coinsUsed: number
  redemptionDate: string
  deliveryStatus: GiftDeliveryStatus
}

export interface GiftInventoryEntry {
  id: string
  date: string
  stockAdded: number
  stockRemoved: number
  currentStock: number
  updatedBy: string
}

export interface Gift {
  id: string
  giftCode: string
  giftName: string
  category: string
  brand: string
  giftImage: string
  description: string
  sku: string
  requiredCoins: number
  availableQuantity: number
  redeemedQuantity: number
  status: GiftStatus

  redemptionHistory: GiftRedemptionEntry[]
  inventoryHistory: GiftInventoryEntry[]
}
