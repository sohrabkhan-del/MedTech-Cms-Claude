import { skipToken } from '@reduxjs/toolkit/query/react'
import {
  useGetGeoFenceDetailQuery,
  useSetGeoFenceStatusMutation,
  useDeleteGeoFenceMutation,
} from '@/features/fieldOperations/services/geoFencesApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useGeoFenceDetail(fenceId: string | undefined) {
  const { data: geoFence, isLoading, error: queryError } = useGetGeoFenceDetailQuery(fenceId ?? skipToken)
  const [setStatusMutation, { isLoading: isSettingStatus }] = useSetGeoFenceStatusMutation()
  const [deleteGeoFenceMutation, { isLoading: isDeleting }] = useDeleteGeoFenceMutation()

  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load geo fence.') : null
  const isMutating = isSettingStatus || isDeleting

  async function setStatus(status: 'active' | 'inactive') {
    if (!fenceId) return
    await setStatusMutation({ id: fenceId, status }).unwrap()
  }

  async function remove() {
    if (!fenceId) return
    await deleteGeoFenceMutation(fenceId).unwrap()
  }

  return { geoFence, isLoading, error, isMutating, setStatus, remove }
}
