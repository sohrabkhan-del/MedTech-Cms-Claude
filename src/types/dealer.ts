import type { PartnerBase } from '@/types/partner'

export interface Dealer extends PartnerBase {
  activeOrders: number
  liveDeliveries: boolean
}
