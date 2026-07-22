import type { ReactNode } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/app/store'
import { AppearanceProvider } from '@/contexts/AppearanceContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { AppThemeProvider } from '@/theme/ThemeProvider'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppearanceProvider>
          <AppThemeProvider>
            <ToastProvider>{children}</ToastProvider>
          </AppThemeProvider>
        </AppearanceProvider>
      </PersistGate>
    </ReduxProvider>
  )
}
