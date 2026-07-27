import type {
  Scheme,
  SchemeApplicableProduct,
  SchemeGiftRule,
  SchemePartnerEntry,
  SchemePartnerStatus,
  SchemePartnerType,
  SchemeType,
} from '@/types/scheme'
import type { PartnerZone } from '@/types/partner'
import { mockGifts } from '@/features/schemeManagement/mockGifts'
import { mockProducts } from '@/features/inventoryManagement/mockProducts'
import { mockDealers } from '@/features/userManagement/mockDealers'
import { mockChemists } from '@/features/userManagement/mockChemists'

const REGIONS: PartnerZone[] = ['East', 'West', 'North', 'South']

const generalSchemeNames = ['Loyalty Growth Program', 'Volume Achiever Plan', 'Steady Rewards Circle', 'Annual Performance Bonus', 'Partner Growth Circle']
const seasonalSchemeNames = ['Diwali Double Rewards', 'New Year Bonus Campaign', 'Holi Festival Rewards', 'Eid Promotion', 'Christmas Campaign']

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

/** 8-digit numeric string, deterministic per seed — mirrors the seededNumber mock-data convention (no Math.random). */
function schemeIdFromSeed(seed: number): string {
  return String(10000000 + seededNumber(seed, 0, 89999999)).padStart(8, '0')
}

