import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/features/auth/services/authService'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import { useAppDispatch } from '@/app/store/hooks'
import {
  setCredentials,
  setLoginFlowData,
} from '@/features/auth/slices/authSlice'
import type { LoginRequest } from '@/features/auth/types/auth.types'
import { useToast } from '@/contexts/ToastContext'

export function useLoginService() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function login(payload: LoginRequest) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.login(payload)

      if (response.isFirstLogin) {
        toast.info(
          'Please set a new password to continue.',
          'Password reset required',
        )
        dispatch(
          setLoginFlowData({
            email: payload.email,
            tempPassword: response.tempPassword ?? payload.password,
            resetRequired: true,
          }),
        )
        navigate('/first-login-reset')
        return
      }

      if (!response.token || !response.refreshToken || !response.user) {
        throw new Error('Login response is missing session data.')
      }

      dispatch(
        setCredentials({
          token: response.token,
          refreshToken: response.refreshToken,
          user: response.user,
        }),
      )
      toast.success(`Welcome back, ${response.user.name}.`, 'Signed in')
      navigate('/dashboard')
    } catch (err) {
      const message = getAuthErrorMessage(
        err,
        'Unable to sign in. Please try again.',
      )
      setError(message)
      toast.error(message, 'Sign in failed')
    } finally {
      setIsLoading(false)
    }
  }

  return { login, isLoading, error }
}
