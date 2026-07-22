import { mockDealers, getDealerById, dealerKpis } from '@/features/userManagement/mockDealers'
import { mrs } from '@/features/userManagement/mockPartnerData'
import type { Dealer, DealerFormValues } from '@/features/userManagement/types/userManagement.types'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// dealers API is available. create/update are currently no-ops resolving
// immediately so the UI/hook contract is stable ahead of time.

async function getDealers(): Promise<Dealer[]> {
  return mockDelay(mockDealers)
}

async function getDealerDetail(id: string): Promise<Dealer | undefined> {
  return mockDelay(getDealerById(id))
}

async function getDealerKpis() {
  return mockDelay(dealerKpis)
}

async function getMrOptions(): Promise<string[]> {
  return mockDelay(mrs)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function createDealer(_values: DealerFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function updateDealer(_id: string, _values: DealerFormValues): Promise<void> {
  return Promise.resolve()
}

export const partnersService = {
  getDealers,
  getDealerDetail,
  getDealerKpis,
  getMrOptions,
  createDealer,
  updateDealer,
}
