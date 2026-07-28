import {
  mockSchemes,
  mockGeneralSchemes,
  mockSeasonalSchemes,
  getSchemeById,
  setSchemeStatus,
  allSchemeKpis,
  generalSchemeKpis,
  seasonalSchemeKpis,
  schemeRegionOptions,
  schemePartnerTypeOptions,
} from '@/features/schemeManagement/mockSchemes'
import { mockGifts } from '@/features/schemeManagement/mockGifts'
import { mockProducts } from '@/features/inventoryManagement/mockProducts'
import type { Scheme, SchemeFormValues, SchemeStatus } from '@/features/schemeManagement/types/schemeManagement.types'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// scheme management API is available. create/update/deleteScheme are
// currently no-ops resolving immediately so the UI/hook contract is stable
// ahead of time.

async function getAllSchemes(): Promise<Scheme[]> {
  return mockDelay(mockSchemes)
}

async function getGeneralSchemes(): Promise<Scheme[]> {
  return mockDelay(mockGeneralSchemes)
}

async function getSeasonalSchemes(): Promise<Scheme[]> {
  return mockDelay(mockSeasonalSchemes)
}

async function getSchemeDetail(id: string): Promise<Scheme | undefined> {
  return mockDelay(getSchemeById(id))
}

async function getAllSchemeKpis() {
  return mockDelay(allSchemeKpis)
}

async function getGeneralSchemeKpis() {
  return mockDelay(generalSchemeKpis)
}

async function getSeasonalSchemeKpis() {
  return mockDelay(seasonalSchemeKpis)
}

async function getSchemeFormOptions() {
  return mockDelay({
    regionOptions: schemeRegionOptions,
    partnerTypeOptions: schemePartnerTypeOptions,
    giftProductOptions: mockGifts.map((gift) => ({
      id: gift.id,
      name: gift.giftName,
      image: gift.giftImage,
      price: gift.price,
      dealerBasePoints: gift.dealerBasePoints,
      chemistBasePoints: gift.chemistBasePoints,
    })),
    masterProductOptions: mockProducts.map((product) => ({
      id: product.id,
      name: product.productName,
      code: product.productCode,
      category: product.productCategory,
      dealerRewardPoints: product.dealerRewardPoints,
      chemistRewardPoints: product.chemistRewardPoints,
    })),
  })
}

function isNameTaken(name: string, excludeId?: string): boolean {
  const normalized = name.trim().toLowerCase()
  return [...mockGeneralSchemes, ...mockSeasonalSchemes].some(
    (scheme) => scheme.id !== excludeId && scheme.name.trim().toLowerCase() === normalized,
  )
}

async function checkNameAvailable(name: string, excludeId?: string): Promise<boolean> {
  return mockDelay(!isNameTaken(name, excludeId), 300)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function createScheme(_values: SchemeFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- other fields document the future real contract
async function updateScheme(id: string, values: SchemeFormValues): Promise<void> {
  setSchemeStatus(id, values.status)
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function deleteScheme(_id: string): Promise<void> {
  return Promise.resolve()
}

async function updateSchemeStatus(id: string, status: SchemeStatus): Promise<Scheme | undefined> {
  return mockDelay(setSchemeStatus(id, status), 300)
}

export const schemesService = {
  getAllSchemes,
  getGeneralSchemes,
  getSeasonalSchemes,
  getSchemeDetail,
  getAllSchemeKpis,
  getGeneralSchemeKpis,
  getSeasonalSchemeKpis,
  getSchemeFormOptions,
  checkNameAvailable,
  createScheme,
  updateScheme,
  updateSchemeStatus,
  deleteScheme,
}
