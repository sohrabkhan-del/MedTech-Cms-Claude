import type {
  MedicalRepresentative,
  MrManagedPartner,
  MrPartnerSource,
  MrPartnerType,
} from '@/types/medicalRep'
import type { PartnerStatus, PartnerZone } from '@/types/partner'

const names = [
  'Rohan Kapoor', 'Neha Joshi', 'Sanjay Iyer', 'Kavita Reddy', 'Manoj Tiwari',
  'Ritu Desai', 'Ashok Menon', 'Bhavna Shah', 'Gaurav Sethi', 'Lakshmi Rao',
]
const regions: PartnerZone[] = ['North', 'South', 'East', 'West']
const statuses: PartnerStatus[] = ['active', 'pending', 'inactive']
const partnerTypes: MrPartnerType[] = ['Dealer', 'Chemist']
const partnerSources: MrPartnerSource[] = [
  'QR Scan',
  'Manual Onboarding',
  'Referral',
]
const cities = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata',
]

function buildManagedPartners(
  seed: number,
  region: PartnerZone,
  count: number,
): MrManagedPartner[] {
  return Array.from({ length: count }).map((_, i) => {
    const partnerSeed = seed + i + 1
    return {
      id: `MR-${seed}-partner-${i}`,
      partnerName: `${names[(seed + i) % names.length]!.split(' ')[0]} ${
        partnerTypes[i % partnerTypes.length] === 'Dealer'
          ? 'Distributors'
          : 'Pharmacy'
      }`,
      partnerType: partnerTypes[i % partnerTypes.length]!,
      city: cities[partnerSeed % cities.length]!,
      region,
      source: partnerSources[partnerSeed % partnerSources.length]!,
      status: statuses[partnerSeed % statuses.length]!,
    }
  })
}

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

export const mockMedicalReps: MedicalRepresentative[] = Array.from({ length: 14 }).map((_, index) => {
  const seed = index + 1
  const id = `MR-${1000 + index}`
  const region = regions[index % regions.length]!
  const dealers = seededNumber(seed, 0, 6)
  const chemists = seededNumber(seed + 1, 0, 6)

  return {
    id,
    name: names[index % names.length]!,
    fullName: names[index % names.length]!,
    email: `${names[index % names.length]!.toLowerCase().replace(' ', '.')}@medtechcms.in`,
    phone: `+91 97${(30000000 + index * 191).toString().slice(0, 8)}`,
    region,
    status: statuses[index % statuses.length]!,
    lastLogin: `${((seed * 2) % 27) + 1} Jul 2026, ${8 + (index % 10)}:${(seed * 5) % 60 < 10 ? '0' : ''}${(seed * 5) % 60} AM`,
    notes: index % 3 === 0 ? 'Consistently strong onboarding performance in assigned territory.' : undefined,
    totalDealersOnboarded: dealers,
    totalChemistsOnboarded: chemists,
    totalPartnersManaged: dealers + chemists,
    managedPartners: buildManagedPartners(seed, region, dealers + chemists),
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
