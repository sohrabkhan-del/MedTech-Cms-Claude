import { useGetAdminsQuery, useGetAdminKpisQuery } from '@/features/systemUsers/services/adminsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useAdmins() {
  const adminsResult = useGetAdminsQuery()
  const kpisResult = useGetAdminKpisQuery()

  const isLoading = adminsResult.isLoading || kpisResult.isLoading
  const error = adminsResult.error
    ? getApiErrorMessage(adminsResult.error, 'Failed to load admins.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load admins.')
      : null

  return {
    admins: adminsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
