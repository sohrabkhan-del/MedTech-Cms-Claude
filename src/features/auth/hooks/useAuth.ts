import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { logout as logoutAction } from '@/features/auth/slices/authSlice'
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from '@/features/auth/slices/authSelectors'
import { useToast } from '@/contexts/ToastContext'

export function useAuth() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  function logout() {
    dispatch(logoutAction())
    toast.info('Your session has been cleared.', 'Signed out')
    navigate('/login', { replace: true })
  }

  return { user, isAuthenticated, logout }
}
