import { mockChemists, chemistKpis, getChemistById } from '@/features/userManagement/mockChemists'
import type { Chemist, ChemistKpis } from '@/features/userManagement/types/userManagement.types'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// chemist API is available. Response shapes are expected to stay the same.

async function getChemists(): Promise<Chemist[]> {
  return mockDelay(mockChemists)
}

async function getChemistDetail(id: string): Promise<Chemist | undefined> {
  return mockDelay(getChemistById(id))
}

async function getChemistKpis(): Promise<ChemistKpis> {
  return mockDelay(chemistKpis)
}

export const chemistService = {
  getChemists,
  getChemistDetail,
  getChemistKpis,
}
