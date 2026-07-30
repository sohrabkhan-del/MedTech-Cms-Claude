import { useEffect, useRef, useState } from 'react'
import { Box, Button, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { ChevronDown, Menu as MenuIcon, X } from 'lucide-react'
import { radius, shadows } from '@/theme/tokens'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `// Built from MUI primitives (Stack + Button + Menu) — there is no dedicated
// top-nav "Navbar" component in the codebase today; the app's own Header
// (src/components/layout/Header/Header.tsx) only renders utility icons and
// pairs with the Sidebar for navigation instead of nav links.

<Stack direction="row" sx={{ position: 'sticky', top: 0 }}>
  <Typography sx={{ fontWeight: 700 }}>Brand</Typography>
  <Button onClick={(e) => setAnchor(e.currentTarget)}>
    Products <ChevronDown size={14} />
  </Button>
  <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
    <MenuItem>Product Master</MenuItem>
  </Menu>
</Stack>`

const NAV_LINKS = ['Dashboard', 'Reports', 'Wallet']

function BrandMark() {
  return (
    <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'primary.main' }}>
      MEDTECH
    </Typography>
  )
}

function DropdownNav() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return (
    <>
      <Button
        onClick={(e) => setAnchor(e.currentTarget)}
        endIcon={<ChevronDown size={14} />}
        sx={{ color: 'text.primary', fontWeight: 600 }}
      >
        Products
      </Button>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => setAnchor(null)}>Product Master</MenuItem>
        <MenuItem onClick={() => setAnchor(null)}>Gift Catalogue</MenuItem>
        <MenuItem onClick={() => setAnchor(null)}>Marketing Catalogue</MenuItem>
      </Menu>
    </>
  )
}

export function NavbarDemo() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const scrollBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollBoxRef.current
    if (!el) return
    const onScroll = () => setScrolled(el.scrollTop > 8)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Stack spacing={4}>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        The app itself uses a sidebar for primary navigation rather than a top navbar — this demo builds a standalone
        top-nav pattern from the same primitives (Stack, Button, Menu) for reference, matching the app's card/shadow styling.
      </Typography>

      <DemoSection title="Default" description="Brand + inline links, no dropdown.">
        <Box sx={{ width: '100%' }}>
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              py: 1.5,
              borderRadius: `${radius.xl}px`,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <BrandMark />
            <Stack direction="row" spacing={1}>
              {NAV_LINKS.map((link) => (
                <Button key={link} sx={{ color: 'text.primary', fontWeight: 600 }}>
                  {link}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Box>
      </DemoSection>

      <DemoSection title="With dropdown menu" description="A nav item that opens a MUI Menu of sub-links.">
        <Box sx={{ width: '100%' }}>
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              py: 1.5,
              borderRadius: `${radius.xl}px`,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <BrandMark />
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Button sx={{ color: 'text.primary', fontWeight: 600 }}>Dashboard</Button>
              <DropdownNav />
            </Stack>
          </Stack>
        </Box>
      </DemoSection>

      <DemoSection title="Sticky / scrolled state" description="Scroll inside the box below — the navbar gains a shadow once scrolled, like the app's Header.">
        <Box
          ref={scrollBoxRef}
          sx={{
            width: '100%',
            height: 220,
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: `${radius.md}px`,
          }}
        >
          <Stack
            direction="row"
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              py: 1.5,
              backgroundColor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              boxShadow: scrolled ? shadows.card : 'none',
              transition: 'box-shadow 150ms ease',
            }}
          >
            <BrandMark />
            <Typography variant="caption" sx={{ color: scrolled ? 'primary.main' : 'text.secondary', fontWeight: 700 }}>
              {scrolled ? 'Scrolled' : 'At top'}
            </Typography>
          </Stack>
          <Stack spacing={2} sx={{ p: 3 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Typography key={i} variant="body1" sx={{ color: 'text.secondary' }}>
                Scroll content row {i + 1} — keep scrolling to see the sticky navbar pick up a shadow.
              </Typography>
            ))}
          </Stack>
        </Box>
      </DemoSection>

      <DemoSection title="Mobile responsive (hamburger)" description="Below the sm breakpoint, links collapse behind a hamburger toggle.">
        <Box sx={{ width: '100%', maxWidth: 360 }}>
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              borderRadius: `${radius.xl}px`,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <BrandMark />
            <IconButton size="small" onClick={() => setMobileOpen((prev) => !prev)} aria-label="Toggle navigation">
              {mobileOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </IconButton>
          </Stack>
          {mobileOpen && (
            <Stack
              spacing={0.5}
              sx={{
                mt: 1,
                p: 1,
                borderRadius: `${radius.lg}px`,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}
            >
              {NAV_LINKS.map((link) => (
                <Button key={link} sx={{ justifyContent: 'flex-start', color: 'text.primary', fontWeight: 600 }}>
                  {link}
                </Button>
              ))}
            </Stack>
          )}
        </Box>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Notes">
        <PropsTable
          rows={[
            { name: '(none)', type: '—', description: 'This is a composed pattern, not a single reusable component — assemble from Stack/Button/Menu/IconButton as shown above.' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
