import { useEffect } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function LogoutPage() {
  const { logout } = useAuth()

  useEffect(() => {
    logout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
