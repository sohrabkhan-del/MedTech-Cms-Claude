import type { RouteObject } from 'react-router-dom'
import { AppearanceSettingsPage } from '@/features/settings/pages/AppearanceSettingsPage'
import { ProfileSettingsPage } from '@/features/settings/pages/ProfileSettingsPage'

// Register under <ProtectedRoute /> + <DashboardLayout />.
//
// General Settings (Appearance) and Profile are real pages today. Notification
// Settings and Authentication Settings are intentionally left as PENDING_PATHS
// in src/routes/routeConfig.ts, rendered by the generic PlaceholderPage
// fallback in AppRouter.tsx until their requirements are scoped — do not add
// routes for them here.
//
// Logout is an action, not a page: it's wired to the auth slice's logout()
// via src/pages/auth/LogoutPage.tsx (registered directly in AppRouter.tsx
// as a public `/logout` route, outside this settings module) and triggered
// from the sidebar's UserFooterCard menu item.
export const settingsRoutes: RouteObject[] = [
  { path: '/settings/general', element: <AppearanceSettingsPage /> },
  { path: '/settings/profile', element: <ProfileSettingsPage /> },
]
