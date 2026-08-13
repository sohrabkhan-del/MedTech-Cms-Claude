import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/features/auth/services/authService'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { setPasswordResetOtpId } from '@/features/auth/slices/authSlice'
import {
  selectPasswordResetEmail,
  selectPasswordResetPhone,
} from '@/features/auth/slices/authSelectors'

export function useResetOtpService() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const passwordResetEmail = useAppSelector(selectPasswordResetEmail)
  const passwordResetPhone = useAppSelector(selectPasswordResetPhone)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function verifyResetOtp(otp: string) {
    if (!passwordResetEmail) {
      setError('Your session has expired. Please start again.')
      navigate('/forgot-password')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.verifyResetOtp({
        userType: 'ADMIN',
        email: passwordResetEmail,
        phone: passwordResetPhone ?? undefined,
        purpose: 'FORGOT_PASSWORD',
        otp,
      })
      dispatch(setPasswordResetOtpId(response.otpId))
      navigate('/reset-password')
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Invalid or expired code. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  async function resendOtp() {
    if (!passwordResetEmail) {
      setError('Your session has expired. Please start again.')
      navigate('/forgot-password')
      return
    }

    setIsResending(true)
    setError(null)

    try {
      await authService.resendOtp({
        purpose: 'FORGOT_PASSWORD',
        userType: 'ADMIN',
        email: passwordResetEmail,
        phone: passwordResetPhone ?? undefined,
      })
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Unable to resend code. Please try again.'))
    } finally {
      setIsResending(false)
    }
  }

  return {
    verifyResetOtp,
    resendOtp,
    passwordResetEmail,
    isLoading,
    isResending,
    error,
  }
}
