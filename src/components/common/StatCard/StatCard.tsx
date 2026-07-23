import type { ReactNode } from 'react'
import { Box, Card, CardContent, Stack, Tooltip, Typography } from '@mui/material'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { radius, shadows, transitions } from '@/theme/tokens'

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  iconColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  trend?: {
    direction: 'up' | 'down'
    value: string
    caption?: string
  }
  onClick?: () => void
}

export function StatCard({ label, value, icon, iconColor = 'primary', trend, onClick }: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          boxShadow: shadows.cardHover,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Tooltip title={label}>
            <Typography
              variant="caption"
              noWrap
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontWeight: 600,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {label}
            </Typography>
          </Tooltip>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: `${radius.md}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${iconColor}.light`,
              color: `${iconColor}.main`,
              flexShrink: 0,
              transition: `transform ${transitions.base}`,
              '.MuiCard-root:hover &': {
                transform: 'scale(1.05)',
              },
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Tooltip title={value}>
          <Typography
            noWrap
            sx={{
              fontWeight: 700,
              fontSize: '1.375rem',
              lineHeight: 1.2,
              color: 'text.primary',
              mb: trend ? 0.5 : 0,
            }}
          >
            {value}
          </Typography>
        </Tooltip>

        {trend && (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Stack
              direction="row"
              spacing={0.25}
              sx={{
                alignItems: 'center',
                color: trend.direction === 'up' ? 'success.main' : 'error.main',
                backgroundColor: trend.direction === 'up' ? 'success.light' : 'error.light',
                borderRadius: '999px',
                px: 0.75,
                py: 0.25,
              }}
            >
              {trend.direction === 'up' ? (
                <ArrowUp size={12} />
              ) : (
                <ArrowDown size={12} />
              )}
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>{trend.value}</Typography>
            </Stack>
            {trend.caption && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {trend.caption}
              </Typography>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
