import type { RouteObject } from 'react-router-dom'
import { ChemistListPage } from '@/pages/chemists/ChemistListPage'
import { ChemistDetailsPage } from '@/pages/chemists/ChemistDetailsPage'
import { ChemistFormPage } from '@/pages/chemists/ChemistFormPage'

export const chemistRoutes: RouteObject[] = [
  { path: '/partners/chemists', element: <ChemistListPage /> },
  { path: '/partners/chemists/new', element: <ChemistFormPage /> },
  { path: '/partners/chemists/:chemistId', element: <ChemistDetailsPage /> },
  { path: '/partners/chemists/:chemistId/edit', element: <ChemistFormPage /> },
]
