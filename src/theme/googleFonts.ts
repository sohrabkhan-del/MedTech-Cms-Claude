export interface GoogleFontOption {
  label: string
  value: string
  /** CSS font-family stack, used directly in theme.typography.fontFamily. */
  stack: string
  /** Google Fonts family param, e.g. "Plus+Jakarta+Sans". Omitted for the pre-bundled default. */
  googleFamilyParam?: string
}

export const DEFAULT_FONT = 'Inter'

const WEIGHTS = '400;500;600;700'

export const GOOGLE_FONTS: GoogleFontOption[] = [
  {
    label: 'Inter',
    value: 'Inter',
    stack: `'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif`,
  },
  {
    label: 'Roboto',
    value: 'Roboto',
    stack: `'Roboto', 'Inter', Arial, sans-serif`,
    googleFamilyParam: 'Roboto',
  },
  {
    label: 'Poppins',
    value: 'Poppins',
    stack: `'Poppins', 'Inter', Arial, sans-serif`,
    googleFamilyParam: 'Poppins',
  },
  {
    label: 'Titillium Web',
    value: 'Titillium Web',
    stack: `'Titillium Web', 'Inter', Arial, sans-serif`,
    googleFamilyParam: 'Titillium+Web',
  },
  {
    label: 'Nunito Sans',
    value: 'Nunito Sans',
    stack: `'Nunito Sans', 'Inter', Arial, sans-serif`,
    googleFamilyParam: 'Nunito+Sans',
  },
  {
    label: 'Work Sans',
    value: 'Work Sans',
    stack: `'Work Sans', 'Inter', Arial, sans-serif`,
    googleFamilyParam: 'Work+Sans',
  },
  {
    label: 'Manrope',
    value: 'Manrope',
    stack: `'Manrope', 'Inter', Arial, sans-serif`,
    googleFamilyParam: 'Manrope',
  },
  {
    label: 'DM Sans',
    value: 'DM Sans',
    stack: `'DM Sans', 'Inter', Arial, sans-serif`,
    googleFamilyParam: 'DM+Sans',
  },
  {
    label: 'Lato',
    value: 'Lato',
    stack: `'Lato', 'Inter', Arial, sans-serif`,
    googleFamilyParam: 'Lato',
  },
  {
    label: 'Sora',
    value: 'Sora',
    stack: `'Sora', 'Inter', Arial, sans-serif`,
    googleFamilyParam: 'Sora',
  },
  {
    label: 'Plus Jakarta Sans',
    value: 'Plus Jakarta Sans',
    stack: `'Plus Jakarta Sans', 'Inter', Arial, sans-serif`,
    googleFamilyParam: 'Plus+Jakarta+Sans',
  },
]

export function getFontOption(value: string): GoogleFontOption {
  return GOOGLE_FONTS.find((f) => f.value === value) ?? GOOGLE_FONTS[0]!
}

/** Injects a Google Fonts stylesheet link for the given font, once per font per session. */
export function loadGoogleFont(value: string): void {
  const option = getFontOption(value)
  if (!option.googleFamilyParam) return // default font is already bundled via @fontsource

  const linkId = `google-font-${option.value.replace(/\s+/g, '-').toLowerCase()}`
  if (document.getElementById(linkId)) return

  const link = document.createElement('link')
  link.id = linkId
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${option.googleFamilyParam}:wght@${WEIGHTS}&display=swap`
  document.head.appendChild(link)
}
