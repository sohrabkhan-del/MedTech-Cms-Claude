import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppRouter } from '@/app/router/AppRouter'

const router = createBrowserRouter([{ path: '*', element: <AppRouter /> }])

export function AppRouterProvider() {
  return <RouterProvider router={router} />
}
