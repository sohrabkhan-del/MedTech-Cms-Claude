import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/features/auth/services/authService'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { setCredentials } from '@/features/auth/slices/authSlice'
import { selectAuth } from '@/features/auth/slices/authSelectors'

export function useFirstLoginReset() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { pendingEmail, tempPassword } = useAppSelector(selectAuth)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function resetPassword(newPassword: string) {
    if (!pendingEmail || !tempPassword) {
      setError('Your session has expired. Please sign in again.')
      navigate('/login')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.firstLoginReset({
        email: pendingEmail,
        tempPassword,
        newPassword,
      })
      dispatch(setCredentials(response))
      navigate('/dashboard')
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Unable to reset password. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return { resetPassword, pendingEmail, isLoading, error }
}
