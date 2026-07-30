import { useGetAdminFormOptionsQuery } from '@/features/systemUsers/services/adminsApi'
import type { Admin } from '@/features/systemUsers/types/systemUsers.types'

interface FormOptions {
  regionOptions: Admin['regionAccess'][]
  roleOptions: Admin['role'][]
  statusOptions: Admin['status'][]
}

const emptyOptions: FormOptions = { regionOptions: [], roleOptions: [], statusOptions: [] }

/** Shared static option lists for admin filters/forms (not just the form page). */
export function useAdminFormOptions() {
  const { data } = useGetAdminFormOptionsQuery()
  return data ?? emptyOptions
}
