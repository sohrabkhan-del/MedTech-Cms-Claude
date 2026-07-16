import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_FONT } from '@/theme/googleFonts'

export type SidebarVariant = 'light' | 'dark'

const FONT_STORAGE_KEY = 'medtech-cms:appearance:font'
const SIDEBAR_VARIANT_STORAGE_KEY = 'medtech-cms:appearance:sidebar-variant'

function readStored(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage unavailable (private mode, quota) — preference just won't persist
  }
}

interface AppearanceContextValue {
  fontFamily: string
  setFontFamily: (font: string) => void
  sidebarVariant: SidebarVariant
  setSidebarVariant: (variant: SidebarVariant) => void
}

const AppearanceContext = createContext<AppearanceContextValue | undefined>(undefined)

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [fontFamily, setFontFamilyState] = useState(() => readStored(FONT_STORAGE_KEY, DEFAULT_FONT))
  const [sidebarVariant, setSidebarVariantState] = useState<SidebarVariant>(
    () => readStored(SIDEBAR_VARIANT_STORAGE_KEY, 'light') as SidebarVariant,
  )

  const setFontFamily = (font: string) => {
    setFontFamilyState(font)
    writeStored(FONT_STORAGE_KEY, font)
  }

  const setSidebarVariant = (variant: SidebarVariant) => {
    setSidebarVariantState(variant)
    writeStored(SIDEBAR_VARIANT_STORAGE_KEY, variant)
  }

  const value = useMemo(
    () => ({ fontFamily, setFontFamily, sidebarVariant, setSidebarVariant }),
    [fontFamily, sidebarVariant],
  )

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext)
  if (!ctx) throw new Error('useAppearance must be used within an AppearanceProvider')
  return ctx
}