/** Offsets a date from today by a seeded number of days in [min, max), so schemes span past/current/future relative to "now". */
function dateOffsetFromToday(seed: number, minDays: number, maxDays: number): string {
  const offset = seededNumber(seed, minDays, maxDays)
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

function resolvePartnerTypes(seed: number): SchemePartnerType[] {
  const options: SchemePartnerType[][] = [['Dealer'], ['Chemist'], ['Dealer', 'Chemist']]
  return options[seed % options.length]!
}

function resolveRegions(seed: number): PartnerZone[] {
  const count = seededNumber(seed, 1, REGIONS.length + 1)
  return REGIONS.filter((_, i) => (seed + i) % REGIONS.length < count)
}

function buildApplicableProducts(seed: number, regions: PartnerZone[]): SchemeApplicableProduct[] {
  const count = seededNumber(seed, 2, 5)
  return Array.from({ length: count }).map((_, i) => {
    const product = mockProducts[(seed + i * 5) % mockProducts.length]!
    const localSeed = seed * 13 + i
    const regionMultipliers = Object.fromEntries(
      regions.map((region, ri) => [region, Number((seededNumber(localSeed + ri, 10, 30) / 10).toFixed(1))]),
    ) as SchemeApplicableProduct['regionMultipliers']
    return {
      productId: product.id,
      baseCoinValue: seededNumber(localSeed, 10, 100),
      regionMultipliers,
    }
  })
}

function buildGiftRules(seed: number, partnerTypes: SchemePartnerType[]): SchemeGiftRule[] {
  const count = seededNumber(seed, 2, 5)
  return Array.from({ length: count }).map((_, i) => {
    const gift = mockGifts[(seed + i * 3) % mockGifts.length]!
    const localSeed = seed + i
    return {
      giftId: gift.id,
      dealerRule: partnerTypes.includes('Dealer')
        ? {
            price: seededNumber(localSeed, 199, 4999),
            points: seededNumber(localSeed, 50, 400),
            discountPrice: seededNumber(localSeed + 1, 99, 3999),
          }
        : null,
      chemistRule: partnerTypes.includes('Chemist')
        ? {
            price: seededNumber(localSeed + 2, 199, 4999),
            points: seededNumber(localSeed + 1, 50, 400),
            discountPrice: seededNumber(localSeed + 3, 99, 3999),
          }
        : null,
    }
  })
}

function buildPartnerEntries(
  seed: number,
  source: readonly { id: string; shopName: string; zone: PartnerZone }[],
): SchemePartnerEntry[] {
  const statuses: SchemePartnerStatus[] = ['interested', 'enrolled', 'enrolled', 'redeemed']
  const count = seededNumber(seed, 2, 6)
  return Array.from({ length: count }).map((_, i) => {
    const localSeed = seed * 7 + i
    const partner = source[localSeed % source.length]!
    return {
      id: partner.id,
      name: partner.shopName,
      region: partner.zone,
      points: seededNumber(localSeed, 100, 3000),
      status: statuses[localSeed % statuses.length]!,
    }
  })
}

function buildScheme(seed: number, type: SchemeType, options?: { forceNoEndDate?: boolean; forceEndDate?: boolean }): Scheme {
  const id = schemeIdFromSeed(seed + (type === 'seasonal' ? 500 : 0))
  const name = type === 'general' ? generalSchemeNames[seed % generalSchemeNames.length]! : seasonalSchemeNames[seed % seasonalSchemeNames.length]!
  const partnerTypes = resolvePartnerTypes(seed)
  const dealerRegions = partnerTypes.includes('Dealer') ? resolveRegions(seed) : []
  const chemistRegions = partnerTypes.includes('Chemist') ? resolveRegions(seed + 2) : []
  const regions = REGIONS.filter((region) => dealerRegions.includes(region) || chemistRegions.includes(region))

  // Cycle each scheme through ended / active / upcoming relative to today, so KPI counts reflect a realistic mix.
  const bucket = seed % 3
  const noEndDate = type === 'general' && (options?.forceNoEndDate || (!options?.forceEndDate && bucket === 1 && seed % 5 === 0))

  let startDate: string
  let endDate: string | null
  if (bucket === 0) {
    // Ended
    startDate = dateOffsetFromToday(seed, -180, -60)
    endDate = dateOffsetFromToday(seed + 20, -30, -1)
  } else if (bucket === 1) {
    // Active
    startDate = dateOffsetFromToday(seed, -60, -1)
    endDate = noEndDate ? null : dateOffsetFromToday(seed + 20, 30, 180)
  } else {
    // Upcoming
    startDate = dateOffsetFromToday(seed, 5, 60)
    endDate = dateOffsetFromToday(seed + 20, 90, 240)
  }

  return {
    id,
    type,
    name,
    startDate,
    endDate,
    partnerTypes,
    dealerRegions,
    chemistRegions,
    regions,
    applicableProducts: buildApplicableProducts(seed, regions),
    giftRules: buildGiftRules(seed, partnerTypes),
    description: `${name} lets eligible partners redeem gift products by earning points ${type === 'general' ? 'throughout the year' : 'during the campaign window'}.`,
    disclaimer: 'Points are non-transferable and subject to MedTech Rewards terms & conditions.',
    image: `https://picsum.photos/seed/medtech-scheme-${id}/400/400`,
    banner: `https://picsum.photos/seed/medtech-scheme-banner-${id}/1200/400`,
    partners: {
      dealer: partnerTypes.includes('Dealer') ? buildPartnerEntries(seed, mockDealers) : [],
      chemist: partnerTypes.includes('Chemist') ? buildPartnerEntries(seed + 3, mockChemists) : [],
    },
  }
}

export const mockGeneralSchemes: Scheme[] = [
  buildScheme(1, 'general', { forceNoEndDate: true }),
  buildScheme(2, 'general', { forceEndDate: true }),
  ...Array.from({ length: 10 }).map((_, index) => buildScheme(index + 3, 'general')),
]
export const mockSeasonalSchemes: Scheme[] = Array.from({ length: 10 }).map((_, index) => buildScheme(index + 1, 'seasonal'))
export const mockSchemes: Scheme[] = [...mockGeneralSchemes, ...mockSeasonalSchemes]

export function getSchemeById(id: string): Scheme | undefined {
  return mockSchemes.find((scheme) => scheme.id === id)
}

export function schemeDealerTotal(scheme: Scheme): number {
  return scheme.giftRules.reduce((sum, rule) => sum + (rule.dealerRule?.points ?? 0), 0)
}

export function schemeChemistTotal(scheme: Scheme): number {
  return scheme.giftRules.reduce((sum, rule) => sum + (rule.chemistRule?.points ?? 0), 0)
}

function schemeKpis(schemes: Scheme[]) {
  const today = new Date().toISOString().slice(0, 10)
  return {
    totalSchemes: schemes.length,
    activeSchemes: schemes.filter((s) => s.startDate <= today && (!s.endDate || s.endDate >= today)).length,
    totalEnrolledPartners: schemes.reduce((sum, s) => sum + s.partners.dealer.length + s.partners.chemist.length, 0),
    totalPointsAllocated: schemes.reduce((sum, s) => sum + schemeDealerTotal(s) + schemeChemistTotal(s), 0),
  }
}

export const generalSchemeKpis = schemeKpis(mockGeneralSchemes)
export const seasonalSchemeKpis = schemeKpis(mockSeasonalSchemes)
export const allSchemeKpis = schemeKpis(mockSchemes)

export const schemeRegionOptions: PartnerZone[] = REGIONS
export const schemePartnerTypeOptions: SchemePartnerType[] = ['Dealer', 'Chemist']
