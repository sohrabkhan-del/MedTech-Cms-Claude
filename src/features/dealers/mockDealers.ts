import type { Dealer } from '@/types/dealer'
import { generatePartnerBase } from '@/features/partners/mockPartnerData'

export const mockDealers: Dealer[] = Array.from({ length: 42 }).map((_, index) => {
  const base = generatePartnerBase(index, 'dealer', 'Medical Godown')
  return {
    ...base,
    activeOrders: (index * 3) % 12,
    liveDeliveries: index % 4 !== 0,
  }
})

export function getDealerById(id: string): Dealer | undefined {
  return mockDealers.find((dealer) => dealer.id === id)
}

export const dealerKpis = {
  dealerAccounts: mockDealers.length,
  activeOrders: 128,
  pendingKyc: mockDealers.filter((d) => d.status === 'pending').length,
  liveDeliveries: 36,
}
