import type { PartnerBase } from '@/types/partner'

export interface Chemist extends PartnerBase {
  geoTagStatus: 'tagged' | 'pending'
}
