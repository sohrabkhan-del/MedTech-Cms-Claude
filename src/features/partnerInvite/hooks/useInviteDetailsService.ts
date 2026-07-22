import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { partnerInviteService } from '@/features/partnerInvite/services/partnerInviteService'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import { usePartnerInvite } from '@/features/partnerInvite/PartnerInviteContext'
import type { PartnerInviteBasicDetails } from '@/types/partnerInvite'

export function useInviteDetailsService() {
  const navigate = useNavigate()
  const { token, setBasicDetails } = usePartnerInvite()
  const [phase, setPhase] = useState<'details' | 'otp'>('details')
  const [pendingDetails, setPendingDetails] = useState<PartnerInviteBasicDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendOtp(details: PartnerInviteBasicDetails) {
    setIsLoading(true)
    setError(null)
    try {
      await partnerInviteService.sendOtp(details)
      setPendingDetails(details)
      setPhase('otp')
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Unable to send OTP. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  async function verifyOtp(otp: string) {
    if (!pendingDetails) return
    setIsLoading(true)
    setError(null)
    try {
      await partnerInviteService.verifyOtp(pendingDetails.email, otp)
      setBasicDetails(pendingDetails)
      navigate(`/invite/${token}/password`)
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Invalid OTP. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  function editDetails() {
    setPhase('details')
    setError(null)
  }

  return { phase, pendingDetails, sendOtp, verifyOtp, editDetails, isLoading, error }
}
