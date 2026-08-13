import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/features/auth/services/authService'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { clearPasswordReset } from '@/features/auth/slices/authSlice'
import {
  selectPasswordResetEmail,
  selectPasswordResetOtpId,
} from '@/features/auth/slices/authSelectors'

export function useResetPasswordService() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const passwordResetEmail = useAppSelector(selectPasswordResetEmail)
  const passwordResetOtpId = useAppSelector(selectPasswordResetOtpId)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function resetPassword(newPassword: string, confirmPassword: string) {
    if (!passwordResetOtpId) {
      setError('Your session has expired. Please start again.')
      navigate('/forgot-password')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await authService.resetPassword({
        otpId: passwordResetOtpId,
        userType: 'ADMIN',
        password: newPassword,
        confirmPassword,
      })
      dispatch(clearPasswordReset())
      navigate('/login', { state: { passwordResetSuccess: true } })
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Unable to reset password. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return { resetPassword, passwordResetEmail, isLoading, error }
}
