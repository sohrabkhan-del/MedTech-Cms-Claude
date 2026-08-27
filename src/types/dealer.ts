import type { GeoLockDetails, PartnerBase } from '@/types/partner'

export interface Godown {
  id: string
  name: string
  address: string
  geoLock: GeoLockDetails
}

export interface Dealer extends PartnerBase {
  pointsEarned?: number
  activeOrders: number
  totalRedemption?: number
  interestedProductCount?: number
  liveDeliveries: boolean
  godowns: Godown[]
}
