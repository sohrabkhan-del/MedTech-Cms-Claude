import {
  mockGeneralSchemes,
  mockSeasonalSchemes,
  getSchemeById,
  generalSchemeKpis,
  seasonalSchemeKpis,
  schemeTypeOptions,
  schemeApplicableUserOptions,
  rewardTypeOptions,
  rewardFrequencyOptions,
  festivalOptions,
} from '@/features/schemes/mockSchemes'
import { mockGifts } from '@/features/schemes/mockGifts'
import type { Scheme, SchemeFormValues } from '@/features/schemeManagement/types/schemeManagement.types'

// TODO: replace mock-backed implementations with apiClient calls once the
// scheme management API is available. create/update/setStatus/deleteScheme
// are currently no-ops resolving immediately so the UI/hook contract is
// stable ahead of time.

async function getGeneralSchemes(): Promise<Scheme[]> {
  return Promise.resolve(mockGeneralSchemes)
}

async function getSeasonalSchemes(): Promise<Scheme[]> {
  return Promise.resolve(mockSeasonalSchemes)
}

async function getSchemeDetail(id: string): Promise<Scheme | undefined> {
  return Promise.resolve(getSchemeById(id))
}

async function getGeneralSchemeKpis() {
  return Promise.resolve(generalSchemeKpis)
}

async function getSeasonalSchemeKpis() {
  return Promise.resolve(seasonalSchemeKpis)
}

async function getSchemeFormOptions() {
  return Promise.resolve({
    schemeTypeOptions,
    schemeApplicableUserOptions,
    rewardTypeOptions,
    rewardFrequencyOptions,
    festivalOptions,
    productCategoryOptions: mockGifts.map((gift) => gift.giftName),
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function createScheme(_values: SchemeFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function updateScheme(_id: string, _values: SchemeFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function setSchemeStatus(_id: string, _status: Scheme['status']): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function deleteScheme(_id: string): Promise<void> {
  return Promise.resolve()
}

export const schemesService = {
  getGeneralSchemes,
  getSeasonalSchemes,
  getSchemeDetail,
  getGeneralSchemeKpis,
  getSeasonalSchemeKpis,
  getSchemeFormOptions,
  createScheme,
  updateScheme,
  setSchemeStatus,
  deleteScheme,
}
