import type { RouteObject } from 'react-router-dom'
import { AppearanceSettingsPage } from '@/features/settings/pages/AppearanceSettingsPage'

// Register under <ProtectedRoute /> + <DashboardLayout />.
//
// Only General Settings (Appearance) is a real page today. Notification
// Settings, Authentication Settings, and Profile are intentionally left as
// PENDING_PATHS in src/routes/routeConfig.ts, rendered by the generic
// PlaceholderPage fallback in AppRouter.tsx until their requirements are
// scoped — do not add routes for them here.
//
// Logout is an action, not a page: it's wired to the auth slice's logout()
// via src/pages/auth/LogoutPage.tsx (registered directly in AppRouter.tsx
// as a public `/logout` route, outside this settings module) and triggered
// from the sidebar's UserFooterCard menu item.
export const settingsRoutes: RouteObject[] = [{ path: '/settings/general', element: <AppearanceSettingsPage /> }]
