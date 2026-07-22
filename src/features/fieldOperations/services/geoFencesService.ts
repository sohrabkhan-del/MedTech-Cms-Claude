import {
  mockGeoFences,
  getGeoFenceById,
  geoFenceUserOptions,
  geoFenceKpis,
} from '@/features/fieldOperations/mocks/mockGeoFences'
import type { GeoFence, GeoFenceFormValues } from '@/features/fieldOperations/types/fieldOperations.types'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// geo fence API is available. create/update/setStatus/remove are currently
// no-ops resolving immediately so the UI/hook contract is stable ahead of time.

async function getGeoFences(): Promise<GeoFence[]> {
  return mockDelay(mockGeoFences)
}

async function getGeoFenceDetail(id: string): Promise<GeoFence | undefined> {
  return mockDelay(getGeoFenceById(id))
}

async function getGeoFenceKpis() {
  return mockDelay(geoFenceKpis)
}

async function getGeoFenceUserOptions() {
  return mockDelay(geoFenceUserOptions)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function createGeoFence(_values: GeoFenceFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function updateGeoFence(_id: string, _values: GeoFenceFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function setGeoFenceStatus(_id: string, _status: 'active' | 'inactive'): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function deleteGeoFence(_id: string): Promise<void> {
  return Promise.resolve()
}

export const geoFencesService = {
  getGeoFences,
  getGeoFenceDetail,
  getGeoFenceKpis,
  getGeoFenceUserOptions,
  createGeoFence,
  updateGeoFence,
  setGeoFenceStatus,
  deleteGeoFence,
}
