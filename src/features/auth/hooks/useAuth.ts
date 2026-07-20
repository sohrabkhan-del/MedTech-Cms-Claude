import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { logout as logoutAction } from '@/features/auth/slices/authSlice'
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/slices/authSelectors'

export function useAuth() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  function logout() {
    dispatch(logoutAction())
    navigate('/login', { replace: true })
  }

  return { user, isAuthenticated, logout }
}
