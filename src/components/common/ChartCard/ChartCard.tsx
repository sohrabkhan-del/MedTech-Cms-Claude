import type { ReactNode } from 'react'
import { Box, Card, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import RefreshIcon from '@mui/icons-material/Refresh'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'

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
      <Box sx={{ px: 2, pb: 2, height }}>{children}</Box>
    </Card>
  )
}
