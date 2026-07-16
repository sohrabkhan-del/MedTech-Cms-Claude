import type { ReactNode } from 'react'
import { Box, Card, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { MoreVertical, RefreshCw, Download } from 'lucide-react'

interface ChartCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  height?: number
  onRefresh?: () => void
  onExport?: () => void
}

export function ChartCard({ title, subtitle, children, height = 320, onRefresh, onExport }: ChartCardProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  return (
    <Card sx={{ height: '100%' }}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', p: 3, pb: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>{title}</Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {(onRefresh || onExport) && (
          <>
            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Chart actions">
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
      <Box sx={{ px: 2, pb: 2, height }}>{children}</Box>
    </Card>
  )
}
