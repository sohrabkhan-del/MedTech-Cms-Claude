import { useEffect, useState } from 'react'
import { adminsService } from '@/features/systemUsers/services/adminsService'
import type { Admin } from '@/features/systemUsers/types/systemUsers.types'

interface FormOptions {
  regionOptions: Admin['regionAccess'][]
  roleOptions: Admin['role'][]
  statusOptions: Admin['status'][]
}

const emptyOptions: FormOptions = { regionOptions: [], roleOptions: [], statusOptions: [] }

/** Shared static option lists for admin filters/forms (not just the form page). */
export function useAdminFormOptions() {
  const [options, setOptions] = useState<FormOptions>(emptyOptions)

  useEffect(() => {
    let cancelled = false
    adminsService.getAdminFormOptions().then((result) => {
      if (!cancelled) setOptions(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return options
}
