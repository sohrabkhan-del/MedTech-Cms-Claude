import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { DealerListPage } from '@/pages/dealers/DealerListPage'
import { DealerDetailsPage } from '@/pages/dealers/DealerDetailsPage'
import { DealerFormPage } from '@/pages/dealers/DealerFormPage'
import { ChemistListPage } from '@/pages/chemists/ChemistListPage'
import { ChemistDetailsPage } from '@/pages/chemists/ChemistDetailsPage'
import { ChemistFormPage } from '@/pages/chemists/ChemistFormPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { routeEntries, registerDetailRoute } from '@/routes/routeConfig'
import { getDealerById } from '@/features/dealers/mockDealers'
import { getChemistById } from '@/features/chemists/mockChemists'

const CUSTOM_PATHS = new Set(['/dashboard', '/partners/dealers', '/partners/chemists'])

registerDetailRoute({
  parentPath: '/partners/dealers',
  resolveEntityName: (id) => getDealerById(id)?.shopName,
})
registerDetailRoute({
  parentPath: '/partners/chemists',
  resolveEntityName: (id) => getChemistById(id)?.shopName,
})

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/partners/dealers" element={<DealerListPage />} />
        <Route path="/partners/dealers/new" element={<DealerFormPage />} />
        <Route path="/partners/dealers/:dealerId" element={<DealerDetailsPage />} />
        <Route path="/partners/dealers/:dealerId/edit" element={<DealerFormPage />} />
        <Route path="/partners/chemists" element={<ChemistListPage />} />
        <Route path="/partners/chemists/new" element={<ChemistFormPage />} />
        <Route path="/partners/chemists/:chemistId" element={<ChemistDetailsPage />} />
        <Route path="/partners/chemists/:chemistId/edit" element={<ChemistFormPage />} />
        {routeEntries
          .filter((entry) => !CUSTOM_PATHS.has(entry.path))
          .map((entry) => (
            <Route
              key={entry.path}
              path={entry.path}
              element={<PlaceholderPage title={entry.breadcrumbLabel} pending={entry.pending} />}
            />
          ))}
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
