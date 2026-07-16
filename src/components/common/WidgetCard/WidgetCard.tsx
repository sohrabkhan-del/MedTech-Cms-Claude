import type { ReactNode } from 'react'
import { useState } from 'react'
import { Box, Card, Divider, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { MoreVertical, RefreshCw, Download } from 'lucide-react'

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
              <MoreVertical size={20} />
            </IconButton>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
              {onRefresh && (
                <MenuItem
                  onClick={() => {
                    onRefresh()
                    setAnchorEl(null)
                  }}
                >
                  <RefreshCw size={20} style={{ marginRight: 12 }} />
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
                  <Download size={20} style={{ marginRight: 12 }} />
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
