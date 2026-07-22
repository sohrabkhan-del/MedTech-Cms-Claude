import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/features/auth/services/authService'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import { useAppDispatch } from '@/app/store/hooks'
import { setPasswordResetEmail } from '@/features/auth/slices/authSlice'

export function useForgotPasswordService() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function requestReset(email: string) {
    setIsLoading(true)
    setError(null)

    try {
      await authService.forgotPassword({ email })
      dispatch(setPasswordResetEmail(email))
      navigate('/reset-otp')
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Unable to send reset code. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return { requestReset, isLoading, error }
}
