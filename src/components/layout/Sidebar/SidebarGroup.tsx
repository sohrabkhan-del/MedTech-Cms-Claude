import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Box, Collapse, List, Stack, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { MenuGroup, MenuItem } from '@/components/layout/Sidebar/menuConfig'
import { SidebarItem } from '@/components/layout/Sidebar/SidebarItem'
import { sidebarPalettes, type SidebarPalette } from '@/components/layout/Sidebar/sidebarPalettes'
import { transitions } from '@/theme/tokens'

function isItemActive(item: MenuItem, pathname: string): boolean {
  if (item.path === pathname) return true
  return item.children?.some((child) => isItemActive(child, pathname)) ?? false
}

function isGroupActive(group: MenuGroup, pathname: string): boolean {
  return group.items.some((item) => isItemActive(item, pathname))
}

interface SidebarGroupProps {
  group: MenuGroup
  railMode: boolean
  palette: SidebarPalette
}

export function SidebarGroup({ group, railMode, palette }: SidebarGroupProps) {
  const location = useLocation()
  const active = isGroupActive(group, location.pathname)
  const [open, setOpen] = useState(active)

  if (railMode) {
    return (
      <Box sx={{ mb: 0.5 }}>
        <List disablePadding>
          {group.items.map((item) => (
            <SidebarItem key={item.path ?? item.label} item={item} railMode={railMode} palette={palette} />
          ))}
        </List>
      </Box>
    )
  }

  return (
    <Box sx={{ mb: 0.5 }}>
      <Stack
        component="button"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          px: 2.5,
          pt: 1.25,
          pb: 0.375,
          fontFamily: 'inherit',
          '&:hover .sidebar-group-label': { color: palette.textSecondary },
        }}
      >
        <Typography
          className="sidebar-group-label"
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.04em',
            fontSize: '0.6875rem',
            color: palette.textDisabled,
            transition: `color ${transitions.base}`,
          }}
        >
          {group.groupLabel}
        </Typography>
        <ExpandMoreIcon
          sx={{
            fontSize: 16,
            color: palette.textDisabled,
            transition: `transform ${transitions.base}`,
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}
        />
      </Stack>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List disablePadding>
          {group.items.map((item) => (
            <SidebarItem key={item.path ?? item.label} item={item} railMode={railMode} palette={palette} />
          ))}
        </List>
      </Collapse>
    </Box>
  )
}
