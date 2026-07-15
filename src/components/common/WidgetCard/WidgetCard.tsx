import type { ReactNode } from 'react'
import { useState } from 'react'
import { Box, Card, Divider, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import RefreshIcon from '@mui/icons-material/Refresh'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'

interface WidgetCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  onRefresh?: () => void
  onExport?: () => void
}

export function WidgetCard({ title, subtitle, children, footer, onRefresh, onExport }: WidgetCardProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const hasMenu = !!(onRefresh || onExport)

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', px: 3, pt: 2.5, pb: 1.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>{title}</Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {hasMenu && (
          <>
            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} aria-label={`${title} actions`}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
              {onRefresh && (
                <MenuItem
                  onClick={() => {
                    onRefresh()
                    setAnchorEl(null)
                  }}
                >
                  <RefreshIcon fontSize="small" sx={{ mr: 1.5 }} />
                  Refresh
                </MenuItem>
              )}
              {onExport && (
                <MenuItem
                  onClick={() => {
                    onExport()
                    setAnchorEl(null)
                  }}
                >
                  <DownloadOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
                  Export
                </MenuItem>
              )}
            </Menu>
          </>
        )}
      </Stack>

      <Box sx={{ flexGrow: 1, px: 3, pb: footer ? 1.5 : 2.5 }}>{children}</Box>

      {footer && (
        <>
          <Divider />
          <Box sx={{ px: 3, py: 1.5 }}>{footer}</Box>
        </>
      )}
    </Card>
  )
}
