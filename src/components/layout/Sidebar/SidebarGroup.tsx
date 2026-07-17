import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Box, Collapse, List, Stack, Typography } from '@mui/material'
import { ChevronDown } from 'lucide-react'
import type { MenuGroup } from '@/components/layout/Sidebar/menuConfig'
import { SidebarItem } from '@/components/layout/Sidebar/SidebarItem'
import type { SidebarPalette } from '@/components/layout/Sidebar/sidebarPalettes'
import { transitions } from '@/theme/tokens'

interface SidebarGroupProps {
  group: MenuGroup
  railMode: boolean
  palette: SidebarPalette
}

function isGroupActive(group: MenuGroup, pathname: string): boolean {
  return group.items.some(
    (item) =>
      item.path === pathname ||
      item.children?.some((child) => child.path === pathname),
  )
}

export function SidebarGroup({ group, railMode, palette }: SidebarGroupProps) {
  const location = useLocation()
  const [open, setOpen] = useState(() =>
    isGroupActive(group, location.pathname),
  )

  const isCollapsible = group.collapsible && !railMode

  return (
    <Box sx={{ mb: railMode ? 1 : 1.5 }}>
      {!railMode && (
        <Stack
          direction="row"
          onClick={isCollapsible ? () => setOpen((prev) => !prev) : undefined}
          sx={{
            alignItems: 'center',
            px: 2.5,
            pt: 1,
            pb: 0.5,
            cursor: isCollapsible ? 'pointer' : 'default',
            userSelect: 'none',
          }}
        >
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: 'center', flexGrow: 1 }}
          >
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.04em',
                fontSize: '0.6875rem',
                color: palette.textDisabled,
              }}
            >
              {group.groupLabel}
            </Typography>
          </Stack>
          {isCollapsible && (
            <ChevronDown
              size={14}
              style={{
                color: palette.textDisabled,
                transition: `transform ${transitions.base}`,
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          )}
        </Stack>
      )}
      <Collapse
        in={!isCollapsible || open}
        timeout="auto"
        unmountOnExit={false}
      >
        <List disablePadding>
          {group.items.map((item) => (
            <SidebarItem
              key={item.path ?? item.label}
              item={item}
              railMode={railMode}
              palette={palette}
            />
          ))}
        </List>
      </Collapse>
    </Box>
  )
}
