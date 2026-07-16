import type { SidebarVariant } from '@/contexts/AppearanceContext'

export interface SidebarPalette {
  background: string
  divider: string
  textPrimary: string
  textSecondary: string
  textDisabled: string
  hoverBackground: string
  activeBackground: string
  activeIconColor: string
  brandLogo: 'default' | 'invert'
}

export const sidebarPalettes: Record<SidebarVariant, SidebarPalette> = {
  light: {
    background: '#FFFFFF',
    divider: '#E5E5E5',
    textPrimary: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textDisabled: '#9CA3AF',
    hoverBackground: '#F5F5F5',
    activeBackground: 'linear-gradient(90deg, rgba(26,62,140,0.10) 0%, rgba(26,62,140,0.03) 100%)',
    activeIconColor: '#1A3E8C',
    brandLogo: 'default',
  },
  dark: {
    background: '#141A2E',
    divider: 'rgba(255,255,255,0.08)',
    textPrimary: '#F5F6FA',
    textSecondary: '#A6ACC2',
    textDisabled: '#5C6280',
    hoverBackground: 'rgba(255,255,255,0.06)',
    activeBackground: 'linear-gradient(90deg, rgba(90,130,246,0.22) 0%, rgba(90,130,246,0.06) 100%)',
    activeIconColor: '#7C9CFF',
    brandLogo: 'invert',
  },
}
