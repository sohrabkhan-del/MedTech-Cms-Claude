import type { GeoLockDetails, PartnerBase } from '@/types/partner'

export interface Godown {
  id: string
  name: string
  address: string
  geoLock: GeoLockDetails
}

export interface Dealer extends PartnerBase {
  activeOrders: number
  liveDeliveries: boolean
  godowns: Godown[]
}
