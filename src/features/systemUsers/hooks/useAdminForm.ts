import { useEffect, useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useToast } from '@/contexts/ToastContext'
import {
  useGetAdminDetailQuery,
  useGetAdminModulesQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useUpdateAdminModulesMutation,
} from '@/features/systemUsers/services/adminsApi'
import { fallbackRegions, getRegions } from '@/services/regionsService'
import type { RegionOption } from '@/contexts/RegionFilterContext'
import type { AdminFormValues } from '@/features/systemUsers/types/systemUsers.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useAdminForm(adminId: string | undefined) {
  const isEdit = !!adminId
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [regions, setRegions] = useState<RegionOption[]>(fallbackRegions)
  const [regionsLoading, setRegionsLoading] = useState(true)

  const adminResult = useGetAdminDetailQuery(adminId ?? skipToken, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  })
  const modulesResult = useGetAdminModulesQuery()
  const [createAdmin] = useCreateAdminMutation()
  const [updateAdmin] = useUpdateAdminMutation()
  const [updateAdminModules] = useUpdateAdminModulesMutation()

  useEffect(() => {
    let ignore = false
    getRegions()
      .then((options) => {
        if (!ignore && options.length > 0) setRegions(options)
      })
      .catch((error) => {
        console.warn('[regions] failed to load regions, using fallback', error)
      })
      .finally(() => {
        if (!ignore) setRegionsLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const isLoading =
    (isEdit && adminResult.isLoading) || modulesResult.isLoading || regionsLoading
  const loadError = adminResult.error
    ? getApiErrorMessage(adminResult.error, 'Failed to load admin form data.')
    : modulesResult.error
      ? getApiErrorMessage(modulesResult.error, 'Failed to load admin modules.')
    : null

  async function submit(values: AdminFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && adminId) {
        await updateAdmin({ id: adminId, values }).unwrap()
        await updateAdminModules({
          id: adminId,
          modulePermissions: values.modulePermissions,
        }).unwrap()
      } else {
        await createAdmin(values).unwrap()
      }
      toast.success(isEdit ? 'Admin updated successfully.' : 'Admin created successfully.')
      return true
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to save admin.')
      setSubmitError(message)
      toast.error(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isEdit,
    admin: adminResult.data,
    modules: modulesResult.data ?? [],
    regions,
    isLoading,
    isSubmitting,
    error: loadError ?? submitError,
    submit,
  }
}
