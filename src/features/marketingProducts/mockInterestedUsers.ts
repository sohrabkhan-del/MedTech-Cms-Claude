import type { InterestedUserLead, LeadStatus, LeadUserType } from '@/types/interestedUser'
import { mockDealers } from '@/features/userManagement/mockDealers'
import { mockChemists } from '@/features/userManagement/mockChemists'
import { mrs } from '@/features/userManagement/mockPartnerData'
import { mockShowcaseProducts } from '@/features/marketingProducts/mockShowcaseProducts'
import { formatDate } from '@/utils/formatDate'

const stockUnits = ['boxes', 'strips', 'units', 'cartons']

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
  return `2026-${month}-${pad(day)}`
}

function resolveLeadStatus(seed: number): LeadStatus {
  const roll = seed % 5
  if (roll < 2) return 'new'
  if (roll < 4) return 'followed_up'
  return 'closed'
}

function buildLead(seed: number): InterestedUserLead {
  const userType: LeadUserType = seed % 2 === 0 ? 'Dealer' : 'Chemist'
  const partner = userType === 'Dealer' ? mockDealers[seed % mockDealers.length]! : mockChemists[seed % mockChemists.length]!
  const product = mockShowcaseProducts[seed % mockShowcaseProducts.length]!
  const leadStatus = resolveLeadStatus(seed)
  const createdAt = dateFromSeed(seed, '07')

  return {
    id: `lead-${seed}`,
    showcaseProductId: product.id,
    interestedProduct: product.name,
    productCategory: product.category?.name ?? 'Medicines',
    userId: partner.id,
    userName: partner.ownerName ?? partner.shopName,
    businessName: partner.shopName,
    userType,
    mobile: partner.phone,
    regionId: null,
    region: partner.zone,
    quantityRequested: seededNumber(seed, 5, 50),
    stockUnit: stockUnits[seed % stockUnits.length]!,
    note: 'Please deliver within 3 business days.',
    leadStatus,
    requestedDate: formatDate(createdAt),
    followedUpAt: leadStatus === 'new' ? null : formatDate(dateFromSeed(seed + 2, '07')),
    handledBy: leadStatus === 'new' ? '' : mrs[seed % mrs.length]!,
    followUpNote: leadStatus === 'followed_up' ? 'Followed up with the customer.' : '',
    closeReason: leadStatus === 'closed' ? 'order_placed' : '',
    createdAt,
    updatedAt: leadStatus === 'new' ? createdAt : dateFromSeed(seed + 2, '07'),
  }
}

export const mockInterestedUsers: InterestedUserLead[] = Array.from({ length: 40 }).map((_, index) => buildLead(index + 1))

export function getInterestedUserById(id: string): InterestedUserLead | undefined {
  return mockInterestedUsers.find((lead) => lead.id === id)
}

export const interestedUserKpis = {
  totalInterestedUsers: mockInterestedUsers.length,
  newLeads: mockInterestedUsers.filter((l) => l.leadStatus === 'new').length,
  leadsInProgress: mockInterestedUsers.filter((l) => l.leadStatus === 'followed_up').length,
  closedConvertedLeads: mockInterestedUsers.filter((l) => l.leadStatus === 'closed').length,
}
