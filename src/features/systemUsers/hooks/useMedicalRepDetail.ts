import { skipToken } from '@reduxjs/toolkit/query/react'
import { useToast } from '@/contexts/ToastContext'
import {
  useGetMedicalRepDetailQuery,
  useGetReplacementMrsQuery,
  useSetMedicalRepStatusMutation,
  useDeleteMedicalRepMutation,
} from '@/features/systemUsers/services/medicalRepsApi'
import type { PartnerStatus } from '@/features/systemUsers/types/systemUsers.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useMedicalRepDetail(mrId: string | undefined) {
  const toast = useToast()

  const { data: mr, isLoading: isMrLoading, error: mrQueryError } = useGetMedicalRepDetailQuery(mrId ?? skipToken)
  const { data: replacementOptions, isLoading: isReplacementLoading } = useGetReplacementMrsQuery(
    mr ? { region: mr.region, excludeId: mr.id } : skipToken,
  )
  const [setStatusMutation] = useSetMedicalRepStatusMutation()
  const [deleteMrMutation] = useDeleteMedicalRepMutation()

  const isLoading = isMrLoading || (!!mr && isReplacementLoading)
  const error = mrQueryError ? getApiErrorMessage(mrQueryError, 'Failed to load medical representative.') : null

  async function setStatus(status: PartnerStatus) {
    if (!mrId) return
    await setStatusMutation({ id: mrId, status }).unwrap()
  }

  async function remove(replacementMrId: string) {
    if (!mrId) return
    try {
      await deleteMrMutation({ id: mrId, replacementMrId }).unwrap()
      toast.success('Medical rep deleted successfully.')
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to delete medical representative.')
      toast.error(message)
    }
  }

  return { mr, replacementOptions: replacementOptions ?? [], isLoading, error, setStatus, remove }
}
