import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/features/auth/services/authService'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { setCredentials } from '@/features/auth/slices/authSlice'
import { selectPendingEmail } from '@/features/auth/slices/authSelectors'

export function useOtpService() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const pendingEmail = useAppSelector(selectPendingEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function verifyOtp(otp: string) {
    if (!pendingEmail) {
      setError('Your session has expired. Please sign in again.')
      navigate('/login')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.verifyOtp({ email: pendingEmail, otp })
      dispatch(setCredentials(response))
      navigate('/dashboard')
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Invalid OTP. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return { verifyOtp, pendingEmail, isLoading, error }
}
