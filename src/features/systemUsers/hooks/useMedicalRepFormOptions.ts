import { useEffect, useState } from 'react'
import { medicalRepsService } from '@/features/systemUsers/services/medicalRepsService'
import type { PartnerStatus, PartnerZone } from '@/features/systemUsers/types/systemUsers.types'

interface FormOptions {
  regionOptions: PartnerZone[]
  statusOptions: PartnerStatus[]
}

const emptyOptions: FormOptions = { regionOptions: [], statusOptions: [] }

/** Shared static option lists for MR filters/forms (not just the form page). */
export function useMedicalRepFormOptions() {
  const [options, setOptions] = useState<FormOptions>(emptyOptions)

  useEffect(() => {
    let cancelled = false
    medicalRepsService.getMedicalRepFormOptions().then((result) => {
      if (!cancelled) setOptions(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return options
}
