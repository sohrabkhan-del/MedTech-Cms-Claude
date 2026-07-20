import type { RouteObject } from 'react-router-dom'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { OtpPage } from '@/features/auth/pages/OtpPage'
import { FirstLoginResetPage } from '@/features/auth/pages/FirstLoginResetPage'

export const authRoutes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/otp', element: <OtpPage /> },
  { path: '/first-login-reset', element: <FirstLoginResetPage /> },
]
