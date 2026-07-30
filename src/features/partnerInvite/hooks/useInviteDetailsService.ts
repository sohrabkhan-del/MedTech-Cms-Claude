import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSendOtpMutation, useVerifyOtpMutation } from '@/features/partnerInvite/services/partnerInviteApi'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import { usePartnerInvite } from '@/features/partnerInvite/PartnerInviteContext'
import type { PartnerInviteBasicDetails } from '@/types/partnerInvite'

export function useInviteDetailsService() {
  const navigate = useNavigate()
  const { token, setBasicDetails } = usePartnerInvite()
  const [pendingDetails, setPendingDetails] = useState<PartnerInviteBasicDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendOtpMutation] = useSendOtpMutation()
  const [verifyOtpMutation] = useVerifyOtpMutation()

  async function sendOtp(details: PartnerInviteBasicDetails) {
    setIsLoading(true)
    setError(null)
    try {
      await sendOtpMutation(details).unwrap()
      setPendingDetails(details)
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Unable to send OTP. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  async function resendOtp() {
    if (!pendingDetails) return
    setIsLoading(true)
    setError(null)
    try {
      await sendOtpMutation(pendingDetails).unwrap()
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Unable to resend OTP. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  async function verifyOtp(otp: string) {
    if (!pendingDetails) return
    setIsLoading(true)
    setError(null)
    try {
      await verifyOtpMutation({ email: pendingDetails.email, otp }).unwrap()
      setBasicDetails(pendingDetails)
      navigate(`/invite/${token}/password`)
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Invalid OTP. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return { pendingDetails, sendOtp, resendOtp, verifyOtp, isLoading, error }
}
