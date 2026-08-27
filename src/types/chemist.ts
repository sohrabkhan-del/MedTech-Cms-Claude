import type { PartnerBase } from '@/types/partner'

export interface Chemist extends PartnerBase {
  geoTagStatus: 'tagged' | 'pending'
  pointsEarned?: number
  activeOrders?: number
  totalRedemption?: number
  interestedProductCount?: number
  liveDeliveries?: boolean
}
