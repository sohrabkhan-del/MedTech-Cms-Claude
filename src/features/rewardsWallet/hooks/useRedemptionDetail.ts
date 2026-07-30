import { useEffect, useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import {
  useGetRedemptionDetailQuery,
  useSetRedemptionStatusMutation,
  useSetDeliveryStatusMutation,
} from '@/features/rewardsWallet/services/redemptionsApi'
import type { RedemptionStatus, RedemptionDeliveryStatus } from '@/features/rewardsWallet/types/rewardsWallet.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useRedemptionDetail(requestId: string | undefined) {
  const [statusOverride, setStatusOverride] = useState<RedemptionStatus | null>(null)
  const [deliveryOverride, setDeliveryOverride] = useState<RedemptionDeliveryStatus | null>(null)

  const { data: request, isLoading, error: queryError } = useGetRedemptionDetailQuery(requestId ?? skipToken)
  const [setRedemptionStatusMutation] = useSetRedemptionStatusMutation()
  const [setDeliveryStatusMutation] = useSetDeliveryStatusMutation()

  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load redemption request.') : null

  useEffect(() => {
    setStatusOverride(null)
    setDeliveryOverride(null)
  }, [requestId])

  async function setStatus(status: RedemptionStatus) {
    if (!requestId) return
    await setRedemptionStatusMutation({ id: requestId, status }).unwrap()
    setStatusOverride(status)
  }

  async function setDeliveryStatus(status: RedemptionDeliveryStatus) {
    if (!requestId) return
    await setDeliveryStatusMutation({ id: requestId, status }).unwrap()
    if (status === 'delivered') {
      await setRedemptionStatusMutation({ id: requestId, status: 'completed' }).unwrap()
      setDeliveryOverride(status)
      setStatusOverride('completed')
      return
    }
    setDeliveryOverride(status)
  }

  const resolvedRequest =
    request && (statusOverride || deliveryOverride)
      ? {
          ...request,
          redemptionStatus: statusOverride ?? request.redemptionStatus,
          deliveryStatus: deliveryOverride ?? request.deliveryStatus,
        }
      : request

  return {
    request: resolvedRequest,
    statusOverride,
    deliveryOverride,
    isLoading,
    error,
    setStatus,
    setDeliveryStatus,
  }
}
