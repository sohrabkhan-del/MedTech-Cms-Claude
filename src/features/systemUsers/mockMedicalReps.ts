import type { MedicalRepresentative, MrManagedPartner } from '@/types/medicalRep'
import type { PartnerStatus, PartnerZone } from '@/types/partner'

const names = [
  'Rohan Kapoor', 'Neha Joshi', 'Sanjay Iyer', 'Kavita Reddy', 'Manoj Tiwari',
  'Ritu Desai', 'Ashok Menon', 'Bhavna Shah', 'Gaurav Sethi', 'Lakshmi Rao',
]
const regions: PartnerZone[] = ['North', 'South', 'East', 'West']
const statuses: PartnerStatus[] = ['active', 'pending', 'inactive']
const cities = ['Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Bengaluru', 'Hyderabad']
const partnerShopNames = ['Om Medical', 'Sunrise Pharma', 'Care Plus Chemist', 'Wellness Godown', 'City Drug Store', 'Apollo Pharma', 'Sri Sai Medical', 'National Chemist', 'Metro Godown', 'United Pharma']

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function buildManagedPartners(seed: number, region: PartnerZone, mrId: string): MrManagedPartner[] {
  const count = seededNumber(seed, 4, 10)
  return Array.from({ length: count }).map((_, i) => ({
    id: `${mrId}-partner-${i}`,
    partnerName: `${partnerShopNames[(seed + i) % partnerShopNames.length]} ${i + 1}`,
    partnerType: (seed + i) % 2 === 0 ? 'Dealer' : 'Chemist',
    city: cities[(seed + i) % cities.length]!,
    region,
    source: (seed + i) % 3 === 0 ? 'Assigned' : 'Onboarded',
    status: statuses[(seed + i) % statuses.length]!,
  }))
}

export const mockMedicalReps: MedicalRepresentative[] = Array.from({ length: 14 }).map((_, index) => {
  const seed = index + 1
  const id = `MR-${1000 + index}`
  const region = regions[index % regions.length]!
  const managedPartners = buildManagedPartners(seed, region, id)
  const dealers = managedPartners.filter((p) => p.partnerType === 'Dealer').length
  const chemists = managedPartners.filter((p) => p.partnerType === 'Chemist').length

  return {
    id,
    name: names[index % names.length]!,
    email: `${names[index % names.length]!.toLowerCase().replace(' ', '.')}@medtechcms.in`,
    phone: `+91 97${(30000000 + index * 191).toString().slice(0, 8)}`,
    region,
    status: statuses[index % statuses.length]!,
    lastLogin: `${((seed * 2) % 27) + 1} Jul 2026, ${8 + (index % 10)}:${(seed * 5) % 60 < 10 ? '0' : ''}${(seed * 5) % 60} AM`,
    notes: index % 3 === 0 ? 'Consistently strong onboarding performance in assigned territory.' : undefined,
    totalDealersOnboarded: dealers,
    totalChemistsOnboarded: chemists,
    totalPartnersManaged: managedPartners.length,
    managedPartners,
  }
})

export function getMedicalRepById(id: string): MedicalRepresentative | undefined {
  return mockMedicalReps.find((mr) => mr.id === id)
}

export function getReplacementMrOptions(region: PartnerZone, excludeId: string): MedicalRepresentative[] {
  return mockMedicalReps.filter((mr) => mr.region === region && mr.id !== excludeId && mr.status !== 'inactive')
}

export const mrKpis = {
  totalMrs: mockMedicalReps.length,
  activeMrs: mockMedicalReps.filter((m) => m.status === 'active').length,
  pendingMrs: mockMedicalReps.filter((m) => m.status === 'pending').length,
  inactiveMrs: mockMedicalReps.filter((m) => m.status === 'inactive').length,
}
