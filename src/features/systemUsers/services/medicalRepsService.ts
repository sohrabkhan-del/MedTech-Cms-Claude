import { mockMedicalReps, getMedicalRepById, getReplacementMrOptions, mrKpis } from '@/features/systemUsers/mockMedicalReps'
import type {
  MedicalRepFormValues,
  MedicalRepresentative,
  PartnerStatus,
  PartnerZone,
} from '@/features/systemUsers/types/systemUsers.types'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// medical representative management API is available. create/update/setStatus/
// deleteMedicalRep are currently no-ops resolving immediately so the UI/hook
// contract is stable ahead of time.

async function getMedicalReps(): Promise<MedicalRepresentative[]> {
  return mockDelay(mockMedicalReps)
}

async function getMedicalRepDetail(id: string): Promise<MedicalRepresentative | undefined> {
  return mockDelay(getMedicalRepById(id))
}

async function getMedicalRepKpis() {
  return mockDelay(mrKpis)
}

async function getMedicalRepFormOptions() {
  return mockDelay({
    regionOptions: ['North', 'South', 'East', 'West'] as PartnerZone[],
    statusOptions: ['active', 'pending', 'inactive'] as PartnerStatus[],
  })
}

async function getReplacementMrs(region: PartnerZone, excludeId: string): Promise<MedicalRepresentative[]> {
  return mockDelay(getReplacementMrOptions(region, excludeId))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function createMedicalRep(_values: MedicalRepFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function updateMedicalRep(_id: string, _values: MedicalRepFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function setMedicalRepStatus(_id: string, _status: PartnerStatus): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function deleteMedicalRep(_id: string, _replacementMrId: string): Promise<void> {
  return Promise.resolve()
}

export const medicalRepsService = {
  getMedicalReps,
  getMedicalRepDetail,
  getMedicalRepKpis,
  getMedicalRepFormOptions,
  getReplacementMrs,
  createMedicalRep,
  updateMedicalRep,
  setMedicalRepStatus,
  deleteMedicalRep,
}
