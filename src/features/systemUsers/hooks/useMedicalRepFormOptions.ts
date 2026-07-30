import { useGetMedicalRepFormOptionsQuery } from '@/features/systemUsers/services/medicalRepsApi'
import type { PartnerStatus, PartnerZone } from '@/features/systemUsers/types/systemUsers.types'

interface FormOptions {
  regionOptions: PartnerZone[]
  statusOptions: PartnerStatus[]
}

const emptyOptions: FormOptions = { regionOptions: [], statusOptions: [] }

/** Shared static option lists for MR filters/forms (not just the form page). */
export function useMedicalRepFormOptions() {
  const { data } = useGetMedicalRepFormOptionsQuery()
  return data ?? emptyOptions
}
