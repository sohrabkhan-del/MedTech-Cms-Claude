import { Box, List, Stack, Typography } from '@mui/material'
import type { MenuGroup } from '@/components/layout/Sidebar/menuConfig'
import { SidebarItem } from '@/components/layout/Sidebar/SidebarItem'
import type { SidebarPalette } from '@/components/layout/Sidebar/sidebarPalettes'

interface SidebarGroupProps {
  group: MenuGroup
  railMode: boolean
  palette: SidebarPalette
}

export function SidebarGroup({ group, railMode, palette }: SidebarGroupProps) {
  const GroupIcon = group.icon

  return (
    <Box sx={{ mb: railMode ? 1 : 1.5 }}>
      {!railMode && (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', px: 2.5, pt: 1, pb: 0.5 }}>
          {GroupIcon && <GroupIcon sx={{ fontSize: 13, color: palette.textDisabled }} />}
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
      )}
      <List disablePadding>
        {group.items.map((item) => (
          <SidebarItem key={item.path ?? item.label} item={item} railMode={railMode} palette={palette} />
        ))}
      </List>
    </Box>
  )
}
