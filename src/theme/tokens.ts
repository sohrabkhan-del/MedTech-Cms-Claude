export const colors = {
  primary: {
    main: '#1A3E8C',
    dark: '#15326E',
    light: '#E6EBF6',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#F7941D',
    dark: '#E8830A',
    light: '#FDECD5',
    contrastText: '#FFFFFF',
  },
  success: { main: '#1E9E5A', light: '#E6F4EA', contrastText: '#FFFFFF' },
  warning: { main: '#F7941D', light: '#FDF0DA', contrastText: '#5A3D00' },
  error: { main: '#E5484D', light: '#FBE4E5', contrastText: '#FFFFFF' },
  info: { main: '#1A3E8C', light: '#E7ECFB', contrastText: '#FFFFFF' },
  background: { default: '#F5F5F5', paper: '#FFFFFF' },
  divider: '#E5E5E5',
  text: { primary: '#1A1A1A', secondary: '#4A4A4A', disabled: '#9CA3AF' },
} as const

export const shape = { borderRadius: 12 } as const

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
} as const

export const shadows = {
  card: '0px 1px 2px rgba(16,24,40,0.04), 0px 1px 3px rgba(16,24,40,0.06)',
  cardHover: '0px 4px 12px rgba(16,24,40,0.08), 0px 2px 4px rgba(16,24,40,0.06)',
  dropdown: '0px 8px 24px rgba(16,24,40,0.12)',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
} as const

export const typography = {
  fontFamily: `'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif`,
  baseFontSize: 14,
  pageTitle: { fontWeight: 700, fontSize: '1.5rem' },
  h1: { fontWeight: 700, fontSize: '1.5rem' },
  sectionTitle: { fontWeight: 600, fontSize: '1.0625rem' },
  h2: { fontWeight: 600, fontSize: '1.0625rem' },
  cardTitle: { fontWeight: 600, fontSize: '0.8125rem' },
  label: { fontWeight: 500, fontSize: '0.6875rem' },
  body1: { fontWeight: 400, fontSize: '0.8125rem' },
  metric: { fontWeight: 700, fontSize: '1.5rem' },
  statNumber: { fontWeight: 700, fontSize: '1.5rem' },
  caption: { fontWeight: 500, fontSize: '0.6875rem', color: colors.text.secondary },
} as const

export const layout = {
  sidebarWidth: 264,
  sidebarRailWidth: 76,
  headerHeight: 70,
} as const

export const transitions = {
  base: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const
