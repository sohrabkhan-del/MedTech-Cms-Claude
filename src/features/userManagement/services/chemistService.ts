import { mockChemists, chemistKpis, getChemistById } from '@/features/userManagement/mockChemists'
import type { Chemist, ChemistKpis } from '@/features/userManagement/types/userManagement.types'

// TODO: replace mock-backed implementations with apiClient calls once the
// chemist API is available. Response shapes are expected to stay the same.

async function getChemists(): Promise<Chemist[]> {
  return Promise.resolve(mockChemists)
}

async function getChemistDetail(id: string): Promise<Chemist | undefined> {
  return Promise.resolve(getChemistById(id))
}

async function getChemistKpis(): Promise<ChemistKpis> {
  return Promise.resolve(chemistKpis)
}

export const chemistService = {
  getChemists,
  getChemistDetail,
  getChemistKpis,
}
