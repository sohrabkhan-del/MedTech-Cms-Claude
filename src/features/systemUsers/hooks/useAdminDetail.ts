import { skipToken } from '@reduxjs/toolkit/query/react'
import {
  useGetAdminDetailQuery,
  useSetAdminStatusMutation,
} from '@/features/systemUsers/services/adminsApi'
import type { AdminStatus } from '@/features/systemUsers/types/systemUsers.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useAdminDetail(adminId: string | undefined) {
  const {
    data: admin,
    isLoading,
    isFetching,
    isUninitialized,
    refetch,
    error: queryError,
  } = useGetAdminDetailQuery(adminId ?? skipToken)
  const [setStatusMutation, { isLoading: isStatusUpdating }] =
    useSetAdminStatusMutation()

  const error = queryError
    ? getApiErrorMessage(queryError, 'Failed to load admin.')
    : null

  async function setStatus(status: AdminStatus) {
    if (!adminId) return
    await setStatusMutation({ id: adminId, status }).unwrap()
  }

  return {
    admin,
    isLoading,
    isFetching,
    isUninitialized,
    refetch,
    isStatusUpdating,
    error,
    setStatus,
  }
}
