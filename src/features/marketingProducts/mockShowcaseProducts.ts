import type { DeliveryStatus, EnquiryStatus, ProductEnquiry, ShowcaseProduct, ShowcaseUserType } from '@/types/showcaseProduct'
import { mockDealers } from '@/features/userManagement/mockDealers'
import { mockChemists } from '@/features/userManagement/mockChemists'

export const showcaseCategoryOptions = ['Cardiac Care', 'Neuro Care', 'Immunity', 'Diabetes Care', 'Pain Relief']
const regions = ['North', 'South', 'East', 'West']
const productNames = ['CardioCare Wellness Kit', 'NeuroPlus Care Combo', 'ImmunoBoost Family Pack', 'GlucoBalance Starter Kit', 'PainRelief Comfort Set']

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

function resolveEnquiryStatus(seed: number): EnquiryStatus {
  return seed % 3 === 0 ? 'responded' : 'pending'
}

function resolveDeliveryStatus(seed: number, enquiryStatus: EnquiryStatus): DeliveryStatus {
  if (enquiryStatus === 'pending') return 'pending'
  const statuses: DeliveryStatus[] = ['packed', 'shipped', 'out_for_delivery', 'delivered', 'delivered', 'cancelled']
  return statuses[seed % statuses.length]!
}

function buildEnquiries(seed: number, productId: string): ProductEnquiry[] {
  const count = seededNumber(seed, 3, 8)
  return Array.from({ length: count }).map((_, i) => {
    const localSeed = seed * 13 + i
    const userType: ShowcaseUserType = localSeed % 2 === 0 ? 'Dealer' : 'Chemist'
    const partner = userType === 'Dealer' ? mockDealers[localSeed % mockDealers.length]! : mockChemists[localSeed % mockChemists.length]!
    const enquiryStatus = resolveEnquiryStatus(localSeed)

    return {
      id: `${productId}-enq-${i}`,
      userId: partner.id,
      userName: partner.shopName,
      userType,
      interestedDate: dateFromSeed(localSeed, 'Jul'),
      enquiryStatus,
      deliveryStatus: resolveDeliveryStatus(localSeed, enquiryStatus),
      email: partner.email,
      mobileNumber: partner.phone,
    }
  })
}

function buildShowcaseProduct(seed: number): ShowcaseProduct {
  const id = `showcase-${seed}`
  const name = productNames[seed % productNames.length]!
  const enquiries = buildEnquiries(seed, id)
  const responded = enquiries.filter((e) => e.enquiryStatus === 'responded').length
  const delivered = enquiries.filter((e) => e.deliveryStatus === 'delivered').length

  return {
    id,
    productName: name,
    sku: `SKU-SC-${100000 + seed * 17}`,
    category: showcaseCategoryOptions[seed % showcaseCategoryOptions.length]!,
    price: seededNumber(seed, 199, 2499),

    description: `${name} is a promotional showcase item highlighted to Dealers and Chemists as part of ongoing marketing campaigns.`,
    productImage: `https://picsum.photos/seed/medtech-showcase-${seed}/600/600`,
    featuredProduct: seed % 5 === 0,
    region: regions[seed % regions.length]!,

    totalInterestedUsers: enquiries.length,
    totalProductViews: seededNumber(seed, 200, 5000),
    productsDelivered: delivered,

    enquiries,
    internalNotes: responded > 0 ? 'Follow-up in progress with responded enquiries.' : 'Awaiting initial response from marketing team.',
  }
}

export const mockShowcaseProducts: ShowcaseProduct[] = Array.from({ length: 24 }).map((_, index) => buildShowcaseProduct(index + 1))

export function getShowcaseProductById(id: string): ShowcaseProduct | undefined {
  return mockShowcaseProducts.find((product) => product.id === id)
}

const allEnquiries = mockShowcaseProducts.flatMap((product) => product.enquiries)

export const showcaseProductKpis = {
  totalEnquiries: allEnquiries.length,
  pendingEnquiries: allEnquiries.filter((e) => e.enquiryStatus === 'pending').length,
  respondedEnquiries: allEnquiries.filter((e) => e.enquiryStatus === 'responded').length,
  productsDelivered: allEnquiries.filter((e) => e.deliveryStatus === 'delivered').length,
}
