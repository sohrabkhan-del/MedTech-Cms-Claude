import type { InterestedUserLead, LeadStatus, LeadUserType } from '@/types/interestedUser'
import { mockDealers } from '@/features/userManagement/mockDealers'
import { mockChemists } from '@/features/userManagement/mockChemists'
import { mrs } from '@/features/userManagement/mockPartnerData'
import { mockShowcaseProducts } from '@/features/marketingProducts/mockShowcaseProducts'

const leadSources = ['Showcase Enquiry', 'MR Referral', 'Mobile App Browse', 'Promotional Campaign']
const followUpStatuses = ['On Track', 'Awaiting Response', 'Follow-up Scheduled', 'No Response Yet']

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

function resolveLeadStatus(seed: number): LeadStatus {
  const roll = seed % 5
  if (roll < 2) return 'new'
  if (roll < 4) return 'in_progress'
  return 'closed'
}

function progressForStatus(status: LeadStatus, seed: number): number {
  if (status === 'new') return seededNumber(seed, 0, 20)
  if (status === 'in_progress') return seededNumber(seed, 25, 80)
  return 100
}

function buildLead(seed: number): InterestedUserLead {
  const userType: LeadUserType = seed % 2 === 0 ? 'Dealer' : 'Chemist'
  const partner = userType === 'Dealer' ? mockDealers[seed % mockDealers.length]! : mockChemists[seed % mockChemists.length]!
  const product = mockShowcaseProducts[seed % mockShowcaseProducts.length]!
  const leadStatus = resolveLeadStatus(seed)

  return {
    id: `lead-${seed}`,
    userId: partner.id,
    userName: partner.shopName,
    userType,
    region: partner.zone,
    interestedProduct: product.productName,
    leadStatus,
    requestedDate: dateFromSeed(seed, 'Jul'),
    handledBy: mrs[seed % mrs.length]!,
    leadSource: leadSources[seed % leadSources.length]!,
    progressPercentage: progressForStatus(leadStatus, seed),
    lastActivity: dateFromSeed(seed + 2, 'Jul'),
    followUpStatus: leadStatus === 'closed' ? 'Converted' : followUpStatuses[seed % followUpStatuses.length]!,
  }
}

export const mockInterestedUsers: InterestedUserLead[] = Array.from({ length: 40 }).map((_, index) => buildLead(index + 1))

export function getInterestedUserById(id: string): InterestedUserLead | undefined {
  return mockInterestedUsers.find((lead) => lead.id === id)
}

export const interestedUserKpis = {
  totalInterestedUsers: mockInterestedUsers.length,
  newLeads: mockInterestedUsers.filter((l) => l.leadStatus === 'new').length,
  inProgressLeads: mockInterestedUsers.filter((l) => l.leadStatus === 'in_progress').length,
  closedLeads: mockInterestedUsers.filter((l) => l.leadStatus === 'closed').length,
}
