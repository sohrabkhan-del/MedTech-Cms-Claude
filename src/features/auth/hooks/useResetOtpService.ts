import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/features/auth/services/authService'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { setPasswordResetToken } from '@/features/auth/slices/authSlice'
import { selectPasswordResetEmail } from '@/features/auth/slices/authSelectors'

export function useResetOtpService() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const passwordResetEmail = useAppSelector(selectPasswordResetEmail)
  const [isLoading, setIsLoading] = useState(false)
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
      const response = await authService.verifyResetOtp({ email: passwordResetEmail, otp })
      dispatch(setPasswordResetToken(response.resetToken))
      navigate('/reset-password')
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Invalid or expired code. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return { verifyResetOtp, passwordResetEmail, isLoading, error }
}
