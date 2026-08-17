import {
  useGetGiftDetailQuery,
  useSetGiftStatusMutation,
  useDeleteGiftMutation,
} from '@/features/schemeManagement/services/giftsApi'
import type { GiftStatus } from '@/features/schemeManagement/types/schemeManagement.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { skipToken } from '@reduxjs/toolkit/query/react'

export function useGiftDetail(giftId: string | undefined) {
  const { data: gift, isLoading, error: queryError } = useGetGiftDetailQuery(giftId ?? skipToken)
  const [setStatusMutation, { isLoading: isSettingStatus }] =
    useSetGiftStatusMutation()
  const [deleteGiftMutation] = useDeleteGiftMutation()

  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load gift.') : null

  async function setStatus(status: GiftStatus) {
    if (!giftId) return
    await setStatusMutation({ id: giftId, status }).unwrap()
  }

  async function remove() {
    if (!giftId) return
    await deleteGiftMutation(giftId).unwrap()
  }

  return { gift, isLoading, error, setStatus, remove, isSettingStatus }
}
