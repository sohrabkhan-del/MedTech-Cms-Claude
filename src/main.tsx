import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppThemeProvider } from '@/theme/ThemeProvider'
import { AppearanceProvider } from '@/contexts/AppearanceContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppearanceProvider>
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    </AppearanceProvider>
  </StrictMode>,
)
